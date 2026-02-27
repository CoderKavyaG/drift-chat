/**
 * StatusBar
 * Shows current connection state with appropriate styling.
 */
export default function StatusBar({ status, partnerLeft, waitingTooLong }) {
    const config = {
        idle: {
            text: "Ready to connect",
            color: "text-[#6b7280]",
            dot: "bg-[#4b5563]",
            pulse: false,
        },
        waiting: {
            text: waitingTooLong ? "Still looking… you're in queue" : "Looking for a stranger...",
            color: "text-[#f59e0b]",
            dot: "bg-[#f59e0b]",
            pulse: true,
        },
        connected: {
            text: "Connected!",
            color: "text-[#22c55e]",
            dot: "bg-[#22c55e]",
            pulse: false,
        },
        disconnected: {
            text: "Stranger disconnected",
            color: "text-[#ef4444]",
            dot: "bg-[#ef4444]",
            pulse: false,
        },
    };

    const current = config[status] || config.idle;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] rounded-lg border border-[#2a2a2a]">
            <span
                className={`w-2 h-2 rounded-full shrink-0 ${current.dot} ${current.pulse ? "animate-pulse" : ""
                    }`}
            />
            <span className={`text-sm font-medium ${current.color}`}>
                {partnerLeft ? "Stranger has left" : current.text}
            </span>
        </div>
    );
}
