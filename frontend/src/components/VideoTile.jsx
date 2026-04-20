import React, { useEffect, useRef } from 'react';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

export function VideoTile({
  stream,
  ghostName,
  avatarId,
  isMuted,
  isLocal,
  isVideoOff
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getAvatarColor = (id) => {
    return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  };

  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0f] rounded-2xl overflow-hidden ring-2 ring-[#F4600C]/30 hover:ring-[#F4600C]/60 transition-all duration-200">
      {isVideoOff ? (
        // Avatar placeholder
        <div className="w-full h-full flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: getAvatarColor(avatarId) }}>
          <div className="text-5xl font-bold text-white/90">
            {getInitials(ghostName)}
          </div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">
            Camera off
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...(isLocal && { transform: 'scaleX(-1)' })
          }}
        />
      )}

      {/* Bottom-left badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 rounded-full bg-[#1A1A0F]/80 backdrop-blur-md border border-[#F4600C]/30">
        <div
          className="w-5 h-5 rounded-full flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(avatarId) }}
        />
        <span className="text-xs font-bold text-[#F5F0E8] truncate max-w-[120px] uppercase tracking-wider">
          {isLocal ? '• You' : ghostName}
        </span>
      </div>

      {/* Top-right mute indicator */}
      {isMuted && !isLocal && (
        <div className="absolute top-3 right-3 p-2 rounded-lg bg-[#1A1A0F]/80 backdrop-blur-md border border-red-600/50">
          <svg
            className="w-4 h-4 text-red-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </div>
      )}
    </div>
  );
}
