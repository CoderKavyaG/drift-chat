import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIdentity } from '../hooks/useIdentity';
import { useSignaling } from '../hooks/useSignaling';
import { getFriendChat, getFriendChatMessages, postFriendChatMessage } from '../lib/api';

export function FriendChat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { token, ghostName } = useIdentity();

  const [friendship, setFriendship] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessage = useCallback((message) => {
    if (message.type === 'chat-message' && message.fromPeerId !== ghostName) {
      setMessages(prev => [...prev, {
        text: message.text,
        sender: message.ghostName,
        timestamp: message.timestamp,
        isLocal: false
      }]);
    }
  }, [ghostName]);

  const { send: signalingsSend } = useSignaling(token, handleMessage);

  useEffect(() => {
    const loadFriendship = async () => {
      try {
        const data = await getFriendChat(chatId);
        setFriendship(data);

        const messagesData = await getFriendChatMessages(chatId);
        setMessages(messagesData.messages || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading friend chat:', err);
        setError('Chat not found or expired');
        setLoading(false);
      }
    };

    loadFriendship();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageText = input;
    setInput('');

    // Add to local messages immediately
    setMessages(prev => [...prev, {
      text: messageText,
      sender: ghostName,
      timestamp: Date.now(),
      isLocal: true
    }]);

    try {
      await postFriendChatMessage(chatId, messageText);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const expiryTime = friendship?.expiresAt ? new Date(friendship.expiresAt) : null;
  const timeRemaining = expiryTime ? Math.max(0, expiryTime.getTime() - Date.now()) : 0;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  return (
    <div className="w-full h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Friend Chat</h1>
          <p className="text-xs text-white/50 mt-1">
            Expires in {hoursRemaining}h
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/60">No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isLocal ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.isLocal
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/90'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 px-6 py-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Say something..."
          className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/40 placeholder-white/40"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
