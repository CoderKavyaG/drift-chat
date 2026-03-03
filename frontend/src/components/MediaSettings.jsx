import { useState, useEffect } from "react"
import { Mic, Camera, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function MediaSettings({ localStream, isMuted, isCamOff, onClose }) {
    const [audioDevices, setAudioDevices] = useState([])
    const [videoDevices, setVideoDevices] = useState([])
    const [activeAudioId, setActiveAudioId] = useState("")
    const [activeVideoId, setActiveVideoId] = useState("")

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            setAudioDevices(devices.filter((d) => d.kind === "audioinput"))
            setVideoDevices(devices.filter((d) => d.kind === "videoinput"))

            if (localStream) {
                const audioTrack = localStream.getAudioTracks()[0]
                const videoTrack = localStream.getVideoTracks()[0]
                if (audioTrack) setActiveAudioId(audioTrack.getSettings().deviceId || "")
                if (videoTrack) setActiveVideoId(videoTrack.getSettings().deviceId || "")
            }
        })
    }, [localStream])

    const audioTrack = localStream?.getAudioTracks()[0]
    const videoTrack = localStream?.getVideoTracks()[0]

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <Card className="w-full max-w-md mx-4 bg-[#0f0f0f] border-[#2a2a2a] shadow-2xl">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Media Settings</CardTitle>
                        <Button variant="ghost" size="icon-sm" onClick={onClose} className="h-7 w-7">
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-4 flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Microphone</span>
                            <Badge variant={isMuted ? "destructive" : "success"} className="ml-auto text-xs">
                                {isMuted ? "Muted" : "Active"}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {audioDevices.length === 0 ? (
                                <p className="text-xs text-[#4b5563] px-3 py-2">No microphones found</p>
                            ) : (
                                audioDevices.map((device) => (
                                    <button
                                        key={device.deviceId}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                                            device.deviceId === activeAudioId
                                                ? "bg-blue-600/15 border border-blue-500/30 text-blue-300"
                                                : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#9ca3af] hover:bg-[#222] hover:text-white"
                                        )}
                                    >
                                        {device.deviceId === activeAudioId && (
                                            <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                        )}
                                        <span className="flex-1 truncate">
                                            {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Camera</span>
                            <Badge variant={isCamOff ? "destructive" : "success"} className="ml-auto text-xs">
                                {isCamOff ? "Off" : "On"}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {videoDevices.length === 0 ? (
                                <p className="text-xs text-[#4b5563] px-3 py-2">No cameras found</p>
                            ) : (
                                videoDevices.map((device) => (
                                    <button
                                        key={device.deviceId}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                                            device.deviceId === activeVideoId
                                                ? "bg-blue-600/15 border border-blue-500/30 text-blue-300"
                                                : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#9ca3af] hover:bg-[#222] hover:text-white"
                                        )}
                                    >
                                        {device.deviceId === activeVideoId && (
                                            <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                        )}
                                        <span className="flex-1 truncate">
                                            {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-1">
                        <Button size="sm" onClick={onClose}>Done</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
