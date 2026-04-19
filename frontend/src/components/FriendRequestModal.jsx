import React from 'react';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

export function FriendRequestModal({ isOpen, onClose, request, onAccept, onReject }) {
  const getAvatarColor = (id) => {
    return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6 w-96">
        <h2 className="text-lg font-semibold text-white mb-4">Friend Request</h2>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-white/5">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: getAvatarColor(request.avatarId) }}
          />
          <div>
            <p className="font-medium text-white">{request.ghostName}</p>
            <p className="text-sm text-white/60">Wants to be friends</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
