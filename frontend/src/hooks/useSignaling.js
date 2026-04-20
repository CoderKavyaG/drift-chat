import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL;

export function useSignaling(token, onMessage) {
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const onMessageRef = useRef(onMessage); // Store latest callback in ref
  const [connectionState, setConnectionState] = useState('disconnected');

  // Update ref whenever onMessage changes (but don't trigger reconnect)
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    setConnectionState('disconnected');
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      return; // Already connected
    }

    try {
      const wsUrl = `${WS_URL}/ws?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected');
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(message);
          }
        } catch (err) {
          console.error('[WS] Message parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Closed');
        setConnectionState('disconnected');
        
        // Exponential backoff reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
        reconnectAttemptsRef.current += 1;
        
        reconnectTimerRef.current = setTimeout(() => {
          console.log('[WS] Attempting to reconnect...');
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        setConnectionState('error');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WS] Connection error:', err);
      setConnectionState('error');
    }
  }, [token]); // Only depend on token, not onMessage

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  const send = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WS] WebSocket not connected, cannot send message');
    }
  }, []);

  return {
    send,
    connectionState,
    disconnect
  };
}
