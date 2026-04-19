import React, { useState } from 'react';

function IconButton({ icon: Icon, label, onClick, isActive, isRed, isDisabled }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : isRed
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : isActive
            ? 'bg-blue-600 text-white'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon className="w-5 h-5" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 16.91c-1.48 1.46-3.51 2.37-5.77 2.37-2.26 0-4.29-.91-5.77-2.37M19 12c0 .55.45 1 1 1s1-.45 1-1c0-2.21-.9-4.21-2.35-5.65-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41.87.87 1.41 2.04 1.41 3.33 0 .55.45 1 1 1s1-.45 1-1c0-1.66-.67-3.16-1.76-4.24-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41 1.09 1.09 1.76 2.58 1.76 4.24z" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.64 2.05 6.09 4.84l2.26-2.26c.43-.43.85-.82 1.24-1.18zM4.41 2.86L2.86 4.41 7.5 9v.5c0 1.66 1.34 3 3 3 .36 0 .69-.08 1-.21v3.5c-.33.05-.66.15-1 .15-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72v2.02c2.84-.48 5-2.94 5-5.74v-.5l4.59 4.59 1.55-1.55L4.41 2.86zM12 4L9.91 6.09C9.93 6.05 9.96 6.02 9.98 5.98L12 4z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-5-11l-5.5 6.5h3v3h4v-3h3L16 8z" />
    </svg>
  );
}

function CameraOffIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-5-11l-5.5 6.5h3v3h4v-3h3L16 8z" opacity="0.5" />
      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ScreenShareIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-6-7h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6v-2h14v2zm0-3H6V9h14v2zm0-3H6V6h14v2z" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.36 6l.4 2H18v6h-6.36l-.4-2H7V6h5.36M14 4H6c-1.1 0-2 .9-2 2v12h2v4l4-4h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.09-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.09.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.12-.62l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

function HangupIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 10.5V7c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v3.5C2 11.38 2.62 12 3.5 12H4v2c0 .55.45 1 1 1h11c.55 0 1-.45 1-1v-2h.5c.88 0 1.5-.62 1.5-1.5zm-2 1.5h-9V8h9v3z" opacity="0.5" />
      <path d="M19.95 21c.1 0 .2-.02.29-.07.79-.4 1.18-1.22.98-2.08l-1.89-9.1c-.12-.6-.65-1.05-1.27-1.05h-.5v-3.5C17 2.62 16.38 2 15.5 2H3.5C2.62 2 2 2.62 2 3.5v12c0 .88.62 1.5 1.5 1.5h.5v3.5c0 .55.45 1 1 1s1-.45 1-1v-3.5h9v3.5c0 .55.45 1 1 1s1-.45 1-1v-3.5h.5c.62 0 1.15-.45 1.27-1.05l1.89-9.1c.2-.86-.19-1.68-.98-2.08-.09-.05-.19-.07-.29-.07-.62 0-1.16.45-1.27 1.05l-1.5 7.25H5V4h10v6h1.5l1.5 7.25c.11.6.65 1.05 1.27 1.05z" />
    </svg>
  );
}

export function ControlBar({
  isMuted,
  onToggleMute,
  isCameraOff,
  onToggleCamera,
  isScreenSharing,
  onStartScreenShare,
  onStopScreenShare,
  onToggleChat,
  unreadCount,
  onNextStranger,
  onReport,
  onSettings,
  onHangup
}) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-black/60 backdrop-blur-lg border border-white/10">
      <IconButton
        icon={isMuted ? MicOffIcon : MicIcon}
        label={isMuted ? 'Unmute' : 'Mute'}
        onClick={onToggleMute}
        isActive={!isMuted}
      />

      <IconButton
        icon={isCameraOff ? CameraOffIcon : CameraIcon}
        label={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
        onClick={onToggleCamera}
        isActive={!isCameraOff}
      />

      <IconButton
        icon={ScreenShareIcon}
        label={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
        isActive={isScreenSharing}
      />

      <div className="relative">
        <IconButton
          icon={ChatIcon}
          label="Chat"
          onClick={onToggleChat}
        />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {unreadCount}
          </div>
        )}
      </div>

      <IconButton
        icon={SkipIcon}
        label="Next stranger"
        onClick={onNextStranger}
      />

      <IconButton
        icon={FlagIcon}
        label="Report"
        onClick={onReport}
      />

      <IconButton
        icon={SettingsIcon}
        label="Settings"
        onClick={onSettings}
      />

      <IconButton
        icon={HangupIcon}
        label="Hang up"
        onClick={onHangup}
        isRed
      />
    </div>
  );
}
