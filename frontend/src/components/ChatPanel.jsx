import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function ChatPanel({ messages, onSend, disabled }) {
    const [input, setInput] = useState("")
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!input.trim() || disabled) return
        onSend(input)
        setInput("")
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    return (
        <div className="flex flex-col h-full bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#2a2a2a] shrink-0">
                <p className="text-xs font-medium text-[#4b5563] uppercase tracking-wider">Live Chat</p>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="flex flex-col gap-2 p-3">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-[#4b5563] text-sm">
                            {disabled ? "Connect to start chatting" : "Say hello! 👋"}
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex flex-col",
                                    msg.fromSelf ? "items-end" : "items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words",
                                        msg.fromSelf
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-[#1a1a1a] text-[#e5e7eb] border border-[#2a2a2a] rounded-bl-sm"
                                    )}
                                >
                                    {msg.message}
                                </div>
                                <span className="text-[10px] text-[#374151] mt-0.5 px-1">
                                    {formatTime(msg.timestamp)}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            <div className="flex items-center gap-2 p-2 border-t border-[#2a2a2a] shrink-0">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? "Waiting for connection…" : "Type a message…"}
                    className="flex-1 h-8 text-sm"
                />
                <Button
                    size="icon-sm"
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="h-8 w-8 shrink-0"
                >
                    <Send className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    )
}
