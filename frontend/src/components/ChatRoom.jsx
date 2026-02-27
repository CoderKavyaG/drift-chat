import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useChat } from "../hooks/useChat";
import VideoPanel from "./VideoPanel";
import ChatPanel from "./ChatPanel";
import Controls from "./Controls";
import StatusBar from "./StatusBar";

/**
 * ChatRoom
 * The main orchestrator for a chat session.
 * Manages: socket events, WebRTC peer, local media, UI state.
 */
export default function ChatRoom({ onStop }) {
    // ── Connection State ─────────────────────────────────────────────────────
    const [appState, setAppState] = useState("waiting"); // waiting | chatting
    const [roomId, setRoomId] = useState(null);
    const [isInitiator, setIsInitiator] = useState(false);
    const [statusText, setStatusText] = useState("waiting");
    const [partnerLeft, setPartnerLeft] = useState(false);
    const [waitingTooLong, setWaitingTooLong] = useState(false);
    const waitingTimerRef = useRef(null);

    // ── Media State ──────────────────────────────────────────────────────────
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [mediaError, setMediaError] = useState(null);
    const [webrtcError, setWebrtcError] = useState(null);

    // ── UI overlay ───────────────────────────────────────────────────────────
    const [showSkipOverlay, setShowSkipOverlay] = useState(false);

    const { messages, sendMessage, receiveMessage, clearMessages } = useChat(roomId);

    // ── Socket event handlers ────────────────────────────────────────────────
    const handleMatched = useCallback(({ roomId: rId, initiator }) => {
        clearWaitingTimer();
        setRoomId(rId);
        setIsInitiator(initiator);
        setAppState("chatting");
        setStatusText("connected");
        setPartnerLeft(false);
        setWaitingTooLong(false);
        clearMessages();
    }, []);

    const handlePartnerLeft = useCallback(() => {
        setPartnerLeft(true);
        setStatusText("disconnected");
        setAppState("waiting");
        setRemoteStream(null);
        setRoomId(null);
        setWebrtcError(null);
        clearMessages();
    }, []);

    const handleWaiting = useCallback(() => {
        setStatusText("waiting");
        setAppState("waiting");
        // Start 30s wait timer
        clearWaitingTimer();
        waitingTimerRef.current = setTimeout(() => {
            setWaitingTooLong(true);
        }, 30000);
    }, []);

    const handleReceiveMessage = useCallback(
        (data) => {
            receiveMessage(data);
        },
        [receiveMessage]
    );

    const { emit } = useSocket({
        matched: handleMatched,
        partner_left: handlePartnerLeft,
        waiting: handleWaiting,
        receive_message: handleReceiveMessage,
    });

    // ── WebRTC ───────────────────────────────────────────────────────────────
    const { destroyPeer } = useWebRTC({
        roomId: appState === "chatting" ? roomId : null,
        isInitiator,
        localStream,
        onRemoteStream: setRemoteStream,
        onError: (msg) => setWebrtcError(msg),
    });

    // ── Acquire local media on mount ─────────────────────────────────────────
    useEffect(() => {
        let stream = null;
        (async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: true,
                });
                setLocalStream(stream);
            } catch (err) {
                console.error("[Media] getUserMedia failed:", err.name);
                setMediaError(
                    err.name === "NotAllowedError"
                        ? "Camera/mic permission denied. Text chat only."
                        : "Could not access camera. Text chat only."
                );
            }
        })();

        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
        };
    }, []);

    // ── Start looking for a partner immediately ───────────────────────────────
    useEffect(() => {
        emit("find_partner");
    }, []);

    const clearWaitingTimer = () => {
        if (waitingTimerRef.current) {
            clearTimeout(waitingTimerRef.current);
            waitingTimerRef.current = null;
        }
    };

    // ── Cleanup on unmount ───────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            clearWaitingTimer();
        };
    }, []);

    // ── Controls handlers ────────────────────────────────────────────────────
    const handleMuteToggle = () => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = isMuted; // toggle
            setIsMuted(!isMuted);
        }
    };

    const handleCamToggle = () => {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = isCamOff; // toggle
            setIsCamOff(!isCamOff);
        }
    };

    const handleSkip = useCallback(() => {
        // Clean up current peer + session
        destroyPeer();
        setRemoteStream(null);
        setRoomId(null);
        setWebrtcError(null);
        setPartnerLeft(false);
        clearMessages();

        emit("leave_room");

        // Show overlay briefly
        setShowSkipOverlay(true);
        setTimeout(() => {
            setShowSkipOverlay(false);
            emit("find_partner");
        }, 1200);
    }, [destroyPeer, emit, clearMessages]);

    const handleStop = useCallback(() => {
        destroyPeer();
        emit("leave_room");
        if (localStream) localStream.getTracks().forEach((t) => t.stop());
        clearWaitingTimer();
        onStop();
    }, [destroyPeer, emit, localStream, onStop]);

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a] shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#3b82f6] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" />
                        </svg>
                    </div>
                    <span className="font-bold text-white text-sm tracking-tight">StrangerChat</span>
                </div>
                <StatusBar
                    status={statusText}
                    partnerLeft={partnerLeft}
                    waitingTooLong={waitingTooLong}
                />
            </header>

            {/* Media error banner */}
            {mediaError && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs text-center">
                    {mediaError}
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0 overflow-hidden">
                {/* Left: Video + Controls */}
                <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <div className="flex-1 min-h-0">
                        <VideoPanel
                            localStream={localStream}
                            remoteStream={remoteStream}
                            isConnected={appState === "chatting"}
                            isCamOff={isCamOff}
                            webrtcError={webrtcError}
                        />
                    </div>
                    <Controls
                        isMuted={isMuted}
                        isCamOff={isCamOff}
                        isConnected={appState === "chatting"}
                        isWaiting={appState === "waiting"}
                        onMuteToggle={handleMuteToggle}
                        onCamToggle={handleCamToggle}
                        onSkip={handleSkip}
                        onStop={handleStop}
                    />
                </div>

                {/* Right: Chat */}
                <div className="flex flex-col lg:w-80 h-48 lg:h-auto min-h-0">
                    <ChatPanel
                        messages={messages}
                        onSend={sendMessage}
                        disabled={appState !== "chatting"}
                    />
                </div>
            </div>

            {/* Skip overlay */}
            {showSkipOverlay && (
                <div className="absolute inset-0 bg-[#0a0a0a]/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                        <p className="text-white font-medium">Looking for next stranger...</p>
                    </div>
                </div>
            )}

            {/* Partner left banner */}
            {partnerLeft && appState === "waiting" && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl">
                        <span className="text-[#ef4444]">👋</span>
                        <span className="text-sm text-[#e5e7eb]">Stranger has left</span>
                        <button
                            onClick={() => {
                                setPartnerLeft(false);
                                emit("find_partner");
                            }}
                            className="ml-2 text-xs text-[#3b82f6] hover:text-white transition-colors font-medium"
                        >
                            Find new →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
