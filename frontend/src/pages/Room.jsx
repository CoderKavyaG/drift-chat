import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIdentity } from '../hooks/useIdentity';
import { useSignaling } from '../hooks/useSignaling';
import { useWebRTC } from '../hooks/useWebRTC';
import { joinRoom } from '../lib/api';
import { VideoTile } from '../components/VideoTile';
import { ChatPanel } from '../components/ChatPanel';
import { ControlBar } from '../components/ControlBar';
import { ActivePeersBar } from '../components/ActivePeersBar';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { SettingsModal } from '../components/SettingsModal';
import { ReportModal } from '../components/ReportModal';
import { GhostIdentityBadge } from '../components/GhostIdentityBadge';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

export function Room() {
  const { roomId: routeRoomId } = useParams();
  const navigate = useNavigate();
  const { token, ghostId, ghostName, avatarId } = useIdentity();

  const [roomId, setRoomId] = useState(routeRoomId || null);
  const [roomCode, setRoomCode] = useState(null);
  const [peers, setPeers] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [roomKilledOverlay, setRoomKilledOverlay] = useState(false);
  const [nextStrangerCountdown, setNextStrangerCountdown] = useState(null);
  const [loading, setLoading] = useState(!routeRoomId);

  const webRTC = useWebRTC();
  const signalingRef = useRef(null);
  const roomModeRef = useRef('random');

  const getAvatarColor = (id) => {
    return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  };

  // Initialize local stream on mount
  useEffect(() => {
    const initStream = async () => {
      const stream = await webRTC.initializeLocalStream();
      if (!stream) {
        alert('Camera/microphone access denied');
        navigate('/');
      }
    };
    initStream();
  }, [webRTC, navigate]);

  // Join room
  useEffect(() => {
    const joinRoomFn = async () => {
      if (!roomId && !routeRoomId) {
        try {
          const result = await joinRoom('random');
          setRoomId(result.roomId);
          setRoomCode(result.roomCode);
          roomModeRef.current = 'random';
          setPeers(result.peers || []);
          setLoading(false);
        } catch (err) {
          console.error('Error joining room:', err);
          navigate('/');
        }
      } else if (roomId) {
        setLoading(false);
      }
    };
    joinRoomFn();
  }, [roomId, routeRoomId, navigate]);

  // Signaling message handler
  const handleSignalingMessage = useCallback((message) => {
    switch (message.type) {
      case 'room-joined':
        setPeers(message.peers || []);
        // Create peer connections for each existing peer
        message.peers?.forEach(peer => {
          if (webRTC && signalingRef.current) {
            webRTC.createPeerConnection(peer.ghostId, true, signalingRef.current);
          }
        });
        break;

      case 'peer-joined':
        setPeers(prev => [...prev, {
          ghostId: message.peerId,
          ghostName: message.ghostName,
          avatarId: message.avatarId
        }]);
        if (webRTC && signalingRef.current) {
          webRTC.createPeerConnection(message.peerId, true, signalingRef.current);
        }
        break;

      case 'peer-left':
        setPeers(prev => prev.filter(p => p.ghostId !== message.peerId));
        webRTC.handlePeerLeft(message.peerId);
        break;

      case 'offer':
        webRTC.handleOffer(message.fromPeerId, message.sdp, signalingRef.current);
        break;

      case 'answer':
        webRTC.handleAnswer(message.fromPeerId, message.sdp);
        break;

      case 'ice-candidate':
        webRTC.handleIceCandidate(message.fromPeerId, message.candidate);
        break;

      case 'chat-message':
        if (message.fromPeerId !== ghostId) {
          setUnreadCount(prev => prev + 1);
        }
        break;

      case 'room-killed':
        setRoomKilledOverlay(true);
        setTimeout(() => navigate('/'), 3000);
        break;

      case 'typing':
        // Handle typing indicator
        break;

      default:
        break;
    }
  }, [ghostId, webRTC, navigate]);

  const { send: signalingsSend, connectionState } = useSignaling(token, handleSignalingMessage);
  signalingRef.current = { send: signalingsSend };

  // Join room via signaling
  useEffect(() => {
    if (roomId && signalingsSend && connectionState === 'connected') {
      signalingsSend({
        type: 'join-room',
        roomId
      });
    }
  }, [roomId, signalingsSend, connectionState]);

  // Auto-next-stranger logic: trigger countdown when all peers leave
  useEffect(() => {
    if (roomModeRef.current === 'random' && peers.length === 0 && nextStrangerCountdown === null) {
      setNextStrangerCountdown(3);
    }
  }, [peers.length]);

  // Auto-next-stranger countdown
  useEffect(() => {
    if (nextStrangerCountdown === null) return;

    if (nextStrangerCountdown === 0) {
      handleNextStranger();
      setNextStrangerCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setNextStrangerCountdown(nextStrangerCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [nextStrangerCountdown]);

  const handleNextStranger = useCallback(async () => {
    webRTC.hangUp();
    try {
      const result = await joinRoom('random');
      setRoomId(result.roomId);
      setRoomCode(result.roomCode);
      setPeers(result.peers || []);
      navigate(`/room/${result.roomId}`);
    } catch (err) {
      console.error('Error joining new room:', err);
      navigate('/');
    }
  }, [webRTC, navigate]);

  const handleHangup = useCallback(() => {
    webRTC.hangUp();
    if (roomId && signalingsSend) {
      signalingsSend({ type: 'leave-room', roomId });
    }
    navigate('/');
  }, [webRTC, roomId, signalingsSend, navigate]);

  const handleReport = useCallback((reportData) => {
    if (signalingsSend && reportTarget) {
      signalingsSend({
        type: 'report',
        targetPeerId: reportTarget,
        reason: reportData.reason,
        roomId
      });
    }
    setReportOpen(false);
  }, [signalingsSend, reportTarget, roomId]);

  // Layout calculation
  const remoteCount = peers.length;
  let gridCols = 1;
  let gridRows = 1;

  if (remoteCount === 1) {
    gridCols = 2;
    gridRows = 1;
  } else if (remoteCount === 2) {
    gridCols = 3;
    gridRows = 1;
  } else if (remoteCount >= 3) {
    gridCols = 2;
    gridRows = 2;
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#1A1A0F] flex items-center justify-center">
        <p className="text-[#F5F0E8]/60 font-medium">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#1A1A0F] flex flex-col overflow-hidden">
      
      {/* TOP BAR */}
      <div className="h-14 border-b border-[#F4600C]/20 px-6 flex items-center justify-between bg-[#1A1A0F]/50 backdrop-blur-sm">
        {/* Left: Back button */}
        <button
          onClick={handleHangup}
          className="flex items-center gap-2 text-[#F5F0E8] hover:text-[#F4600C] transition-colors"
        >
          <span className="text-xl">←</span>
        </button>

        {/* Center: Room code */}
        <div className="flex-1 text-center">
          {roomCode && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`drift.app/room?code=${roomCode}`);
                alert('Link copied!');
              }}
              className="text-xs font-bold uppercase tracking-widest text-[#F5F0E8]/70 hover:text-[#F4600C] transition-colors"
              title="Click to copy room code"
            >
              Room • {roomCode}
            </button>
          )}
        </div>

        {/* Right: Status badges */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-widest text-[#F5F0E8]/60">
            {remoteCount} {remoteCount === 1 ? 'person' : 'people'}
          </div>
          <div className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`} />
        </div>
      </div>

      {/* MAIN CONTENT: Two-column layout */}
      <div className="flex-1 flex overflow-hidden gap-0">
        
        {/* LEFT: Video Grid */}
        <div className="flex-1 overflow-hidden p-4 bg-[#1A1A0F] flex flex-col">
          {remoteCount === 0 ? (
            // Waiting state
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden ring-2 ring-[#F4600C]/30 bg-black">
                {webRTC.localStreamRef.current && (
                  <video
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)'
                    }}
                    srcObject={webRTC.localStreamRef.current}
                  />
                )}

                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[#F5F0E8] font-bold mb-3 uppercase tracking-wider">Waiting for someone...</p>
                    <div className="flex justify-center gap-2">
                      <div className="w-2 h-2 bg-[#F4600C] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#F4600C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-[#F4600C] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Video grid with responsive layout
            <div
              className="w-full h-full gap-3"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(2, gridCols)}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                gridAutoFlow: 'dense'
              }}
            >
              {/* Local video */}
              {webRTC.localStreamRef.current && (
                <VideoTile
                  stream={webRTC.localStreamRef.current}
                  ghostName={ghostName}
                  avatarId={avatarId}
                  isMuted={webRTC.isMuted}
                  isLocal
                  isVideoOff={webRTC.isCameraOff}
                />
              )}

              {/* Remote videos */}
              {peers.map(peer => (
                <VideoTile
                  key={peer.ghostId}
                  stream={webRTC.remoteStreams.get(peer.ghostId)}
                  ghostName={peer.ghostName}
                  avatarId={peer.avatarId}
                  isMuted={false}
                  isLocal={false}
                  isVideoOff={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Chat Panel */}
        <div className="w-80 border-l border-[#F4600C]/20 flex flex-col bg-[#0a0a0f]">
          <ChatPanel
            visible={true}
            onClose={() => setChatVisible(false)}
            remoteStreams={webRTC.remoteStreams}
            onSendMessage={(msg) => {
              if (signalingsSend && roomId) {
                signalingsSend({ ...msg, roomId });
              }
            }}
            typingPeers={[]}
            isPermanent={true}
          />
        </div>
      </div>

      {/* BOTTOM: Control Bar */}
      <div className="h-24 border-t border-[#F4600C]/20 px-6 py-4 flex items-center justify-center gap-4 bg-[#1A1A0F]/50 backdrop-blur-sm">
        <ControlBar
          isMuted={webRTC.isMuted}
          onToggleMute={webRTC.toggleMute}
          isCameraOff={webRTC.isCameraOff}
          onToggleCamera={webRTC.toggleCamera}
          isScreenSharing={webRTC.isScreenSharing}
          onStartScreenShare={webRTC.startScreenShare}
          onStopScreenShare={webRTC.stopScreenShare}
          onToggleChat={() => {
            setChatVisible(!chatVisible);
            if (!chatVisible) setUnreadCount(0);
          }}
          unreadCount={unreadCount}
          onNextStranger={handleNextStranger}
          onReport={() => {
            if (peers.length > 0) {
              setReportTarget(peers[0].ghostId);
              setReportOpen(true);
            }
          }}
          onSettings={() => setSettingsOpen(true)}
          onHangup={handleHangup}
        />
      </div>

      {/* Room Killed Overlay */}
      {roomKilledOverlay && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center px-6 py-12 bg-[#1A1A0F] rounded-2xl border border-[#F4600C]/30">
            <p className="text-xl font-bold text-[#F5F0E8] mb-4 uppercase tracking-wider">Room Closed</p>
            <p className="text-[#F5F0E8]/60 font-medium">This room has been terminated</p>
          </div>
        </div>
      )}

      {/* Next Stranger Countdown */}
      {nextStrangerCountdown !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="text-center px-8 py-12 bg-[#1A1A0F] rounded-2xl border border-[#F4600C]/30">
            <p className="text-lg font-bold text-[#F5F0E8] mb-4 uppercase tracking-wider">Person Left</p>
            <p className="text-[#F5F0E8]/60 font-medium mb-6">Finding next match in...</p>
            <div className="text-6xl font-bold text-[#F4600C] mb-8">{nextStrangerCountdown}</div>
            <button
              onClick={() => setNextStrangerCountdown(null)}
              className="px-6 py-2 bg-[#F4600C] hover:bg-[#E55100] text-[#1A1A0F] font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onCameraChange={webRTC.changeCamera}
        onAudioChange={webRTC.changeAudio}
        localStream={webRTC.localStreamRef.current}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetPeerId={reportTarget}
        onSubmit={handleReport}
      />
    </div>
  );
}
