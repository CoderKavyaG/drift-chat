import { useState, useEffect, useRef, useCallback } from "react"
import { Users, Github, X, AlertTriangle, Loader2 } from "lucide-react"
import { useSocket } from "../hooks/useSocket"
import { useWebRTC } from "../hooks/useWebRTC"
import { useChat } from "../hooks/useChat"
import VideoPanel from "./VideoPanel"
import ChatPanel from "./ChatPanel"
import Controls from "./Controls"
import StatusBar from "./StatusBar"
import MediaSettings from "./MediaSettings"
import GlowBackground from "./GlowBackground"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

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

    const [audioDeviceId, setAudioDeviceId] = useState(null)
    const [videoDeviceId, setVideoDeviceId] = useState(null)

    const { messages, sendMessage, receiveMessage, clearMessages } = useChat(roomId)

    // Use refs so callbacks can access latest values without circular deps
    const destroyPeerRef = useRef(null)
    const emitRef = useRef(null)
    const fetchMediaRef = useRef(null)
    const clearMessagesRef = useRef(null)
    const localStreamRef = useRef(null)
    const receiveMessageRef = useRef(null)

    const clearWaitingTimer = () => {
        if (waitingTimerRef.current) {
            clearTimeout(waitingTimerRef.current)
            waitingTimerRef.current = null
        }
    }

    // DEFINE FETCMEDIA FIRST - before handlers that use it
    const fetchMedia = useCallback(async (aId, vId) => {
        try {
            const constraints = {
                video: vId
                    ? { deviceId: { exact: vId }, width: { ideal: 720 }, height: { ideal: 480 } }
                    : { width: { ideal: 720 }, height: { ideal: 480 } },
                audio: aId ? { deviceId: { exact: aId } } : true,
            }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            // Stop old tracks 
            setLocalStream(prevStream => {
                if (prevStream) {
                    prevStream.getTracks().forEach(t => t.stop())
                }
                return stream
            })

            // Always enable tracks initially - they should be available for WebRTC
            // Muting/camera off is handled separately by the user controls
            stream.getAudioTracks().forEach(t => t.enabled = true)
            stream.getVideoTracks().forEach(t => t.enabled = true)

            setMediaError(null)
            return stream
        } catch (err) {
            setMediaError(
                err.name === "NotAllowedError"
                    ? "Camera/mic permissions were denied. You can still use text chat."
                    : "We couldn't access your camera at the requested resolution. Try refreshing or check device settings."
            )
            throw err
        }
    }, [])

    // Socket event handlers — now can use fetchMedia directly
    const handleMatched = useCallback(({ roomId: rId, initiator }) => {
        clearWaitingTimer()
        setAppState("chatting")
        setStatusText("connected")
        setPartnerLeft(false)
        setWaitingTooLong(false)
        setRemoteStream(null)
        setWebrtcError(null)
        clearMessages()
        
        // Ensure fresh stream before creating peer connection
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop())
        }
        setLocalStream(null)
        
        // Fetch fresh media, then set roomId to trigger peer creation
        fetchMedia(null, null).then(() => {
            setRoomId(rId)
            setIsInitiator(initiator)
        }).catch(err => {
            console.error("[ChatRoom] Media fetch failed:", err)
        })
    }, [fetchMedia, localStream, clearMessages])

    const handlePartnerLeft = useCallback(() => {
        // Auto-reconnect: clean up and immediately find new partner
        if (destroyPeerRef.current) destroyPeerRef.current()
        setRemoteStream(null)
        setRoomId(null)
        setWebrtcError(null)
        setPartnerLeft(false)
        setAppState("waiting")
        setStatusText("waiting")
        clearMessages()
        if (emitRef.current) emitRef.current("leave_room")
        setShowSkipOverlay(true)
        setTimeout(() => {
            setShowSkipOverlay(false)
            if (emitRef.current) emitRef.current("find_partner")
        }, 800)
    }, [clearMessages])

    const handleWaiting = useCallback(() => {
        setStatusText("waiting")
        setAppState("waiting")
        clearWaitingTimer()
        waitingTimerRef.current = setTimeout(() => setWaitingTooLong(true), 15000)
    }, [])

    // Now declare hooks that depend on callbacks above
    const { emit } = useSocket({
        matched: handleMatched,
        partner_left: handlePartnerLeft,
        waiting: handleWaiting,
        receive_message: (data) => receiveMessage(data),
    })

    const { destroyPeer } = useWebRTC({
        roomId: appState === "chatting" ? roomId : null,
        isInitiator,
        localStream,
        onRemoteStream: setRemoteStream,
        onError: (msg) => setWebrtcError(msg),
    })

    // Keep refs in sync
    useEffect(() => { destroyPeerRef.current = destroyPeer }, [destroyPeer])
    useEffect(() => { emitRef.current = emit }, [emit])

    // Initial media fetch
    useEffect(() => {
        fetchMedia(null, null)
    }, [fetchMedia])

    // Start looking for partner on mount
    useEffect(() => {
        emit("find_partner")
    }, [emit])

    useEffect(() => () => clearWaitingTimer(), [])

    const handleMuteToggle = () => {
        if (!localStream) return
        const newMutedState = !isMuted
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !newMutedState  // Enable if NOT muted
        })
        setIsMuted(newMutedState)
    }

    const handleCamToggle = () => {
        if (!localStream) return
        const newCamOffState = !isCamOff
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !newCamOffState  // Enable if camera is NOT off
        })
        setIsCamOff(newCamOffState)
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
        }, 800)
    }, [destroyPeer, emit, clearMessages])

    const handleStop = useCallback(() => {
        destroyPeer()
        emit("leave_room")
        if (localStream) localStream.getTracks().forEach((t) => t.stop())
        clearWaitingTimer()
        onStop()
    }, [destroyPeer, emit, localStream, onStop])

    const handleSettingsSave = async (newAudioId, newVideoId) => {
        setAudioDeviceId(newAudioId)
        setVideoDeviceId(newVideoId)
        await fetchMedia(newAudioId, newVideoId)
        setShowSettings(false)
    }

    return (
        <div className="flex flex-col h-[100dvh] relative bg-[#030303] overflow-hidden text-white">
            <GlowBackground />

            {/* Header */}
            <header className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-6 z-20 shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                    <span className="text-[17px] sm:text-[20px] font-extrabold tracking-[-0.04em] bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent select-none shrink-0">
                        drift<span className="text-indigo-400">.</span>
                    </span>
                    <div className="w-px h-5 sm:h-6 bg-white/10 shrink-0" />
                    <StatusBar status={statusText} partnerLeft={partnerLeft} waitingTooLong={waitingTooLong} />
                </div>

                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <Badge variant="outline" className="glass-dark px-3 sm:px-4 py-1 sm:py-1.5 border-white/5 text-white/40 font-medium hidden sm:flex gap-2 text-[11px] sm:text-xs">
                        <Users className="w-3 h-3" />
                        {onlineCount} active
                    </Badge>
                    <a href="https://github.com/CoderKavyaG/Stranger-Chat" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors hidden sm:block">
                        <Github className="w-5 h-5" />
                    </a>
                </div>
            </header>

            {mediaError && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-3 sm:mx-8 mt-2 sm:mt-4 px-4 sm:px-6 py-3 sm:py-4 glass-dark border-red-500/20 text-red-400 text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-between z-20"
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        {mediaError}
                    </div>
                    <X className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100" onClick={() => setMediaError(null)} />
                </motion.div>
            )}

            <main className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-6 p-2 sm:p-6 lg:p-8 min-h-0 overflow-y-auto lg:overflow-hidden z-10">
                <div className="flex flex-col gap-2 sm:gap-4 lg:gap-6 flex-1 min-h-0">
                    <div className="flex-1 min-h-0 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl">
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

                <div className="flex flex-col w-full lg:w-[380px] min-h-[200px] lg:min-h-0 h-[280px] sm:h-[320px] lg:h-auto shrink-0 lg:shrink">
                    <ChatPanel
                        messages={messages}
                        onSend={sendMessage}
                        disabled={appState !== "chatting"}
                    />
                </div>
            </main>

            {/* Skip Overlay */}
            <AnimatePresence>
                {showSkipOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#000]/95 flex items-center justify-center z-50 backdrop-blur-2xl"
                    >
                        <div className="flex flex-col items-center gap-8">
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-white rounded-full blur-3xl"
                                />
                                <Loader2 className="w-16 h-16 text-white animate-spin relative z-10 opacity-80" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Curating Next Match</h2>
                                <p className="text-white/30 text-lg">Finding someone interesting for you...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showSettings && (
                <MediaSettings
                    localStream={localStream}
                    isMuted={isMuted}
                    isCamOff={isCamOff}
                    onClose={() => setShowSettings(false)}
                    onSave={handleSettingsSave}
                />
            )}
        </div>
    )
}


