import { useState, useEffect, useRef } from "react"

const SPEAKING_THRESHOLD = 18
const SILENCE_DEBOUNCE_MS = 400

export function useVoiceActivity(stream, isMuted) {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const audioCtxRef = useRef(null)
    const analyserRef = useRef(null)
    const rafRef = useRef(null)
    const silenceTimerRef = useRef(null)

    useEffect(() => {
        if (!stream || isMuted) {
            setIsSpeaking(false)
            return
        }

        const audioTracks = stream.getAudioTracks()
        if (!audioTracks.length) return

        let ctx
        try {
            ctx = new AudioContext()
            audioCtxRef.current = ctx

            const analyser = ctx.createAnalyser()
            analyser.fftSize = 512
            analyser.smoothingTimeConstant = 0.4
            analyserRef.current = analyser

            const source = ctx.createMediaStreamSource(stream)
            source.connect(analyser)

            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const tick = () => {
                analyser.getByteFrequencyData(dataArray)
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length

                if (avg > SPEAKING_THRESHOLD) {
                    clearTimeout(silenceTimerRef.current)
                    setIsSpeaking(true)
                } else {
                    silenceTimerRef.current = setTimeout(() => setIsSpeaking(false), SILENCE_DEBOUNCE_MS)
                }

                rafRef.current = requestAnimationFrame(tick)
            }

            rafRef.current = requestAnimationFrame(tick)
        } catch (err) {
            console.error("[VAD] AudioContext failed:", err)
        }

        return () => {
            cancelAnimationFrame(rafRef.current)
            clearTimeout(silenceTimerRef.current)
            if (ctx && ctx.state !== "closed") ctx.close()
            setIsSpeaking(false)
        }
    }, [stream, isMuted])

    return isSpeaking
}
