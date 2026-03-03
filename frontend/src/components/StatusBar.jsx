import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2, CheckCircle2, Github } from "lucide-react"

export default function StatusBar({ status, partnerLeft, waitingTooLong }) {
    if (partnerLeft) {
        return (
            <Badge variant="destructive" className="gap-1.5">
                <WifiOff className="w-3 h-3" />
                Stranger disconnected
            </Badge>
        )
    }

    const map = {
        waiting: (
            <Badge variant="warning" className="gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                {waitingTooLong ? "Still searching…" : "Looking for stranger"}
            </Badge>
        ),
        connected: (
            <Badge variant="success" className="gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Connected
            </Badge>
        ),
        disconnected: (
            <Badge variant="destructive" className="gap-1.5">
                <WifiOff className="w-3 h-3" />
                Disconnected
            </Badge>
        ),
        idle: (
            <Badge variant="muted" className="gap-1.5">
                <Wifi className="w-3 h-3" />
                Ready
            </Badge>
        ),
    }

    const badge = map[status] || map.idle

    return (
        <div className="flex items-center gap-3">
            {badge}
            <a
                href="https://github.com/goelsahhab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b7280] hover:text-[#e5e7eb] transition-colors"
                title="@goelsahhab on GitHub"
            >
                <Github className="w-4 h-4" />
            </a>
        </div>
    )
}
