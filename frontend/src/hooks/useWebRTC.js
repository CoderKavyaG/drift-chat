import { useEffect, useRef, useCallback } from "react";
import SimplePeer from "simple-peer";
import { getSocket } from "./useSocket";

const getIceServers = () => {
    const servers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
    ];

    const username = import.meta.env.VITE_TURN_USERNAME;
    const credential = import.meta.env.VITE_TURN_CREDENTIAL;
    const turnUrl = import.meta.env.VITE_TURN_URL;
    const turnUrl2 = import.meta.env.VITE_TURN_URL_2;

    if (turnUrl && username && credential) {
        servers.push({ urls: turnUrl, username, credential });
        console.log("[WebRTC] TURN Server 1 configured:", turnUrl);
    } else {
        console.warn("[WebRTC] TURN Server 1 NOT configured - missing credentials");
    }
    
    if (turnUrl2 && username && credential) {
        servers.push({ urls: turnUrl2, username, credential });
        console.log("[WebRTC] TURN Server 2 configured:", turnUrl2);
    }

    console.log(`[WebRTC] Total ICE Servers: ${servers.length}`);
    servers.forEach((srv, i) => console.log(`  [${i}] ${srv.urls}`));
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
            console.log("[WebRTC] localStream changed, syncing tracks...");
            const peer = peerRef.current;
            
            if (!streamRef.current && localStream) {
                // First time attaching stream - add only if connection not yet established
                console.log("[WebRTC] Adding local stream tracks for first time");
                const tracks = localStream.getTracks();
                
                // Check connection state - don't add if already connected (avoids renegotiation issues)
                const connState = peer._pc?.connectionState;
                if (connState === "connected" || connState === "completed") {
                    console.warn(`[WebRTC] Connection already ${connState} - skipping track add`);
                    streamRef.current = localStream;
                    return;
                }
                
                tracks.forEach((track) => {
                    try {
                        console.log(`[WebRTC] Adding ${track.kind} track (conn state: ${connState})`);
                        peer.addTrack(track, localStream);
                    } catch (e) {
                        console.error(`[WebRTC] addTrack(${track.kind}) failed:`, e);
                    }
                });
            } else if (streamRef.current && localStream) {
                // Replace or add individual tracks
                const newTracks = localStream.getTracks();
                newTracks.forEach(newTrack => {
                    try {
                        // SimplePeer internal track management
                        const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === newTrack.kind);
                        if (sender) {
                            sender.replaceTrack(newTrack);
                        } else {
                            peer.addTrack(newTrack, localStream);
                        }
                    } catch (e) {
                        console.warn(`[WebRTC] syncTrack (${newTrack.kind}) failed:`, e.message);
                    }
                });
            } else if (streamRef.current && !localStream) {
                // Stream removed
                try {
                    peer.removeStream(streamRef.current);
                } catch (e) {}
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
            console.log(`[WebRTC] Stream status at peer creation - initiator: ${isInitiator}, hasStream: ${!!streamRef.current}`);
            
            // Log local stream tracks
            if (streamRef.current) {
                const audioTracks = streamRef.current.getAudioTracks();
                const videoTracks = streamRef.current.getVideoTracks();
                console.log(`[WebRTC] Local stream tracks - audio: ${audioTracks.length}, video: ${videoTracks.length}`);
                audioTracks.forEach((t, i) => console.log(`  Audio track ${i}: enabled=${t.enabled}`));
                videoTracks.forEach((t, i) => console.log(`  Video track ${i}: enabled=${t.enabled}`));
            }
            
            const peer = new SimplePeer({
                initiator: isInitiator,
                stream: streamRef.current || undefined,
                trickle: true,
                config: getIceServers(),
                offerOptions: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                },
                answerOptions: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                },
            });

            peer.on("signal", (signal) => {
                console.log(`[WebRTC] Sending signal (${signal.type})`);
                if (signal.type === "offer" || signal.type === "answer") {
                    const hasAudio = signal.sdp?.includes("m=audio");
                    const hasVideo = signal.sdp?.includes("m=video");
                    console.log(`[WebRTC] ${signal.type} SDP includes - audio: ${hasAudio}, video: ${hasVideo}`);
                }
                socket.emit("webrtc_signal", { roomId, signal });
            });

            // Use track event (more reliable than stream event)
            const remoteStreams = new Map();
            peer.on("track", (track, stream) => {
                console.log(`[WebRTC] Received remote track: ${track.kind} from stream ${stream.id}`);
                
                // If this is a new stream, emit it
                if (!remoteStreams.has(stream.id)) {
                    remoteStreams.set(stream.id, true);
                    onRemoteStream(stream);
                    console.log(`[WebRTC] Emitted new remote stream: ${stream.id}`);
                }
                
                // Always ensure audio tracks are enabled
                stream.getAudioTracks().forEach((t, idx) => {
                    console.log(`[WebRTC] Audio track ${idx}: enabled=${t.enabled} (setting to true)`);
                    t.enabled = true;
                });
                
                // Log all tracks on the stream
                console.log(`[WebRTC] Stream ${stream.id} now has:`, {
                    audio: stream.getAudioTracks().length,
                    video: stream.getVideoTracks().length
                });
            });

            // Fallback for browsers/scenarios where only 'stream' event fires
            peer.on("stream", (remoteStream) => {
                console.log("[WebRTC] Received remote stream (fallback):", remoteStream.id);
                if (!remoteStreams.has(remoteStream.id)) {
                    remoteStreams.set(remoteStream.id, true);
                    remoteStream.getAudioTracks().forEach(t => {
                        console.log("[WebRTC] Enabling audio track from stream event");
                        t.enabled = true;
                    });
                    onRemoteStream(remoteStream);
                    console.log("[WebRTC] Emitted remote stream from fallback handler");
                }
            });

            peer.on("connect", () => {
                console.log("[WebRTC] Peer connection established");
            });

            peer.on("error", (err) => {
                console.error("[WebRTC] Peer error:", err);
                console.error("[WebRTC] Error details - Name:", err.name, "Message:", err.message);
                if (err.message.includes("Connection")) {
                    console.error("[WebRTC] Connection failed - likely TURN server or firewall issue");
                }
                onError("Connection failed. Video/audio may be unavailable.");
            });

            peer.on("connectionstatechange", (state) => {
                console.log("[WebRTC] Connection state:", state);
            });

            peerRef.current = peer;

            // Process any signals that arrived before peer was ready
            if (signalBuffer.current.length > 0) {
                console.log(`[WebRTC] Processing ${signalBuffer.current.length} buffered signals`);
                signalBuffer.current.forEach(sig => {
                    try { 
                        peer.signal(sig); 
                    } catch (e) { 
                        console.warn("[WebRTC] Signal application failed:", e.message); 
                    }
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





