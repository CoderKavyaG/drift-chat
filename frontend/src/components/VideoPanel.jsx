import { useEffect, useRef } from "react"
import { VideoOff, UserCircle2, AlertTriangle, Monitor } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useVoiceActivity } from "@/hooks/useVoiceActivity"
import { cn } from "@/lib/utils"

function VideoBox({ videoRef, stream, label, muted = false, isCamOff = false, placeholder, isSpeaking = false }) {
    return (
        <div className={cn(
            "relative flex-1 min-h-0 min-w-0 rounded-[12px] sm:rounded-[16px] md:rounded-[24px] xl:rounded-[32px] overflow-hidden bg-white/[0.02] border transition-all duration-500",
            isSpeaking
                ? "border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
                : "border-white/5"
        )}>
            {stream && !isCamOff ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={muted}
                    playsInline
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-all duration-700",
                        isSpeaking && "scale-[1.02]"
                    )}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-5 bg-black/40 backdrop-blur-xl">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        {placeholder.icon}
                    </div>
                    <span className="text-white/40 font-medium tracking-wide uppercase text-[9px] sm:text-[10px] md:text-xs">{placeholder.text}</span>
                </div>
            )}

            {/* Overlays */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 z-10">
                <Badge className="glass-dark border-white/10 text-white/50 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full flex gap-1.5 sm:gap-2 items-center text-[9px] sm:text-[10px] md:text-xs">
                    <div className={cn("w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full", stream && !isCamOff ? "bg-green-500" : "bg-white/20")} />
                    {label}
                </Badge>
            </div>

            {isSpeaking && (
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 z-10 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full glass-dark border-green-500/30">
                    <div className="flex items-center gap-0.5">
                        <span className="w-0.5 sm:w-1 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="w-0.5 sm:w-1 h-2.5 sm:h-4 bg-green-500 rounded-full animate-pulse [animation-delay:150ms]" />
                        <span className="w-0.5 sm:w-1 h-2 sm:h-3 bg-green-500 rounded-full animate-pulse [animation-delay:300ms]" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-green-500 uppercase ml-1 sm:ml-2 tracking-widest hidden sm:inline">Live Audio</span>
                </div>
            )}
        </div>
    )
}

export default function VideoPanel({ localStream, remoteStream, isConnected, isCamOff, isMuted, webrtcError }) {
    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const isSpeaking = useVoiceActivity(localStream, isMuted)

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream, isCamOff])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    const localPlaceholder = {
        icon: <VideoOff className="w-8 h-8 text-white/20" />,
        text: isCamOff ? "Camera Hidden" : "No Camera Source"
    }

    const remotePlaceholder = webrtcError ? {
        icon: <AlertTriangle className="w-8 h-8 text-amber-500/40" />,
        text: "Connection Error"
    } : {
        icon: <UserCircle2 className="w-8 h-8 text-white/20" />,
        text: isConnected ? "Loading Stream..." : "Searching for Stranger"
    }

    return (
        <div className="flex flex-row sm:flex-col xl:flex-row gap-2 sm:gap-3 xl:gap-6 w-full h-full">
            <VideoBox
                videoRef={localVideoRef}
                stream={localStream}
                label="Your Camera"
                muted
                isCamOff={isCamOff}
                placeholder={localPlaceholder}
                isSpeaking={isSpeaking && !isMuted}
            />
            <VideoBox
                videoRef={remoteVideoRef}
                stream={remoteStream}
                label="Stranger"
                placeholder={remotePlaceholder}
            />
        </div>
    )
}



