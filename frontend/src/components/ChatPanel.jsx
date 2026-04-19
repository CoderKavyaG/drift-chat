import React, { useState, useEffect, useRef } from 'react';

export function ChatPanel({ visible, onClose, remoteStreams, onSendMessage, typingPeers }) {
  const [messages, setMessages] = useState([]);
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
      setMessages(prev => [...prev, { text: input, local: true, timestamp: Date.now() }]);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {visible && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Chat Panel */}
      <div
        className={`fixed md:relative right-0 bottom-0 w-full md:w-80 h-screen md:h-full bg-[#0a0a0f] border-l border-white/10 flex flex-col transition-transform duration-300 z-50 ${
          visible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        } md:max-h-96 lg:max-h-full`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Chat</h3>
          <button
            onClick={onClose}
            className="md:hidden text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.local ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.local
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/90'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {Object.values(showTyping).some(v => v) && (
            <div className="text-xs text-white/50 italic">
              Someone is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInput}
            onKeyPress={handleKeyPress}
            placeholder="Say something..."
            className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
