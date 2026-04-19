import React from 'react';
import { useIdentity } from '../hooks/useIdentity';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

export function GhostIdentityBadge() {
  const { ghostName, avatarId } = useIdentity();

  if (!ghostName) {
    return null;
  }

  const getAvatarColor = (id) => {
    return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
      <div
        className="w-6 h-6 rounded-full flex-shrink-0"
        style={{ backgroundColor: getAvatarColor(avatarId) }}
      />
      <span className="text-sm font-medium text-white truncate max-w-[120px]">
        {ghostName}
      </span>
    </div>
  );
}
