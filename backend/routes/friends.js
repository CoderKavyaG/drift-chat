const express = require('express');
const router = express.Router();

router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const ghostId = req.user.ghostId;

    const friendshipData = await req.redis.get(`friendship:${chatId}`);
    if (!friendshipData) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const friendship = JSON.parse(friendshipData);

    // Verify requester is one of the peers
    if (friendship.peer1 !== ghostId && friendship.peer2 !== ghostId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(friendship);
  } catch (err) {
    console.error('[FRIENDS] Error in GET /:chatId:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const ghostId = req.user.ghostId;

    // Verify access
    const friendshipData = await req.redis.get(`friendship:${chatId}`);
    if (!friendshipData) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const friendship = JSON.parse(friendshipData);
    if (friendship.peer1 !== ghostId && friendship.peer2 !== ghostId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get last 100 messages
    const messages = await req.redis.lrange(`friendchat:${chatId}`, 0, 99);
    const parsedMessages = messages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    res.json({
      messages: parsedMessages.reverse(),
      expiresAt: friendship.expiresAt
    });
  } catch (err) {
    console.error('[FRIENDS] Error in GET /:chatId/messages:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const ghostId = req.user.ghostId;
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text' });
    }

    // Verify access
    const friendshipData = await req.redis.get(`friendship:${chatId}`);
    if (!friendshipData) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const friendship = JSON.parse(friendshipData);
    if (friendship.peer1 !== ghostId && friendship.peer2 !== ghostId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Sanitize text
    const sanitized = text.replace(/<[^>]*>/g, '').substring(0, 500);

    const message = {
      ghostId,
      text: sanitized,
      timestamp: Date.now()
    };

    // Save to Redis list
    await req.redis.lpush(`friendchat:${chatId}`, JSON.stringify(message));
    await req.redis.ltrim(`friendchat:${chatId}`, 0, 499); // Keep last 500

    res.json({ success: true, message });
  } catch (err) {
    console.error('[FRIENDS] Error in POST /:chatId/messages:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
