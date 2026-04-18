const { v4: uuidv4 } = require('uuid');

const ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateRoomCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARS.charAt(Math.floor(Math.random() * ROOM_CODE_CHARS.length));
  }
  return code;
}

async function createRoom(redis, mode) {
  const roomId = uuidv4();
  const roomCode = generateRoomCode();
  
  const roomData = {
    roomCode,
    mode,
    peers: JSON.stringify([]),
    status: 'waiting',
    createdAt: Date.now()
  };

  try {
    await redis.hset(`room:${roomId}`, roomData);
    await redis.expire(`room:${roomId}`, 7200); // 2 hours
    
    await redis.set(`roomcode:${roomCode}`, roomId);
    await redis.expire(`roomcode:${roomCode}`, 7200);
    
    return { roomId, roomCode };
  } catch (err) {
    console.error('[ROOMS] Error creating room:', err.message);
    throw err;
  }
}

async function joinRoom(redis, roomId, ghostId) {
  try {
    const roomData = await redis.hgetall(`room:${roomId}`);
    if (!roomData || !roomData.roomCode) {
      return null;
    }

    let peers = [];
    try {
      peers = JSON.parse(roomData.peers || '[]');
    } catch (e) {
      peers = [];
    }

    if (!peers.includes(ghostId) && peers.length < 4) {
      peers.push(ghostId);
      await redis.hset(`room:${roomId}`, 'peers', JSON.stringify(peers));
    }

    return {
      roomId,
      roomCode: roomData.roomCode,
      peers
    };
  } catch (err) {
    console.error('[ROOMS] Error joining room:', err.message);
    throw err;
  }
}

async function findWaitingRoom(redis) {
  try {
    const cursor = await redis.scan(0, 'MATCH', 'room:*');
    const keys = cursor[1];

    for (const key of keys) {
      const roomData = await redis.hgetall(key);
      if (roomData.status === 'waiting' && roomData.mode === 'random') {
        let peers = [];
        try {
          peers = JSON.parse(roomData.peers || '[]');
        } catch (e) {
          peers = [];
        }
        if (peers.length < 4) {
          const roomId = key.replace('room:', '');
          return { roomId, roomCode: roomData.roomCode };
        }
      }
    }
    return null;
  } catch (err) {
    console.error('[ROOMS] Error finding waiting room:', err.message);
    return null;
  }
}

async function leaveRoom(redis, roomId, ghostId) {
  try {
    const roomData = await redis.hgetall(`room:${roomId}`);
    if (!roomData || !roomData.roomCode) {
      return;
    }

    let peers = [];
    try {
      peers = JSON.parse(roomData.peers || '[]');
    } catch (e) {
      peers = [];
    }

    peers = peers.filter(p => p !== ghostId);
    await redis.hset(`room:${roomId}`, 'peers', JSON.stringify(peers));

    if (peers.length === 0) {
      await redis.del(`room:${roomId}`);
      await redis.del(`roomcode:${roomData.roomCode}`);
    }
  } catch (err) {
    console.error('[ROOMS] Error leaving room:', err.message);
  }
}

async function getRoomPeers(redis, roomId) {
  try {
    const roomData = await redis.hgetall(`room:${roomId}`);
    if (!roomData || !roomData.roomCode) {
      return [];
    }

    try {
      return JSON.parse(roomData.peers || '[]');
    } catch (e) {
      return [];
    }
  } catch (err) {
    console.error('[ROOMS] Error getting room peers:', err.message);
    return [];
  }
}

async function getRoomByCode(redis, roomCode) {
  try {
    const roomId = await redis.get(`roomcode:${roomCode}`);
    return roomId;
  } catch (err) {
    console.error('[ROOMS] Error getting room by code:', err.message);
    return null;
  }
}

async function setRoomStatus(redis, roomId, status) {
  try {
    await redis.hset(`room:${roomId}`, 'status', status);
  } catch (err) {
    console.error('[ROOMS] Error setting room status:', err.message);
  }
}

module.exports = {
  createRoom,
  joinRoom,
  findWaitingRoom,
  leaveRoom,
  getRoomPeers,
  getRoomByCode,
  setRoomStatus
};
