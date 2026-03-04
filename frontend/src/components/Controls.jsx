import { Mic, MicOff, Video, VideoOff, SkipForward, Square, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Controls({
    isMuted,
    isCamOff,
    isWaiting,
    onMuteToggle,
    onCamToggle,
    onSkip,
    onStop,
    onSettings,
}) {
    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap p-2 sm:p-4 glass rounded-2xl sm:rounded-[24px]">
            <Button
                variant="ghost"
                size="lg"
                onClick={onMuteToggle}
                className={cn(
                    "rounded-xl sm:rounded-2xl gap-2 sm:gap-3 px-3 sm:px-6 h-10 sm:h-14 transition-all duration-300",
                    isMuted ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
            >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="font-semibold hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
            </Button>

            <Button
                variant="ghost"
                size="lg"
                onClick={onCamToggle}
                className={cn(
                    "rounded-xl sm:rounded-2xl gap-2 sm:gap-3 px-3 sm:px-6 h-10 sm:h-14 transition-all duration-300",
                    isCamOff ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
            >
                {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                <span className="font-semibold hidden sm:inline">{isCamOff ? "Cam On" : "Cam Off"}</span>
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={onSettings}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all shadow-none"
            >
                <Settings2 className="w-5 h-5" />
            </Button>

            <div className="w-px h-10 bg-white/10 mx-2 hidden sm:block" />

            <Button
                onClick={onSkip}
                disabled={isWaiting}
                size="lg"
                className="rounded-xl sm:rounded-2xl gap-2 sm:gap-3 px-4 sm:px-8 h-10 sm:h-14 bg-white text-black hover:bg-white/90 font-bold transition-all disabled:opacity-50 text-xs sm:text-sm"
            >
                <SkipForward className="w-5 h-5" />
                Skip Stranger
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={onStop}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-all border border-red-500/20 shadow-none"
            >
                <Square className="w-5 h-5 fill-current" />
            </Button>
        </div>
    )
}

