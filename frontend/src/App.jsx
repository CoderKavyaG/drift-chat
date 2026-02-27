import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import ChatRoom from "./components/ChatRoom";
import { getSocket } from "./hooks/useSocket";

/**
 * App
 * Top-level state machine: landing → chatting
 */
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | chatting
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    socket.on("online_count", (count) => setOnlineCount(count));
    return () => socket.off("online_count");
  }, []);

  const handleStart = () => setScreen("chatting");
  const handleStop = () => setScreen("landing");

  return (
    <div className="h-full bg-[#0a0a0a]">
      {screen === "landing" && (
        <LandingPage onStart={handleStart} onlineCount={onlineCount} />
      )}
      {screen === "chatting" && (
        <ChatRoom onStop={handleStop} />
      )}
    </div>
  );
}
