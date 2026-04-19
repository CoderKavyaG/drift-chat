import { useState, useRef, useCallback } from 'react';
import { getICEServers, getUserMedia, getDisplayMedia, enumerateDevices } from '../lib/webrtc';

export function useWebRTC() {
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const screenShareTrackRef = useRef(null);
  
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const createPeerConnection = useCallback((peerId, isInitiator, signaling) => {
    try {
      const iceServers = getICEServers();
      const peerConnection = new RTCPeerConnection({ iceServers });

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote tracks
      peerConnection.ontrack = (event) => {
        console.log('[WebRTC] Received remote track:', event.track.kind);
        const [stream] = event.streams;
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(peerId, stream);
          return newMap;
        });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          signaling.send({
            type: 'ice-candidate',
            targetPeerId: peerId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log('[WebRTC] ICE connection state:', peerConnection.iceConnectionState);
      };

      // Handle negotiation
      peerConnection.onnegotiationneeded = async () => {
        if (isInitiator) {
          try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            signaling.send({
              type: 'offer',
              targetPeerId: peerId,
              sdp: peerConnection.localDescription
            });
          } catch (err) {
            console.error('[WebRTC] Error creating offer:', err);
          }
        }
      };

      // If initiator, create offer
      if (isInitiator) {
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => {
            signaling.send({
              type: 'offer',
              targetPeerId: peerId,
              sdp: peerConnection.localDescription
            });
          })
          .catch(err => console.error('[WebRTC] Error creating offer:', err));
      }

      peerConnectionsRef.current.set(peerId, peerConnection);
      return peerConnection;
    } catch (err) {
      console.error('[WebRTC] Error creating peer connection:', err);
      return null;
    }
  }, []);

  const handleOffer = useCallback(async (fromPeerId, sdp, signaling) => {
    try {
      let peerConnection = peerConnectionsRef.current.get(fromPeerId);
      if (!peerConnection) {
        peerConnection = createPeerConnection(fromPeerId, false, signaling);
      }

      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      signaling.send({
        type: 'answer',
        targetPeerId: fromPeerId,
        sdp: peerConnection.localDescription
      });
    } catch (err) {
      console.error('[WebRTC] Error handling offer:', err);
    }
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (fromPeerId, sdp) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(fromPeerId);
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (err) {
      console.error('[WebRTC] Error handling answer:', err);
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromPeerId, candidate) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(fromPeerId);
      if (!peerConnection) return;

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('[WebRTC] Error adding ICE candidate:', err);
    }
  }, []);

  const handlePeerLeft = useCallback((peerId) => {
    const peerConnection = peerConnectionsRef.current.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(peerId);
    }

    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerId);
      return newMap;
    });
  }, []);

  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await getUserMedia();
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('[WebRTC] Error getting user media:', err);
      return null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return isMuted;

    const audioTracks = localStreamRef.current.getAudioTracks();
    const newMutedState = !isMuted;
    audioTracks.forEach(track => {
      track.enabled = !newMutedState;
    });
    setIsMuted(newMutedState);
    return newMutedState;
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return isCameraOff;

    const videoTracks = localStreamRef.current.getVideoTracks();
    const newCameraOffState = !isCameraOff;
    videoTracks.forEach(track => {
      track.enabled = !newCameraOffState;
    });
    setIsCameraOff(newCameraOffState);
    return newCameraOffState;
  }, [isCameraOff]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await getDisplayMedia();
      const screenVideoTrack = screenStream.getVideoTracks()[0];

      if (!screenVideoTrack) {
        console.error('[WebRTC] No video track from screen share');
        return;
      }

      // Store original camera track
      const originalVideoTrack = localStreamRef.current?.getVideoTracks()[0];

      // Replace track in all peer connections
      const replacementPromises = Array.from(peerConnectionsRef.current.entries()).map(
        async ([peerId, peerConnection]) => {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(screenVideoTrack);
          }
        }
      );

      await Promise.all(replacementPromises);

      // Store screen track and listen for end
      screenShareTrackRef.current = screenVideoTrack;
      screenVideoTrack.onended = async () => {
        console.log('[WebRTC] Screen share ended');
        if (originalVideoTrack) {
          const replacementPromises = Array.from(peerConnectionsRef.current.entries()).map(
            async ([peerId, peerConnection]) => {
              const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
              if (sender) {
                await sender.replaceTrack(originalVideoTrack);
              }
            }
          );
          await Promise.all(replacementPromises);
        }
        screenShareTrackRef.current = null;
        setIsScreenSharing(false);
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.error('[WebRTC] Error starting screen share:', err);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (screenShareTrackRef.current) {
      screenShareTrackRef.current.stop();
      const originalVideoTrack = localStreamRef.current?.getVideoTracks()[0];
      
      if (originalVideoTrack && !isCameraOff) {
        const replacementPromises = Array.from(peerConnectionsRef.current.entries()).map(
          async ([peerId, peerConnection]) => {
            const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
              await sender.replaceTrack(originalVideoTrack);
            }
          }
        );
        await Promise.all(replacementPromises);
      }
      
      screenShareTrackRef.current = null;
      setIsScreenSharing(false);
    }
  }, [isCameraOff]);

  const changeCamera = useCallback(async (deviceId) => {
    try {
      const newStream = await getUserMedia({ video: { deviceId: { exact: deviceId } } });
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (!newVideoTrack) return;

      // Remove old video tracks from local stream
      const oldVideoTracks = localStreamRef.current?.getVideoTracks() || [];
      oldVideoTracks.forEach(track => track.stop());

      // Add new video track to local stream
      if (localStreamRef.current) {
        localStreamRef.current.removeTrack(...oldVideoTracks);
        localStreamRef.current.addTrack(newVideoTrack);
      }

      // Replace video track in all peer connections
      const replacementPromises = Array.from(peerConnectionsRef.current.entries()).map(
        async ([peerId, peerConnection]) => {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }
      );

      await Promise.all(replacementPromises);
    } catch (err) {
      console.error('[WebRTC] Error changing camera:', err);
    }
  }, []);

  const changeAudio = useCallback(async (deviceId) => {
    try {
      const newStream = await getUserMedia({ audio: { deviceId: { exact: deviceId } } });
      const newAudioTrack = newStream.getAudioTracks()[0];

      if (!newAudioTrack) return;

      // Remove old audio tracks
      const oldAudioTracks = localStreamRef.current?.getAudioTracks() || [];
      oldAudioTracks.forEach(track => track.stop());

      // Add new audio track
      if (localStreamRef.current) {
        localStreamRef.current.removeTrack(...oldAudioTracks);
        localStreamRef.current.addTrack(newAudioTrack);
      }

      // Replace audio track in all peer connections
      const replacementPromises = Array.from(peerConnectionsRef.current.entries()).map(
        async ([peerId, peerConnection]) => {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'audio');
          if (sender) {
            await sender.replaceTrack(newAudioTrack);
          }
        }
      );

      await Promise.all(replacementPromises);
    } catch (err) {
      console.error('[WebRTC] Error changing audio:', err);
    }
  }, []);

  const hangUp = useCallback(() => {
    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current.clear();

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear remote streams
    setRemoteStreams(new Map());
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
  }, []);

  return {
    localStreamRef,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    initializeLocalStream,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    changeCamera,
    changeAudio,
    hangUp,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handlePeerLeft,
    createPeerConnection
  };
}
