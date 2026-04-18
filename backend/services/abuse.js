async function receiveReport(redis, reporterId, targetId, roomId, reason, signalingModule) {
  try {
    await redis.hincrby(`abuse:reports:${targetId}`, 'count', 1);
    await redis.expire(`abuse:reports:${targetId}`, 86400);

    console.log(`[ABUSE] Report filed. Reporter: ${reporterId}, Target: ${targetId}, Reason: ${reason}`);

    // Kill the room immediately
    await killRoom(redis, roomId, signalingModule);

    // Ban the target for 24 hours
    await redis.sadd('abuse:banned', targetId);
    await redis.expire('abuse:banned', 86400);
  } catch (err) {
    console.error('[ABUSE] Error receiving report:', err.message);
  }
}

async function killRoom(redis, roomId, signalingModule) {
  try {
    // Set room status to killed
    await redis.hset(`room:${roomId}`, 'status', 'killed');

    // Get peers from signaling module
    const roomMembers = signalingModule.roomMembers;
    const connections = signalingModule.connections;

    if (!roomMembers || !roomMembers.has(roomId)) {
      console.log(`[ABUSE] Room ${roomId} killed (no active peers)`);
      return;
    }

    const peersInRoom = roomMembers.get(roomId);
    console.log(`[ABUSE] Room ${roomId} killed. Notifying ${peersInRoom.size} peers.`);

    const killMessage = {
      type: 'room-killed',
      reason: 'A report was filed. Room closed for safety.'
    };

    // Send kill message to each peer
    peersInRoom.forEach(ghostId => {
      const ws = connections.get(ghostId);
      if (ws && ws.readyState === 1) { // 1 = OPEN
        ws.send(JSON.stringify(killMessage));
      }
    });

    // Close connections after 2 seconds
    setTimeout(() => {
      peersInRoom.forEach(ghostId => {
        const ws = connections.get(ghostId);
        if (ws && ws.readyState === 1) {
          ws.close();
        }
      });
      roomMembers.delete(roomId);
    }, 2000);
  } catch (err) {
    console.error('[ABUSE] Error killing room:', err.message);
  }
}

async function isBanned(redis, ghostId) {
  try {
    const banned = await redis.sismember('abuse:banned', ghostId);
    return banned === 1;
  } catch (err) {
    console.error('[ABUSE] Error checking ban status:', err.message);
    return false;
  }
}

module.exports = {
  receiveReport,
  killRoom,
  isBanned
};
