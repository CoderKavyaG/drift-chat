import { Mic, MicOff, Video, VideoOff, SkipForward, Square, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
        <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={onMuteToggle}
                title={isMuted ? "Unmute mic" : "Mute mic"}
            >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? "Unmuted" : "Mute"}
            </Button>

            <Button
                variant={isCamOff ? "destructive" : "outline"}
                size="sm"
                onClick={onCamToggle}
                title={isCamOff ? "Turn camera on" : "Turn camera off"}
            >
                {isCamOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {isCamOff ? "Cam Off" : "Camera"}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={onSettings}
                title="Media settings"
                className="text-[#4b5563] hover:text-white"
            >
                <Settings2 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
                variant="warning"
                size="sm"
                onClick={onSkip}
                disabled={isWaiting}
            >
                <SkipForward className="w-4 h-4" />
                Skip
            </Button>

            <Button
                variant="destructive"
                size="sm"
                onClick={onStop}
            >
                <Square className="w-4 h-4" />
                Stop
            </Button>
        </div>
    )
}
