import React from 'react';

export function ConnectionStatus({ connectionState }) {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'reconnecting':
        return 'bg-orange-500 animate-pulse';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusLabel = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting';
      case 'reconnecting':
        return 'Reconnecting';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs text-white/70">{getStatusLabel()}</span>
    </div>
  );
}
