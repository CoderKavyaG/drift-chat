import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

// Auto-detect the backend URL based on current hostname (works on LAN & mobile)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:3001`;

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
        // Create a persistent wrapper for each event to avoid stale closures
        const wrappedHandlers = {};
        const eventNames = Object.keys(handlersRef.current);

        eventNames.forEach((event) => {
            wrappedHandlers[event] = (...args) => {
                if (handlersRef.current[event]) {
                    handlersRef.current[event](...args);
                }
            };
            socket.on(event, wrappedHandlers[event]);
        });

        return () => {
            eventNames.forEach((event) => {
                socket.off(event, wrappedHandlers[event]);
            });
        };
    }, []); // Hook stays alive as long as component mounts; handlersRef keeps handlers fresh

    const emit = useCallback(
        (event, data) => {
            socket.emit(event, data);
        },
        [socket]
    );

    return { socket, emit };
}


