require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Allow all origins since this is a public anonymous chat without session cookies
app.use(cors({ origin: "*" }));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ─── In-Memory State ───────────────────────────────────────────────────────────
const waitingQueue = [];                // socket IDs waiting for a match
const activeRooms = new Map();          // roomId → { sockets: [id1, id2] }
const userRooms = new Map();            // socketId → roomId
// ──────────────────────────────────────────────────────────────────────────────

// ─── Helper: get online user count ────────────────────────────────────────────
function getOnlineCount() {
  return io.engine.clientsCount;
}

// ─── Helper: broadcast online count to all ────────────────────────────────────
function broadcastOnlineCount() {
  io.emit("online_count", getOnlineCount());
}

// ─── Helper: match two users into a room ──────────────────────────────────────
function matchUsers(s1Id, s2Id) {
  const roomId = uuidv4();

  activeRooms.set(roomId, { sockets: [s1Id, s2Id] });
  userRooms.set(s1Id, roomId);
  userRooms.set(s2Id, roomId);

  // initiator (s1) creates the WebRTC offer
  io.to(s1Id).emit("matched", {
    roomId,
    partnerId: s2Id,
    initiator: true,
  });

  io.to(s2Id).emit("matched", {
    roomId,
    partnerId: s1Id,
    initiator: false,
  });

  console.log(`[MATCH] Room ${roomId}: ${s1Id.slice(0, 6)} ↔ ${s2Id.slice(0, 6)}`);
}

// ─── Helper: clean up a disconnected / leaving user ───────────────────────────
function cleanupUser(socketId) {
  // 1. Remove from waiting queue if they were queued
  const queueIndex = waitingQueue.indexOf(socketId);
  if (queueIndex !== -1) {
    waitingQueue.splice(queueIndex, 1);
    console.log(`[QUEUE] Removed ${socketId.slice(0, 6)} from queue`);
  }

  // 2. If in a room, notify partner and clean up room
  const roomId = userRooms.get(socketId);
  if (roomId) {
    const room = activeRooms.get(roomId);
    if (room) {
      const partnerId = room.sockets.find((id) => id !== socketId);
      if (partnerId) {
        io.to(partnerId).emit("partner_left");
        console.log(`[ROOM] Notified ${partnerId.slice(0, 6)} that partner left`);
      }

      // Clean up userRooms for both users
      room.sockets.forEach((id) => userRooms.delete(id));
      activeRooms.delete(roomId);
      console.log(`[ROOM] Deleted room ${roomId}`);
    }
  }
}

// ─── Socket.IO Event Handlers ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[CONNECT] ${socket.id.slice(0, 6)} connected — online: ${getOnlineCount()}`);
  broadcastOnlineCount();

  // ── find_partner: add user to waiting queue; pair if 2+ waiting ──────────
  socket.on("find_partner", () => {
    // Don't add twice
    if (waitingQueue.includes(socket.id)) return;

    // If already in a room, clean up first
    if (userRooms.has(socket.id)) {
      cleanupUser(socket.id);
    }

    waitingQueue.push(socket.id);
    console.log(`[QUEUE] ${socket.id.slice(0, 6)} joined queue — length: ${waitingQueue.length}`);

    socket.emit("waiting");

    // Pair if we have at least 2 people
    if (waitingQueue.length >= 2) {
      const s1Id = waitingQueue.shift();
      const s2Id = waitingQueue.shift();
      matchUsers(s1Id, s2Id);
    }
  });

  // ── webrtc_signal: relay WebRTC signaling data between peers ─────────────
  socket.on("webrtc_signal", ({ roomId, signal }) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      console.warn(`[SIGNAL] Received signal for non-existent room: ${roomId}`);
      return;
    }

    const partnerId = room.sockets.find((id) => id !== socket.id);
    if (partnerId) {
      io.to(partnerId).emit("webrtc_signal", { 
        signal, 
        roomId, // Include roomId for client-side validation
        from: socket.id 
      });
    }
  });

  // ── send_message: relay chat message to partner ───────────────────────────
  socket.on("send_message", ({ roomId, message, timestamp }) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      console.warn(`[CHAT] Message for non-existent room: ${roomId}`);
      return;
    }

    const partnerId = room.sockets.find((id) => id !== socket.id);
    if (partnerId) {
      io.to(partnerId).emit("receive_message", {
        message,
        timestamp,
        fromSelf: false,
      });
    }
  });

  // ── leave_room: user explicitly skips or stops ────────────────────────────
  socket.on("leave_room", () => {
    console.log(`[LEAVE] ${socket.id.slice(0, 6)} left room`);
    cleanupUser(socket.id);
  });

  // ── disconnect: socket closed (tab closed, network drop, etc.) ────────────
  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] ${socket.id.slice(0, 6)} — online: ${getOnlineCount()}`);
    cleanupUser(socket.id);
    broadcastOnlineCount();
  });
});

// ─── Health check route ───────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    online: getOnlineCount(),
    rooms: activeRooms.size,
    queued: waitingQueue.length,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 drift backend running on http://0.0.0.0:${PORT}\n`);
});
