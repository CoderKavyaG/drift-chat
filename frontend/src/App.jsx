import { useState, useEffect } from "react"
import LandingPage from "./components/LandingPage"
import ChatRoom from "./components/ChatRoom"
import { getSocket } from "./hooks/useSocket"

export default function App() {
  const [screen, setScreen] = useState("landing")
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    const socket = getSocket()
    socket.on("online_count", (count) => setOnlineCount(count))
    return () => socket.off("online_count")
  }, [])

  return (
    <div className="h-full bg-[#0a0a0a]">
      {screen === "landing" && (
        <LandingPage onStart={() => setScreen("chatting")} onlineCount={onlineCount} />
      )}
      {screen === "chatting" && (
        <ChatRoom onStop={() => setScreen("landing")} onlineCount={onlineCount} />
      )}
    </div>
  )
}
