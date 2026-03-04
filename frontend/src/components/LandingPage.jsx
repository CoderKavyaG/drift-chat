import { motion } from "framer-motion"
import { ArrowRight, Shield, Zap, Video, MessageCircle, Lock, Users, ChevronDown, Github, Eye, EyeOff, Wifi, UserX, HelpCircle, Fingerprint, ShieldCheck, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import GlowBackground from "./GlowBackground"

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }
})

const stagger = (delay = 0) => ({
    initial: { opacity: 0, y: 30, scale: 0.97 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }
})

function FloatingStatCard({ icon: Icon, label, value, className, delay }) {
    return (
        <motion.div {...stagger(delay)} className={className}>
            <div className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3.5 hover:border-white/15 transition-all duration-500 group cursor-default animate-float" style={{ animationDelay: `${delay}s` }}>
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Icon className="w-4 h-4 text-white/70" />
                </div>
                <div>
                    <p className="text-[13px] font-semibold text-white/90 tracking-tight">{value}</p>
                    <p className="text-[11px] text-white/35 font-medium">{label}</p>
                </div>
            </div>
        </motion.div>
    )
}

function SectionTitle({ badge, title, subtitle }) {
    return (
        <motion.div {...stagger(0)} className="text-center mb-12 sm:mb-16">
            {badge && (
                <Badge variant="outline" className="glass-card px-3 py-1 border-white/8 rounded-full text-white/50 font-medium text-[11px] mb-5 uppercase tracking-[0.15em]">
                    {badge}
                </Badge>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-4">{title}</h2>
            {subtitle && <p className="text-white/30 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
        </motion.div>
    )
}

export default function LandingPage({ onStart, onlineCount }) {
    const navLinks = ["How It Works", "Features", "Safety", "FAQ"]

    const features = [
        { icon: Shield, label: "Anonymous", desc: "Zero identity, zero trace. We never collect or store personal data." },
        { icon: Zap, label: "Instant Match", desc: "Connect with someone in under 3 seconds, anywhere worldwide." },
        { icon: Video, label: "HD Video", desc: "Crystal clear peer-to-peer WebRTC video streaming." },
        { icon: MessageCircle, label: "Live Chat", desc: "Rich text messaging alongside your video calls." },
    ]

    const steps = [
        { num: "01", title: "Open drift", desc: "No accounts. No sign-ups. Just visit the site and you're ready to go.", icon: Globe },
        { num: "02", title: "Click Start", desc: "Hit the button and our matching engine instantly pairs you with a stranger.", icon: Zap },
        { num: "03", title: "Chat freely", desc: "Talk via text, voice, or video. Skip anytime to meet someone new.", icon: MessageCircle },
    ]

    const safetyFeatures = [
        { icon: EyeOff, title: "No Identity Required", desc: "We never ask for your name, email, phone, or any personal information." },
        { icon: Fingerprint, title: "No Data Stored", desc: "Conversations are not recorded or saved. When you leave, it's gone forever." },
        { icon: ShieldCheck, title: "End-to-End Encrypted", desc: "Video and audio streams are peer-to-peer. We can't see or hear your calls." },
        { icon: UserX, title: "Easy Exit", desc: "One click to skip or stop. You're always in full control of your experience." },
    ]

    const faqs = [
        { q: "Is drift really free?", a: "Yes, completely free. No hidden fees, no premium plans, no ads. Just open and chat." },
        { q: "Do I need to create an account?", a: "No. drift has zero signup, zero login. You're anonymous from the moment you visit." },
        { q: "Is my conversation private?", a: "Yes. Video and audio are peer-to-peer (WebRTC). We can't access your streams. Nothing is recorded." },
        { q: "Can I use drift on mobile?", a: "Yes. drift is fully responsive and works on any modern mobile browser — iOS and Android." },
        { q: "What if someone is inappropriate?", a: "You can instantly skip to the next person with one click. We're working on adding reporting features." },
        { q: "How does matching work?", a: "When you click Start, you enter a queue. As soon as another person is waiting, you're instantly connected." },
    ]

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden text-white">
            <GlowBackground />

            {/* ─── Sticky Navbar ──────────────────────────────────────── */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full z-30 sticky top-0 bg-[#030303]/60 backdrop-blur-2xl border-b border-white/[0.04]"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
                    <span className="text-[18px] sm:text-[20px] font-extrabold tracking-[-0.04em] bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent select-none">
                        drift<span className="text-indigo-400">.</span>
                    </span>

                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                className="px-4 py-2 text-[13px] font-medium text-white/40 hover:text-white/90 rounded-lg hover:bg-white/[0.04] transition-all duration-300"
                            >
                                {link}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <a href="https://github.com/CoderKavyaG/Stranger-Chat" target="_blank" rel="noreferrer" className="text-white/25 hover:text-white/60 transition-colors p-2">
                            <Github className="w-[18px] h-[18px]" />
                        </a>
                        <Button
                            onClick={onStart}
                            className="bg-white/10 text-white border border-white/10 hover:bg-white/15 hover:border-white/20 rounded-full px-4 sm:px-5 h-8 sm:h-9 text-[12px] sm:text-[13px] font-semibold backdrop-blur-sm transition-all"
                        >
                            Enter Chat
                        </Button>
                    </div>
                </div>
            </motion.header>

            {/* ─── Hero ────────────────────────────────────────────────── */}
            <section className="flex flex-col items-center justify-center px-4 sm:px-6 z-10 relative py-20 sm:py-28 lg:py-36 min-h-[85vh] sm:min-h-[90vh]">
                <div className="max-w-4xl mx-auto text-center">

                    <motion.div {...fadeUp(0.1)} className="mb-6 sm:mb-8">
                        <Badge variant="outline" className="glass-card px-3 sm:px-4 py-1.5 border-white/8 rounded-full text-white/70 font-medium text-[11px] sm:text-[12px] gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            {onlineCount > 0 ? `${onlineCount.toLocaleString()} people drifting now` : "Users connecting now"}
                        </Badge>
                    </motion.div>

                    <motion.h1
                        {...fadeUp(0.2)}
                        className="text-[34px] sm:text-5xl md:text-7xl lg:text-[82px] font-extrabold tracking-[-0.035em] leading-[0.95] sm:leading-[0.92] mb-5 sm:mb-7"
                    >
                        Talk to Strangers.
                        <br />
                        <span className="bg-gradient-to-r from-white/50 via-white/25 to-white/50 bg-clip-text text-transparent">
                            Stay Anonymous.
                        </span>
                    </motion.h1>

                    <motion.p
                        {...fadeUp(0.35)}
                        className="text-white/40 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2"
                    >
                        Instantly connect with people around the world through text, voice, and video — no sign up required.
                    </motion.p>

                    <motion.div {...fadeUp(0.5)} className="flex flex-col items-center gap-5 mb-6">
                        <Button
                            onClick={onStart}
                            size="lg"
                            className="bg-white text-[#0a0a0a] hover:bg-white/90 px-10 py-7 text-[15px] font-bold rounded-full transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_60px_rgba(255,255,255,0.08)] hover:shadow-[0_0_80px_rgba(255,255,255,0.15)]"
                        >
                            Start Chatting Now
                            <ArrowRight className="ml-1 w-4.5 h-4.5" />
                        </Button>
                        <a
                            href="#how-it-works"
                            className="text-white/35 text-sm font-medium hover:text-white/60 transition-colors flex items-center gap-1.5 group"
                        >
                            See how it works
                            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                        </a>
                    </motion.div>

                    <motion.div {...fadeUp(0.6)} className="flex items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] text-white/20 font-mono uppercase tracking-[0.12em] sm:tracking-[0.15em]">
                        <span className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> No Login
                        </span>
                        <Separator orientation="vertical" className="h-3 bg-white/10" />
                        <span>No Signup</span>
                        <Separator orientation="vertical" className="h-3 bg-white/10" />
                        <span>Secure P2P</span>
                    </motion.div>
                </div>

                {/* Floating Glass Cards — desktop only */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
                    <FloatingStatCard icon={Users} value={onlineCount > 0 ? `${onlineCount.toLocaleString()} Live` : "12,430 Live"} label="Active Users" className="absolute top-[20%] left-[5%] pointer-events-auto" delay={0.9} />
                    <FloatingStatCard icon={Lock} value="End-to-End" label="Encrypted" className="absolute top-[35%] right-[4%] pointer-events-auto" delay={1.1} />
                    <FloatingStatCard icon={Zap} value="< 3 Seconds" label="Instant Match" className="absolute bottom-[20%] left-[8%] pointer-events-auto" delay={1.3} />
                </div>
            </section>

            {/* ─── How It Works ───────────────────────────────────────── */}
            <section id="how-it-works" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <SectionTitle
                        badge="How It Works"
                        title="Three steps. Zero friction."
                        subtitle="No downloads, no registration, no hassle. Just pure connection."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {steps.map(({ num, title, desc, icon: Icon }, i) => (
                            <motion.div key={num} {...stagger(0.1 + i * 0.15)}>
                                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full hover:border-white/15 transition-all duration-500 group relative overflow-hidden">
                                    <span className="absolute top-5 right-6 text-[64px] sm:text-[80px] font-black text-white/[0.03] leading-none select-none tracking-tighter">{num}</span>
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-white/10 transition-colors">
                                        <Icon className="w-5 h-5 text-white/70" />
                                    </div>
                                    <h3 className="font-bold text-white/90 text-base sm:text-lg mb-2">{title}</h3>
                                    <p className="text-[13px] sm:text-sm text-white/30 leading-relaxed">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features ───────────────────────────────────────────── */}
            <section id="features" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <SectionTitle
                        badge="Features"
                        title="Everything you need. Nothing you don't."
                        subtitle="Built for simplicity, designed for privacy, engineered for speed."
                    />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                        {features.map(({ icon: Icon, label, desc }, i) => (
                            <motion.div key={label} {...stagger(0.05 + i * 0.1)}>
                                <Card className="glass-card p-4 sm:p-6 rounded-2xl hover:border-white/15 transition-all duration-500 group h-full bg-transparent border-white/[0.06]">
                                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3 sm:mb-5 group-hover:bg-white/[0.08] transition-colors">
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                                    </div>
                                    <h3 className="font-bold text-white/90 mb-1 sm:mb-1.5 text-[13px] sm:text-[15px]">{label}</h3>
                                    <p className="text-[11px] sm:text-[13px] text-white/30 leading-relaxed font-medium">{desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Safety ─────────────────────────────────────────────── */}
            <section id="safety" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <SectionTitle
                        badge="Safety"
                        title="Your privacy is non-negotiable."
                        subtitle="drift is built from the ground up with your safety and anonymity as the top priority."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {safetyFeatures.map(({ icon: Icon, title, desc }, i) => (
                            <motion.div key={title} {...stagger(0.05 + i * 0.1)}>
                                <div className="glass-card rounded-2xl p-5 sm:p-7 h-full hover:border-white/15 transition-all duration-500 group flex gap-4 sm:gap-5">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                        <Icon className="w-5 h-5 text-white/70" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white/90 mb-1.5 text-[14px] sm:text-[15px]">{title}</h3>
                                        <p className="text-[12px] sm:text-[13px] text-white/30 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ ────────────────────────────────────────────────── */}
            <section id="faq" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <SectionTitle
                        badge="FAQ"
                        title="Got questions?"
                        subtitle="Here are answers to the most common ones."
                    />

                    <div className="flex flex-col gap-3 sm:gap-4">
                        {faqs.map(({ q, a }, i) => (
                            <motion.div key={i} {...stagger(0.05 + i * 0.08)}>
                                <div className="glass-card rounded-2xl p-5 sm:p-6 hover:border-white/15 transition-all duration-500">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <HelpCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-white/90 text-[13px] sm:text-[15px] mb-2">{q}</h3>
                                            <p className="text-[12px] sm:text-[13px] text-white/30 leading-relaxed">{a}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Banner ─────────────────────────────────────────── */}
            <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
                <motion.div {...stagger(0)} className="max-w-4xl mx-auto text-center">
                    <div className="glass-card rounded-3xl p-8 sm:p-14 relative overflow-hidden">
                        {/* Ambient glow inside card */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-indigo-500/10 blur-[100px] rounded-full" />

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 relative">
                            Ready to drift?
                        </h2>
                        <p className="text-white/30 text-sm sm:text-base mb-8 max-w-md mx-auto relative">
                            Jump in now. No signup, no downloads, no strings attached.
                        </p>
                        <Button
                            onClick={onStart}
                            size="lg"
                            className="bg-white text-[#0a0a0a] hover:bg-white/90 px-10 py-7 text-[15px] font-bold rounded-full transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_60px_rgba(255,255,255,0.08)] relative"
                        >
                            Start Chatting Now
                            <ArrowRight className="ml-1 w-4.5 h-4.5" />
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* ─── Footer ─────────────────────────────────────────────── */}
            <footer className="relative z-10 w-full border-t border-white/[0.04] mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    {/* Top row */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10 sm:mb-14">
                        {/* Brand column */}
                        <div className="max-w-xs">
                            <span className="text-[22px] font-extrabold tracking-[-0.04em] bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent select-none block mb-3">
                                drift<span className="text-indigo-400">.</span>
                            </span>
                            <p className="text-white/25 text-[13px] leading-relaxed">
                                Anonymous video chat for the curious. No accounts, no tracking — just real conversations.
                            </p>
                        </div>

                        {/* Link columns */}
                        <div className="flex gap-12 sm:gap-16">
                            <div>
                                <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.15em] mb-4">Navigate</h4>
                                <div className="flex flex-col gap-2.5">
                                    <a href="#how-it-works" className="text-[13px] text-white/25 hover:text-white/60 transition-colors">How It Works</a>
                                    <a href="#features" className="text-[13px] text-white/25 hover:text-white/60 transition-colors">Features</a>
                                    <a href="#safety" className="text-[13px] text-white/25 hover:text-white/60 transition-colors">Safety</a>
                                    <a href="#faq" className="text-[13px] text-white/25 hover:text-white/60 transition-colors">FAQ</a>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.15em] mb-4">Connect</h4>
                                <div className="flex flex-col gap-2.5">
                                    <a href="https://github.com/CoderKavyaG/Stranger-Chat" target="_blank" rel="noreferrer" className="text-[13px] text-white/25 hover:text-white/60 transition-colors">GitHub</a>
                                    <a href="https://x.com/goelsahhab" target="_blank" rel="noreferrer" className="text-[13px] text-white/25 hover:text-white/60 transition-colors">Twitter / X</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-white/[0.05] mb-6" />

                    {/* Bottom row */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-white/15 text-[11px] sm:text-[12px] font-medium">
                            © 2025 drift — Built for the curious.
                        </p>
                        <div className="flex items-center gap-4 text-white/15 text-[11px] sm:text-[12px]">
                            <span className="flex items-center gap-1.5">
                                <Lock className="w-3 h-3" /> Peer-to-Peer
                            </span>
                            <Separator orientation="vertical" className="h-3 bg-white/8" />
                            <span>WebRTC</span>
                            <Separator orientation="vertical" className="h-3 bg-white/8" />
                            <span>Open Source</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
