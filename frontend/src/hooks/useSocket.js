import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

let socketInstance = null;

export function getSocket() {
    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socketInstance;
}

/**
 * useSocket hook
 * Provides a stable socket reference and helper to register/unregister events.
 */
export function useSocket(eventHandlers = {}) {
    const socket = getSocket();
    const handlersRef = useRef(eventHandlers);
    handlersRef.current = eventHandlers;

    useEffect(() => {
        const entries = Object.entries(handlersRef.current);
        entries.forEach(([event, handler]) => {
            socket.on(event, handler);
        });
        return () => {
            entries.forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, []); // only run once; handlersRef keeps handlers fresh

    const emit = useCallback(
        (event, data) => {
            socket.emit(event, data);
        },
        [socket]
    );

    return { socket, emit };
}
