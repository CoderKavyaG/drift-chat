import { useEffect, useRef, useCallback } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "./useSocket";

const getIceServers = () => {
    const servers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ];

    const username = import.meta.env.VITE_TURN_USERNAME;
    const credential = import.meta.env.VITE_TURN_CREDENTIAL;
    const turnUrl = import.meta.env.VITE_TURN_URL;
    const turnUrl2 = import.meta.env.VITE_TURN_URL_2;

    if (turnUrl && username && credential) {
        servers.push({ urls: turnUrl, username, credential });
    }
    if (turnUrl2 && username && credential) {
        servers.push({ urls: turnUrl2, username, credential });
    }

    console.log(`[WebRTC] ICE Servers: ${servers.length} configured`);
    return { iceServers: servers };
};

export function useWebRTC({ roomId, isInitiator, localStream, onRemoteStream, onError }) {
    const peerRef = useRef(null);
    const streamRef = useRef(localStream);
    const signalBuffer = useRef([]);
    const socket = getSocket();
    const currentRoomId = useRef(null);

    const destroyPeer = useCallback(() => {
        if (peerRef.current) {
            console.log("[WebRTC] Destroying peer...");
            peerRef.current.destroy();
            peerRef.current = null;
        }
        signalBuffer.current = [];
        currentRoomId.current = null;
    }, []);

    // ── Update Tracks ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!peerRef.current || peerRef.current.destroyed || !localStream) {
            streamRef.current = localStream;
            return;
        }

        if (streamRef.current !== localStream) {
            console.log("[WebRTC] localStream changed, updating tracks");
            if (!streamRef.current) {
                // First time adding stream
                try {
                    peerRef.current.addStream(localStream);
                } catch (e) {
                    console.error("[WebRTC] addStream failed:", e);
                }
            } else {
                // Replace existing tracks
                const oldTracks = streamRef.current.getTracks();
                const newTracks = localStream.getTracks();

                newTracks.forEach(newTrack => {
                    const oldTrack = oldTracks.find(t => t.kind === newTrack.kind);
                    if (oldTrack) {
                        try {
                            peerRef.current.replaceTrack(oldTrack, newTrack, streamRef.current);
                        } catch (e) {
                            console.warn("[WebRTC] replaceTrack failed:", e.message);
                            // Fallback to addTrack if replace fails
                            try { peerRef.current.addTrack(newTrack, localStream); } catch (err) {}
                        }
                    } else {
                        try {
                            peerRef.current.addTrack(newTrack, localStream);
                        } catch (e) {
                            console.error("[WebRTC] addTrack failed:", e);
                        }
                    }
                });
            }
            streamRef.current = localStream;
        }
    }, [localStream]);

    // ── Peer Lifecycle ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!roomId) {
            destroyPeer();
            return;
        }

        // Avoid re-initializing if roomId hasn't changed (React 18 StrictMode fix)
        if (currentRoomId.current === roomId && peerRef.current) {
            return;
        }

        console.log(`[WebRTC] Initializing peer for room: ${roomId}, initiator: ${isInitiator}`);
        destroyPeer();
        currentRoomId.current = roomId;

        try {
            const peer = new SimplePeer({
                initiator: isInitiator,
                stream: streamRef.current || undefined,
                trickle: true,
                config: getIceServers(),
                offerOptions: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                },
            });

            peer.on("signal", (signal) => {
                socket.emit("webrtc_signal", { roomId, signal });
            });

            peer.on("stream", (remoteStream) => {
                console.log("[WebRTC] Received remote stream");
                onRemoteStream(remoteStream);
            });

            peer.on("connect", () => {
                console.log("[WebRTC] Peer connection established");
            });

            peer.on("error", (err) => {
                console.error("[WebRTC] Peer error:", err);
                onError("Connection failed. Video/audio may be unavailable.");
            });

            peerRef.current = peer;

            // Process any signals that arrived before peer was ready
            if (signalBuffer.current.length > 0) {
                console.log(`[WebRTC] Processing ${signalBuffer.current.length} buffered signals`);
                signalBuffer.current.forEach(sig => {
                    try { peer.signal(sig); } catch (e) { console.warn("[WebRTC] Signal failed:", e.message); }
                });
                signalBuffer.current = [];
            }
        } catch (err) {
            console.error("[WebRTC] Peer creation failed:", err);
            onError("WebRTC setup failed.");
        }

        const handleSignal = ({ signal, roomId: incomingRoomId }) => {
            // If the signal is for our current room (or if room matching isn't sent, assume current)
            if (peerRef.current && !peerRef.current.destroyed) {
                try {
                    peerRef.current.signal(signal);
                } catch (e) {
                    console.warn("[WebRTC] Error signaling:", e.message);
                }
            } else {
                console.log("[WebRTC] Buffering incoming signal");
                signalBuffer.current.push(signal);
            }
        };

        socket.on("webrtc_signal", handleSignal);

        return () => {
            // Note: We don't destroyPeer() here because we want it to persist across re-renders 
            // of the same room. destroyPeer() is called when roomId changes or becomes null.
            socket.off("webrtc_signal", handleSignal);
        };
    }, [roomId, isInitiator, socket, onRemoteStream, onError, destroyPeer]);

    return { destroyPeer };
}



