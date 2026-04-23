// Fixes stale callback closure and adds heartbeat ping/pong
import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL;

export function useSignaling(token, onMessage) {
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const onMessageRef = useRef(onMessage); // Store latest callback in ref to prevent stale closures
  const [connectionState, setConnectionState] = useState('disconnected');
  const isCleaningUpRef = useRef(false); // Prevent reconnect during cleanup

  // Update ref whenever onMessage changes (but don't trigger reconnect)
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const disconnect = useCallback(() => {
    isCleaningUpRef.current = true;
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    setConnectionState('disconnected');
    isCleaningUpRef.current = false;
  }, []);

  const setupHeartbeat = useCallback((ws) => {
    // Clean up old heartbeat if exists
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }
    
    // Send ping every 30 seconds
    heartbeatTimerRef.current = setInterval(() => {
      if (ws && ws.readyState === 1) {
        try {
          console.log('[WS] Sending ping');
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch (err) {
          console.error('[WS] Error sending ping:', err.message);
        }
      }
    }, 30000);
  }, []);

  const connect = useCallback(() => {
    if (isCleaningUpRef.current) {
      console.log('[WS] Cleanup in progress, deferring connection');
      return;
    }

    if (!token) {
      console.log('[WS] No token available, waiting...');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === 1) {
      return; // Already connected
    }

    if (wsRef.current && wsRef.current.readyState === 0) {
      return; // Already connecting
    }

    try {
      const wsUrl = `${WS_URL}/ws?token=${encodeURIComponent(token)}`;
      console.log('[WS] Connecting to:', wsUrl.replace(token, '***'));
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected successfully');
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        setupHeartbeat(ws); // Start heartbeat after connection
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Handle pong responses from heartbeat
          if (message.type === 'pong') {
            console.log('[WS] Received pong');
            return;
          }
          if (onMessageRef.current) {
            onMessageRef.current(message);
          }
        } catch (err) {
          console.error('[WS] Message parse error:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WS] Closed with code:', event.code, 'reason:', event.reason);
        setConnectionState('disconnected');
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        
        // Don't reconnect if we're cleaning up
        if (isCleaningUpRef.current) {
          return;
        }

        // Exponential backoff reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
        reconnectAttemptsRef.current += 1;
        
        reconnectTimerRef.current = setTimeout(() => {
          console.log('[WS] Attempting to reconnect (attempt', reconnectAttemptsRef.current, ')...');
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        const errorMsg = err?.message || err?.reason || 'Unknown error';
        console.error('[WS] Error:', {
          message: errorMsg,
          type: err?.type,
          code: err?.code,
          readyState: ws?.readyState
        });
        setConnectionState('error');
        
        // Attempt to reconnect after error
        if (!isCleaningUpRef.current) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
          reconnectAttemptsRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            console.log('[WS] Reconnecting after error...');
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WS] Connection error:', err.message);
      setConnectionState('error');
      
      // Retry connection
      if (!isCleaningUpRef.current) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [token, setupHeartbeat]);

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
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (err) {
        console.error('[WS] Error sending message:', err.message);
      }
    } else {
      console.warn('[WS] WebSocket not ready (state:', wsRef.current?.readyState, '), cannot send message');
    }
  }, []);

  return {
    send,
    connectionState,
    disconnect
  };
}
