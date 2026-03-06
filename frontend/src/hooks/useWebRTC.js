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

    // Add TURN servers only if we have full credentials
    const turnUrl = import.meta.env.VITE_TURN_URL;
    if (turnUrl && username && credential) {
        servers.push({
            urls: turnUrl,
            username: username,
            credential: credential,
        });
    } else if (turnUrl) {
        console.warn("[WebRTC] VITE_TURN_URL detected but Username/Credential missing.");
    }

    const turnUrl2 = import.meta.env.VITE_TURN_URL_2;
    if (turnUrl2 && username && credential) {
        servers.push({
            urls: turnUrl2,
            username: username,
            credential: credential,
        });
    }

    console.log(`[WebRTC] ICE Servers configured: ${servers.length} servers active`);
    return { iceServers: servers };
};

/**
 * useWebRTC hook
 * Manages the entire WebRTC peer lifecycle via simple-peer.
 *
 * @param {object} params
 * @param {string|null} params.roomId       - Current room ID (null when not matched)
 * @param {boolean}     params.isInitiator  - Whether this peer creates the offer
 * @param {MediaStream|null} params.localStream - Local camera+mic stream
 * @param {function}    params.onRemoteStream - Called with remote MediaStream
 * @param {function}    params.onError       - Called with error string
 */
export function useWebRTC({ roomId, isInitiator, localStream, onRemoteStream, onError }) {
    const peerRef = useRef(null);
    const streamRef = useRef(localStream);
    const signalBuffer = useRef([]); // Store signals that arrive before peer is ready
    const socket = getSocket();

    const destroyPeer = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        signalBuffer.current = []; // Clear buffer
    }, []);

    // ── Update localStream to existing peer ───────────────────────────────────
    useEffect(() => {
        if (peerRef.current && !peerRef.current.destroyed && localStream && streamRef.current !== localStream) {
            if (!streamRef.current) {
                try {
                    peerRef.current.addStream(localStream);
                    console.log("[WebRTC] Stream added to existing peer");
                } catch (e) {
                    console.error("[WebRTC] Failed to add stream", e);
                }
            } else {
                // Replace or add individual tracks
                localStream.getTracks().forEach(newTrack => {
                    const oldTrack = streamRef.current.getTracks().find(t => t.kind === newTrack.kind)
                    if (oldTrack) {
                        try {
                            peerRef.current.replaceTrack(oldTrack, newTrack, streamRef.current);
                        } catch (e) {
                            console.error("[WebRTC] Failed to replace track", e);
                        }
                    } else {
                        try {
                            peerRef.current.addTrack(newTrack, localStream);
                        } catch (e) {
                            console.error("[WebRTC] Failed to add track", e);
                        }
                    }
                })
            }
            streamRef.current = localStream;
        } else if (!peerRef.current) {
            streamRef.current = localStream;
        }
    }, [localStream]);

    // ── Peer creation & Signal listener ──────────────────────────────────────────
    useEffect(() => {
        if (!roomId) return;
        destroyPeer();

        let mounted = true;

        try {
            const peer = new SimplePeer({
                initiator: isInitiator,
                stream: streamRef.current,
                trickle: true,
                config: getIceServers(),
                offerOptions: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                },
            });

            peer.on("signal", (signal) => {
                if (!mounted) return;
                socket.emit("webrtc_signal", { roomId, signal });
            });

            peer.on("stream", (remoteStream) => {
                if (!mounted) return;
                onRemoteStream(remoteStream);
            });

            peer.on("connect", () => {
                console.log("[WebRTC] Connection established");
            });

            peer.on("error", (err) => {
                if (!mounted) return;
                console.error("[WebRTC] Peer error:", err.message);
                onError("WebRTC connection failed. Video transfer may be affected.");
            });

            peerRef.current = peer;

            // Immediately process any buffered signals
            if (signalBuffer.current.length > 0) {
                console.log(`[WebRTC] Processing ${signalBuffer.current.length} buffered signals`);
                signalBuffer.current.forEach(sig => peer.signal(sig));
                signalBuffer.current = [];
            }
        } catch (err) {
            console.error("[WebRTC] Failed to create peer:", err);
            onError("WebRTC setup failed.");
        }

        const handleIncomingSignal = ({ signal }) => {
            if (peerRef.current && !peerRef.current.destroyed) {
                try {
                    peerRef.current.signal(signal);
                } catch (err) {
                    console.warn("[WebRTC] Error signaling:", err.message);
                }
            } else {
                // Buffer the signal if the peer isn't ready but is about to be (we have a roomId)
                console.log("[WebRTC] Buffering signal; peer not ready");
                signalBuffer.current.push(signal);
            }
        };

        socket.on("webrtc_signal", handleIncomingSignal);

        return () => {
            mounted = false;
            socket.off("webrtc_signal", handleIncomingSignal);
            destroyPeer();
        };
    }, [roomId, isInitiator, socket, onRemoteStream, onError, destroyPeer]);

    return { destroyPeer };
}
