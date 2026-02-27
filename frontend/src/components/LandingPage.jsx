/**
 * LandingPage
 * Full-page hero with "Start Chatting" CTA.
 */
export default function LandingPage({ onStart, onlineCount }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0a]">
            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-[#8b5cf6]/5 rounded-full blur-3xl" />
            </div>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#3b82f6]/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" />
                    </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">StrangerChat</span>
            </div>

            {/* Headline */}
            <div className="text-center max-w-xl animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                    Talk to{" "}
                    <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                        strangers
                    </span>
                    <br />
                    instantly.
                </h1>
                <p className="text-[#6b7280] text-lg mb-8 leading-relaxed">
                    Anonymous video + text chat. No signup, no history, no strings.
                    <br />
                    Just press Start and meet someone new.
                </p>

                {/* Online count */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    <span className="text-[#6b7280] text-sm">
                        <span className="text-[#22c55e] font-semibold">{onlineCount}</span> people online
                    </span>
                </div>

                {/* CTA */}
                <button
                    onClick={onStart}
                    className="px-10 py-4 bg-[#3b82f6] hover:bg-[#2563eb] active:scale-95 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-[#3b82f6]/25 transition-all duration-200"
                >
                    Start Chatting →
                </button>

                <p className="mt-6 text-[#4b5563] text-xs">
                    No account required · 100% anonymous · Video & text
                </p>
            </div>

            {/* Features row */}
            <div className="flex flex-wrap gap-6 justify-center mt-16 animate-fade-in">
                {[
                    { icon: "🎭", label: "Anonymous" },
                    { icon: "⚡", label: "Instant Match" },
                    { icon: "📹", label: "Video + Text" },
                    { icon: "🔒", label: "No Logs" },
                ].map(({ icon, label }) => (
                    <div
                        key={label}
                        className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#2a2a2a] rounded-xl text-sm text-[#6b7280]"
                    >
                        <span>{icon}</span>
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
