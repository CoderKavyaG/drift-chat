import { useEffect, useRef } from "react"
import { VideoOff, UserCircle2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useVoiceActivity } from "@/hooks/useVoiceActivity"
import { cn } from "@/lib/utils"

function VideoBox({ videoRef, stream, label, muted = false, isCamOff = false, placeholder, isSpeaking = false }) {
    return (
        <div className={cn(
            "relative flex-1 min-h-[200px] md:min-h-[260px] rounded-xl overflow-hidden bg-[#0f0f0f] border transition-all duration-300",
            isSpeaking
                ? "border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.4),0_0_20px_rgba(34,197,94,0.15)]"
                : "border-[#2a2a2a]"
        )}>
            {stream && !isCamOff ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={muted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#374151]">
                    {placeholder}
                </div>
            )}

            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5">
                <Badge
                    variant="muted"
                    className="text-[10px] px-2 py-0.5 backdrop-blur-md bg-black/60 border-white/10 text-white/80"
                >
                    {label}
                </Badge>
                {isSpeaking && (
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-sm">
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                        <span className="w-1 h-2 rounded-full bg-green-400 animate-pulse [animation-delay:100ms]" />
                        <span className="w-1 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:200ms]" />
                        <span className="w-1 h-2.5 rounded-full bg-green-400 animate-pulse [animation-delay:50ms]" />
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse [animation-delay:150ms]" />
                    </div>
                )}
            </div>
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
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    const localPlaceholder = (
        <>
            <VideoOff className="w-10 h-10 opacity-20" />
            <span className="text-sm text-[#4b5563]">{isCamOff ? "Camera off" : "No camera"}</span>
        </>
    )

    const remotePlaceholder = webrtcError ? (
        <div className="flex flex-col items-center gap-2 px-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500/60" />
            <p className="text-xs text-amber-400/80">Video unavailable — text chat still works</p>
        </div>
    ) : (
        <>
            <UserCircle2 className="w-10 h-10 opacity-20" />
            <span className="text-sm text-[#4b5563]">
                {isConnected ? "Connecting video…" : "Waiting for stranger…"}
            </span>
        </>
    )

    return (
        <div className="flex flex-col md:flex-row gap-3 w-full h-full">
            <VideoBox
                videoRef={localVideoRef}
                stream={localStream}
                label="You"
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
