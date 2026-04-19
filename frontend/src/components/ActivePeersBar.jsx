import React, { useState } from 'react';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

export function ActivePeersBar({ peers }) {
  const [hoveredPeerId, setHoveredPeerId] = useState(null);

  const getAvatarColor = (id) => {
    return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  };

  const totalCount = peers.length + 1; // +1 for self

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-2">
        {peers.slice(0, 3).map(peer => (
          <div
            key={peer.ghostId}
            className="relative w-6 h-6 rounded-full cursor-pointer"
            style={{ backgroundColor: getAvatarColor(peer.avatarId) }}
            onMouseEnter={() => setHoveredPeerId(peer.ghostId)}
            onMouseLeave={() => setHoveredPeerId(null)}
          >
            {hoveredPeerId === peer.ghostId && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {peer.ghostName}
              </div>
            )}
          </div>
        ))}
        {peers.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-medium">
            +{peers.length - 3}
          </div>
        )}
      </div>
      <span className="text-xs text-white/70 ml-1">
        {totalCount} in room
      </span>
    </div>
  );
}
