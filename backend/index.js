require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

const { initSignaling } = require('./ws/signaling');
const identityRoutes = require('./routes/identity');
const roomsRoutes = require('./routes/rooms');
const friendsRoutes = require('./routes/friends');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Redis connection handling
redis.on('error', (err) => {
  console.error('[REDIS] Error:', err.message);
});

redis.on('connect', () => {
  console.log('[REDIS] Connected');
});

// Make redis available in routes
app.use((req, res, next) => {
  req.redis = redis;
  next();
});

// JWT verification middleware
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Routes
app.use('/api/identity', identityRoutes);
app.use('/api/rooms', requireAuth, roomsRoutes);
app.use('/api/friends', requireAuth, friendsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket signaling
const signalingModule = initSignaling(server, redis);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[SERVER] HTTP server closed');
    redis.quit(() => {
      console.log('[SERVER] Redis connection closed');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] Drift Chat backend listening on port ${PORT}`);
});
