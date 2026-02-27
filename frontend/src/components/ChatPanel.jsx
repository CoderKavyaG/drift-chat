import { useState, useRef, useEffect } from "react";

/**
 * ChatPanel
 * Scrollable message history + input box.
 */
export default function ChatPanel({ messages, onSend, disabled }) {
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || disabled) return;
        onSend(input);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex flex-col h-full bg-[#111111] rounded-xl border border-[#2a2a2a] overflow-hidden">
            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-3 gap-2 flex flex-col min-h-0">
                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[#4b5563] text-sm">
                        {disabled ? "Connect to start chatting" : "Say hi! 👋"}
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex flex-col animate-slide-up ${msg.fromSelf ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${msg.fromSelf
                                        ? "bg-[#3b82f6] text-white rounded-br-sm"
                                        : "bg-[#1e1e1e] text-[#e5e7eb] border border-[#2a2a2a] rounded-bl-sm"
                                    }`}
                            >
                                {msg.message}
                            </div>
                            <span className="text-[10px] text-[#4b5563] mt-0.5 px-1">
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-2 border-t border-[#2a2a2a] bg-[#0f0f0f]">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? "Waiting for connection..." : "Type a message..."}
                    className="flex-1 bg-[#1a1a1a] text-[#e5e7eb] placeholder-[#4b5563] px-3 py-2 rounded-lg text-sm border border-[#2a2a2a] focus:outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-40"
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="p-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
