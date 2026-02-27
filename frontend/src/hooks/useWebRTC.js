import { useEffect, useRef, useCallback } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "./useSocket";

const STUN_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
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
    const socket = getSocket();

    // ── Helper: destroy current peer cleanly ─────────────────────────────────
    const destroyPeer = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
    }, []);

    // ── Create peer when roomId + localStream are ready ───────────────────────
    useEffect(() => {
        if (!roomId || !localStream) return;

        destroyPeer();

        try {
            const peer = new SimplePeer({
                initiator: isInitiator,
                stream: localStream,
                trickle: true,
                config: STUN_SERVERS,
            });

            // When simple-peer generates ICE/SDP signal data → send via socket
            peer.on("signal", (signal) => {
                socket.emit("webrtc_signal", { roomId, signal });
            });

            // When we receive the remote stream → surface it to the parent
            peer.on("stream", (remoteStream) => {
                onRemoteStream(remoteStream);
            });

            peer.on("error", (err) => {
                console.error("[WebRTC] Peer error:", err.message);
                onError("WebRTC connection failed. Falling back to text-only mode.");
            });

            peer.on("close", () => {
                console.log("[WebRTC] Peer connection closed");
            });

            peerRef.current = peer;
        } catch (err) {
            console.error("[WebRTC] Failed to create peer:", err);
            onError("WebRTC setup failed. Text chat still available.");
        }

        return () => {
            destroyPeer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, isInitiator, localStream]);

    // ── Feed incoming signals from socket into the peer ───────────────────────
    useEffect(() => {
        const handleSignal = ({ signal }) => {
            if (peerRef.current && !peerRef.current.destroyed) {
                try {
                    peerRef.current.signal(signal);
                } catch (err) {
                    console.error("[WebRTC] Signal error:", err.message);
                }
            }
        };

        socket.on("webrtc_signal", handleSignal);
        return () => socket.off("webrtc_signal", handleSignal);
    }, [socket]);

    return { destroyPeer };
}
