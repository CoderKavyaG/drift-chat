import { useState, useCallback } from "react";
import { getSocket } from "./useSocket";

/**
 * useChat hook
 * Manages message list. Send via socket; receive from socket event.
 */
export function useChat(roomId) {
    const [messages, setMessages] = useState([]);
    const socket = getSocket();

    const sendMessage = useCallback(
        (text) => {
            if (!roomId || !text.trim()) return;
            const timestamp = Date.now();

            // Optimistically add to local state as "fromSelf"
            setMessages((prev) => [
                ...prev,
                { message: text.trim(), timestamp, fromSelf: true },
            ]);

            socket.emit("send_message", {
                roomId,
                message: text.trim(),
                timestamp,
            });
        },
        [roomId, socket]
    );

    const receiveMessage = useCallback((data) => {
        setMessages((prev) => [...prev, data]);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return { messages, sendMessage, receiveMessage, clearMessages };
}


