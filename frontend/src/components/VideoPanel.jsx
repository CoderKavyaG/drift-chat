import { useEffect, useRef } from "react";

/**
 * VideoPanel
 * Shows local (You) and remote (Stranger) video side by side.
 */
export default function VideoPanel({
    localStream,
    remoteStream,
    isConnected,
    isCamOff,
    webrtcError,
}) {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Attach local stream to <video>
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream to <video>
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="flex flex-col md:flex-row gap-3 w-full">
            {/* You */}
            <div className="relative flex-1 min-h-[200px] md:min-h-[280px] bg-[#111111] rounded-xl overflow-hidden border border-[#2a2a2a]">
                {localStream && !isCamOff ? (
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#6b7280]">
                        <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" />
                        </svg>
                        <span className="text-sm">{isCamOff ? "Camera off" : "No camera"}</span>
                    </div>
                )}
                <span className="absolute bottom-2 left-3 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    You
                </span>
            </div>

            {/* Stranger */}
            <div className="relative flex-1 min-h-[200px] md:min-h-[280px] bg-[#111111] rounded-xl overflow-hidden border border-[#2a2a2a]">
                {webrtcError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <p className="text-xs text-amber-400">Video blocked — text chat still works</p>
                    </div>
                ) : remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#6b7280]">
                        <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">
                            {isConnected ? "Connecting video..." : "Waiting for stranger..."}
                        </span>
                    </div>
                )}
                <span className="absolute bottom-2 left-3 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Stranger
                </span>
            </div>
        </div>
    );
}
