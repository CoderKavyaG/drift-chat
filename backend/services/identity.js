const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const ADJECTIVES = [
  'Silent', 'Rapid', 'Bright', 'Swift', 'Clever', 'Bold', 'Calm', 'Dark', 'Deep', 'Eager',
  'Fair', 'Glad', 'Happy', 'Kind', 'Lazy', 'Mighty', 'Noble', 'Proud', 'Quick', 'Rare',
  'Sharp', 'Tender', 'Unique', 'Vivid', 'Warm', 'Wise', 'Young', 'Zealous', 'Ancient', 'Cosmic'
];

const ANIMALS = [
  'Fox', 'Wolf', 'Raven', 'Eagle', 'Bear', 'Lion', 'Tiger', 'Panda', 'Hawk', 'Otter',
  'Dolphin', 'Phoenix', 'Dragon', 'Owl', 'Lynx', 'Elk', 'Badger', 'Falcon', 'Jackal', 'Koala',
  'Penguin', 'Squirrel', 'Salmon', 'Jaguar', 'Crane', 'Mantis', 'Stoat', 'Newt', 'Viper', 'Xerus'
];

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

function generateGhostIdentity() {
  const ghostId = uuidv4();
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const ghostName = `${adjective}${animal}#${digits}`;
  const avatarId = Math.floor(Math.random() * 20) + 1;
  
  return {
    ghostId,
    ghostName,
    avatarId
  };
}

function signToken(identity) {
  const payload = {
    ghostId: identity.ghostId,
    ghostName: identity.ghostName,
    avatarId: identity.avatarId
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

function shouldRefreshToken(decodedToken) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = decodedToken.exp;
  const timeRemaining = expiresAt - now;
  return timeRemaining < 6 * 3600; // less than 6 hours remaining
}

function getAvatarColor(avatarId) {
  return AVATAR_COLORS[(avatarId - 1) % AVATAR_COLORS.length];
}

module.exports = {
  generateGhostIdentity,
  signToken,
  verifyToken,
  shouldRefreshToken,
  getAvatarColor
};
