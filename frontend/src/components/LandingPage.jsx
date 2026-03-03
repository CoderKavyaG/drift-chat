import { Video, Zap, Shield, MessageCircle, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function LandingPage({ onStart, onlineCount }) {
    const features = [
        { icon: Shield, label: "Anonymous", desc: "Zero identity, zero trace" },
        { icon: Zap, label: "Instant Match", desc: "Found in under 3 seconds" },
        { icon: Video, label: "HD Video", desc: "P2P WebRTC streaming" },
        { icon: MessageCircle, label: "Live Chat", desc: "Text while you talk" },
    ]

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[300px] bg-violet-600/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-400/3 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full gap-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight">StrangerChat</span>
                    </div>

                    <Badge variant="success" className="text-xs px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        {onlineCount} people online right now
                    </Badge>
                </div>

                <div className="flex flex-col gap-3">
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                        Meet strangers.{" "}
                        <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                            Anonymously.
                        </span>
                    </h1>
                    <p className="text-[#6b7280] text-lg leading-relaxed max-w-lg mx-auto">
                        No sign up. No history. No strings attached. Just real conversations with real people — right now.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                    <Button
                        onClick={onStart}
                        size="lg"
                        className="w-full text-base font-semibold shadow-xl shadow-blue-600/25 rounded-xl"
                    >
                        Start Chatting
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    <p className="text-[#4b5563] text-xs">No account required · Works in your browser</p>
                </div>

                <Separator className="max-w-sm" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                    {features.map(({ icon: Icon, label, desc }) => (
                        <Card key={label} className="bg-[#0f0f0f] border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors">
                            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                                <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{label}</p>
                                    <p className="text-xs text-[#4b5563] mt-0.5">{desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <p className="text-[#2a2a2a] text-xs">
                    Powered by WebRTC · Socket.IO · React
                </p>
            </div>
        </div>
    )
}
