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
    <div className="relative w-full h-full bg-[#111118] rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-white/20 transition-all">
      {isVideoOff ? (
        // Avatar placeholder
        <div className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: getAvatarColor(avatarId) }}>
          <div className="text-4xl font-bold text-white/90">
            {getInitials(ghostName)}
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
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
        <div
          className="w-5 h-5 rounded-full flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(avatarId) }}
        />
        <span className="text-xs font-medium text-white truncate max-w-[100px]">
          {isLocal ? 'You' : ghostName}
        </span>
      </div>

      {/* Top-right mute indicator */}
      {isMuted && !isLocal && (
        <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
