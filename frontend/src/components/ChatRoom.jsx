import { useState, useEffect, useRef, useCallback } from "react"
import { Video, Users, Loader2, SkipForward } from "lucide-react"
import { useSocket } from "../hooks/useSocket"
import { useWebRTC } from "../hooks/useWebRTC"
import { useChat } from "../hooks/useChat"
import VideoPanel from "./VideoPanel"
import ChatPanel from "./ChatPanel"
import Controls from "./Controls"
import StatusBar from "./StatusBar"
import MediaSettings from "./MediaSettings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ChatRoom({ onStop, onlineCount }) {
    const [appState, setAppState] = useState("waiting")
    const [roomId, setRoomId] = useState(null)
    const [isInitiator, setIsInitiator] = useState(false)
    const [statusText, setStatusText] = useState("waiting")
    const [partnerLeft, setPartnerLeft] = useState(false)
    const [waitingTooLong, setWaitingTooLong] = useState(false)
    const waitingTimerRef = useRef(null)

    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isCamOff, setIsCamOff] = useState(false)
    const [mediaError, setMediaError] = useState(null)
    const [webrtcError, setWebrtcError] = useState(null)
    const [showSkipOverlay, setShowSkipOverlay] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    const { messages, sendMessage, receiveMessage, clearMessages } = useChat(roomId)

    const clearWaitingTimer = () => {
        if (waitingTimerRef.current) {
            clearTimeout(waitingTimerRef.current)
            waitingTimerRef.current = null
        }
    }

    const handleMatched = useCallback(({ roomId: rId, initiator }) => {
        clearWaitingTimer()
        setRoomId(rId)
        setIsInitiator(initiator)
        setAppState("chatting")
        setStatusText("connected")
        setPartnerLeft(false)
        setWaitingTooLong(false)
        clearMessages()
    }, [])

    const handlePartnerLeft = useCallback(() => {
        setPartnerLeft(true)
        setStatusText("disconnected")
        setAppState("waiting")
        setRemoteStream(null)
        setRoomId(null)
        setWebrtcError(null)
        clearMessages()
    }, [])

    const handleWaiting = useCallback(() => {
        setStatusText("waiting")
        setAppState("waiting")
        clearWaitingTimer()
        waitingTimerRef.current = setTimeout(() => setWaitingTooLong(true), 30000)
    }, [])

    const { emit } = useSocket({
        matched: handleMatched,
        partner_left: handlePartnerLeft,
        waiting: handleWaiting,
        receive_message: useCallback((data) => receiveMessage(data), [receiveMessage]),
    })

    const { destroyPeer } = useWebRTC({
        roomId: appState === "chatting" ? roomId : null,
        isInitiator,
        localStream,
        onRemoteStream: setRemoteStream,
        onError: (msg) => setWebrtcError(msg),
    })

    useEffect(() => {
        let stream = null
            ; (async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 1280, height: 720 },
                        audio: true,
                    })
                    setLocalStream(stream)
                } catch (err) {
                    setMediaError(
                        err.name === "NotAllowedError"
                            ? "Camera/mic permission denied — text chat still works."
                            : "Could not access camera — text chat still works."
                    )
                }
            })()
        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop())
        }
    }, [])

    useEffect(() => {
        emit("find_partner")
    }, [])

    useEffect(() => () => clearWaitingTimer(), [])

    const handleMuteToggle = () => {
        if (!localStream) return
        const track = localStream.getAudioTracks()[0]
        if (track) {
            track.enabled = isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleCamToggle = () => {
        if (!localStream) return
        const track = localStream.getVideoTracks()[0]
        if (track) {
            track.enabled = isCamOff
            setIsCamOff(!isCamOff)
        }
    }

    const handleSkip = useCallback(() => {
        destroyPeer()
        setRemoteStream(null)
        setRoomId(null)
        setWebrtcError(null)
        setPartnerLeft(false)
        clearMessages()
        emit("leave_room")
        setShowSkipOverlay(true)
        setTimeout(() => {
            setShowSkipOverlay(false)
            emit("find_partner")
        }, 1200)
    }, [destroyPeer, emit, clearMessages])

    const handleStop = useCallback(() => {
        destroyPeer()
        emit("leave_room")
        if (localStream) localStream.getTracks().forEach((t) => t.stop())
        clearWaitingTimer()
        onStop()
    }, [destroyPeer, emit, localStream, onStop])

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Video className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-sm tracking-tight">StrangerChat</span>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Badge variant="muted" className="gap-1.5 text-xs">
                        <Users className="w-3 h-3" />
                        {onlineCount} online
                    </Badge>
                </div>
                <StatusBar status={statusText} partnerLeft={partnerLeft} waitingTooLong={waitingTooLong} />
            </header>

            {mediaError && (
                <div className="px-4 py-2 bg-amber-500/8 border-b border-amber-500/15 text-amber-400/90 text-xs text-center shrink-0">
                    {mediaError}
                </div>
            )}

            <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0 overflow-hidden">
                <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <div className="flex-1 min-h-0">
                        <VideoPanel
                            localStream={localStream}
                            remoteStream={remoteStream}
                            isConnected={appState === "chatting"}
                            isCamOff={isCamOff}
                            isMuted={isMuted}
                            webrtcError={webrtcError}
                        />
                    </div>
                    <Controls
                        isMuted={isMuted}
                        isCamOff={isCamOff}
                        isWaiting={appState === "waiting"}
                        onMuteToggle={handleMuteToggle}
                        onCamToggle={handleCamToggle}
                        onSkip={handleSkip}
                        onStop={handleStop}
                        onSettings={() => setShowSettings(true)}
                    />
                </div>

                <div className="flex flex-col lg:w-80 h-52 lg:h-auto min-h-0">
                    <ChatPanel
                        messages={messages}
                        onSend={sendMessage}
                        disabled={appState !== "chatting"}
                    />
                </div>
            </div>

            {showSkipOverlay && (
                <div className="absolute inset-0 bg-[#0a0a0a]/85 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-white text-sm font-medium">Finding next stranger…</p>
                    </div>
                </div>
            )}

            {partnerLeft && appState === "waiting" && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#111111] border border-[#2a2a2a] rounded-xl shadow-2xl">
                        <span className="text-sm text-[#e5e7eb]">Stranger has left</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setPartnerLeft(false)
                                emit("find_partner")
                            }}
                            className="h-7 text-xs gap-1.5"
                        >
                            <SkipForward className="w-3 h-3" />
                            Find new
                        </Button>
                    </div>
                </div>
            )}

            {showSettings && (
                <MediaSettings
                    localStream={localStream}
                    isMuted={isMuted}
                    isCamOff={isCamOff}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    )
}
