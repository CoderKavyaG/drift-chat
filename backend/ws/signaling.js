const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const abuse = require('../services/abuse');

function initSignaling(server, redis) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  // Maps to track connections and room membership
  const connections = new Map(); // ghostId -> WebSocket
  const roomMembers = new Map(); // roomId -> Set of ghostIds

  // Heartbeat timer
  const heartbeatInterval = setInterval(() => {
    connections.forEach((ws, ghostId) => {
      if (ws.isAlive === false) {
        ws.terminate();
        connections.delete(ghostId);
        return;
      }
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4401, 'Unauthorized: No token provided');
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      ws.close(4401, 'Unauthorized: Invalid token');
      return;
    }

    const ghostId = decodedToken.ghostId;
    const ghostName = decodedToken.ghostName;
    const avatarId = decodedToken.avatarId;

    // Check if banned
    const isBanned = await abuse.isBanned(redis, ghostId);
    if (isBanned) {
      ws.close(4403, 'Forbidden: Banned');
      return;
    }

    ws.ghostId = ghostId;
    ws.ghostName = ghostName;
    ws.avatarId = avatarId;
    ws.isAlive = true;

    connections.set(ghostId, ws);
    console.log(`[WS] Connected: ${ghostName} (${ghostId})`);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(message, ws, redis, connections, roomMembers, ghostId, ghostName, avatarId);
      } catch (err) {
        console.error('[WS] Message parse error:', err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Disconnected: ${ghostName} (${ghostId})`);
      connections.delete(ghostId);

      // Find and clean up room memberships
      roomMembers.forEach((members, roomId) => {
        if (members.has(ghostId)) {
          members.delete(ghostId);
          
          // Broadcast to remaining peers
          members.forEach(peerId => {
            const peerWs = connections.get(peerId);
            if (peerWs && peerWs.readyState === 1) {
              peerWs.send(JSON.stringify({
                type: 'peer-left',
                peerId: ghostId
              }));
            }
          });

          // Clean up empty rooms
          if (members.size === 0) {
            roomMembers.delete(roomId);
          }
        }
      });
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  });

  async function handleMessage(message, ws, redis, connections, roomMembers, ghostId, ghostName, avatarId) {
    const { type } = message;

    switch (type) {
      case 'join-room':
        await handleJoinRoom(message, ws, redis, connections, roomMembers, ghostId, ghostName, avatarId);
        break;
      case 'leave-room':
        await handleLeaveRoom(message, ws, redis, connections, roomMembers, ghostId);
        break;
      case 'offer':
        handleRelay(message, connections, ghostId);
        break;
      case 'answer':
        handleRelay(message, connections, ghostId);
        break;
      case 'ice-candidate':
        handleRelay(message, connections, ghostId);
        break;
      case 'chat-message':
        await handleChatMessage(message, ws, redis, connections, roomMembers, ghostId, ghostName);
        break;
      case 'report':
        await handleReport(message, redis, connections, roomMembers, ghostId);
        break;
      case 'friend-request':
        handleRelay(message, connections, ghostId, ghostName, avatarId);
        break;
      case 'friend-accept':
        await handleFriendAccept(message, redis, connections, ghostId, ghostName, avatarId);
        break;
      case 'typing':
        handleRelay(message, connections, ghostId);
        break;
      default:
        console.log('[WS] Unknown message type:', type);
    }
  }

  async function handleJoinRoom(message, ws, redis, connections, roomMembers, ghostId, ghostName, avatarId) {
    const { roomId } = message;
    if (!roomId) return;

    // Initialize room members set if needed
    if (!roomMembers.has(roomId)) {
      roomMembers.set(roomId, new Set());
    }

    const room = roomMembers.get(roomId);
    room.add(ghostId);

    // Send current peers to joining client
    const peers = Array.from(room)
      .filter(pid => pid !== ghostId)
      .map(pid => {
        const peerWs = connections.get(pid);
        if (peerWs) {
          return {
            ghostId: pid,
            ghostName: peerWs.ghostName,
            avatarId: peerWs.avatarId
          };
        }
        return null;
      })
      .filter(Boolean);

    ws.send(JSON.stringify({
      type: 'room-joined',
      peers
    }));

    // Broadcast to other peers
    room.forEach(peerId => {
      if (peerId !== ghostId) {
        const peerWs = connections.get(peerId);
        if (peerWs && peerWs.readyState === 1) {
          peerWs.send(JSON.stringify({
            type: 'peer-joined',
            peerId: ghostId,
            ghostName,
            avatarId
          }));
        }
      }
    });
  }

  async function handleLeaveRoom(message, ws, redis, connections, roomMembers, ghostId) {
    const { roomId } = message;
    if (!roomId || !roomMembers.has(roomId)) return;

    const room = roomMembers.get(roomId);
    room.delete(ghostId);

    // Broadcast to remaining peers
    room.forEach(peerId => {
      const peerWs = connections.get(peerId);
      if (peerWs && peerWs.readyState === 1) {
        peerWs.send(JSON.stringify({
          type: 'peer-left',
          peerId: ghostId
        }));
      }
    });

    if (room.size === 0) {
      roomMembers.delete(roomId);
    }
  }

  function handleRelay(message, connections, ghostId, ghostName = null, avatarId = null) {
    const { targetPeerId } = message;
    if (!targetPeerId) return;

    const targetWs = connections.get(targetPeerId);
    if (targetWs && targetWs.readyState === 1) {
      const relayMessage = {
        ...message,
        fromPeerId: ghostId
      };
      if (ghostName) relayMessage.ghostName = ghostName;
      if (avatarId) relayMessage.avatarId = avatarId;
      targetWs.send(JSON.stringify(relayMessage));
    }
  }

  async function handleChatMessage(message, ws, redis, connections, roomMembers, ghostId, ghostName) {
    let { roomId, text } = message;
    if (!roomId || !text) return;

    // Sanitize text: strip HTML
    text = text.replace(/<[^>]*>/g, '').substring(0, 500);

    if (!roomMembers.has(roomId)) return;
    const room = roomMembers.get(roomId);

    const chatMessage = {
      type: 'chat-message',
      fromPeerId: ghostId,
      ghostName,
      text,
      timestamp: Date.now()
    };

    // Broadcast to all peers including sender
    room.forEach(peerId => {
      const peerWs = connections.get(peerId);
      if (peerWs && peerWs.readyState === 1) {
        peerWs.send(JSON.stringify(chatMessage));
      }
    });
  }

  async function handleReport(message, redis, connections, roomMembers, ghostId) {
    const { targetPeerId, reason, roomId } = message;
    if (!targetPeerId || !reason) return;

    console.log(`[ABUSE] Report: ${ghostId} → ${targetPeerId} for "${reason}"`);
    
    // Find the room ID if not provided
    let actualRoomId = roomId;
    if (!actualRoomId) {
      roomMembers.forEach((members, rId) => {
        if (members.has(ghostId) && members.has(targetPeerId)) {
          actualRoomId = rId;
        }
      });
    }

    if (actualRoomId) {
      await abuse.receiveReport(redis, ghostId, targetPeerId, actualRoomId, reason, {
        roomMembers,
        connections
      });
    }
  }

  async function handleFriendAccept(message, redis, connections, ghostId, ghostName, avatarId) {
    const { targetPeerId, partnerGhostName, partnerAvatarId } = message;
    if (!targetPeerId) return;

    const { v4: uuidv4 } = require('uuid');
    const sharedChatId = uuidv4();

    const expiresAt = Date.now() + 3 * 24 * 60 * 60 * 1000; // 72 hours
    const friendship = {
      peer1: ghostId,
      peer2: targetPeerId,
      expiresAt
    };

    try {
      await redis.set(
        `friendship:${sharedChatId}`,
        JSON.stringify(friendship),
        'EX',
        3 * 24 * 60 * 60 // 72 hours
      );

      const acceptMessage = {
        type: 'friend-accepted',
        sharedChatId,
        partnerGhostName,
        partnerAvatarId
      };

      // Send to both peers
      const targetWs = connections.get(targetPeerId);
      if (targetWs && targetWs.readyState === 1) {
        acceptMessage.partnerGhostName = ghostName;
        acceptMessage.partnerAvatarId = avatarId;
        targetWs.send(JSON.stringify(acceptMessage));
      }

      const myWs = connections.get(ghostId);
      if (myWs && myWs.readyState === 1) {
        acceptMessage.partnerGhostName = partnerGhostName;
        acceptMessage.partnerAvatarId = partnerAvatarId;
        myWs.send(JSON.stringify(acceptMessage));
      }
    } catch (err) {
      console.error('[WS] Error accepting friend request:', err.message);
    }
  }

  return {
    connections,
    roomMembers
  };
}

module.exports = {
  initSignaling
};
