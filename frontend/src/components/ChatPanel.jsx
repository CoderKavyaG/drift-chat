import React, { useState, useEffect, useRef } from 'react';

export function ChatPanel({ visible, onClose, remoteStreams, onSendMessage, typingPeers, isPermanent, messages = [] }) {
  const [input, setInput] = useState('');
  const [typingDebounceTimer, setTypingDebounceTimer] = useState(null);
  const [showTyping, setShowTyping] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Handle typing indicators
    typingPeers.forEach(peerId => {
      setShowTyping(prev => ({ ...prev, [peerId]: true }));
      const timer = setTimeout(() => {
        setShowTyping(prev => ({ ...prev, [peerId]: false }));
      }, 2000);
      return () => clearTimeout(timer);
    });
  }, [typingPeers]);

  const handleInput = (e) => {
    setInput(e.target.value);

    // Debounced typing indicator
    if (typingDebounceTimer) {
      clearTimeout(typingDebounceTimer);
    }

    const timer = setTimeout(() => {
      onSendMessage({ type: 'typing' });
    }, 100);
    setTypingDebounceTimer(timer);
  };

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage({ type: 'chat-message', text: input });
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // For permanent panels, ignore visible prop
  const shouldShow = isPermanent ? true : visible;

  return (
    <>
      {/* Overlay for mobile non-permanent */}
      {visible && !isPermanent && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Chat Panel */}
      <div
        className={`${isPermanent ? 'relative' : 'fixed md:relative'} right-0 ${!isPermanent ? 'bottom-0' : ''} w-full ${isPermanent ? 'w-full' : 'md:w-80'} h-screen md:h-full bg-[#0a0a0f] border-l border-[#F4600C]/20 flex flex-col transition-transform duration-300 ${!isPermanent ? 'z-50' : 'z-0'} ${
          !isPermanent && !visible ? 'translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#F4600C]/20 bg-[#0a0a0f]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#F4600C] rounded-full animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#F5F0E8]">Chat</h3>
          </div>
          {!isPermanent && (
            <button
              onClick={onClose}
              className="md:hidden text-[#F5F0E8]/60 hover:text-[#F4600C] transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#F4600C]/30 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#F5F0E8]/40 text-center">
              <p className="text-sm">Say hello to start chatting</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={`msg-${msg.timestamp}-${idx}`} className={`flex ${msg.local ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2 rounded-lg text-sm font-medium break-words ${
                      msg.local
                        ? 'bg-[#F4600C] text-[#1A1A0F]'
                        : 'bg-[#F5F0E8]/10 text-[#F5F0E8] border border-[#F5F0E8]/20'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {Object.values(showTyping).some(v => v) && (
                <div className="flex justify-start">
                  <div className="bg-[#F5F0E8]/10 px-4 py-2 rounded-lg border border-[#F5F0E8]/20">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-2 h-2 bg-[#F5F0E8]/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#F5F0E8]/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-[#F5F0E8]/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#F4600C]/20 bg-[#0a0a0f]/80 backdrop-blur-sm flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInput}
            onKeyPress={handleKeyPress}
            placeholder="Say something..."
            className="flex-1 bg-[#1A1A0F] border border-[#F5F0E8]/30 text-[#F5F0E8] placeholder-[#F5F0E8]/50 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F4600C] focus:border-[#F4600C] transition-all"
          />
          <button
            onClick={handleSend}
            className="bg-[#F4600C] hover:bg-[#E55100] text-[#1A1A0F] px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
