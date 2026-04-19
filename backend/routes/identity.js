const express = require('express');
const router = express.Router();
const identityService = require('../services/identity');

router.post('/init', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    let decodedToken = null;
    if (token) {
      decodedToken = identityService.verifyToken(token);
    }

    if (decodedToken) {
      // Token is valid, check if refresh is needed
      if (identityService.shouldRefreshToken(decodedToken)) {
        // Refresh the token
        const newToken = identityService.signToken({
          ghostId: decodedToken.ghostId,
          ghostName: decodedToken.ghostName,
          avatarId: decodedToken.avatarId
        });

        return res.json({
          token: newToken,
          ghostId: decodedToken.ghostId,
          ghostName: decodedToken.ghostName,
          avatarId: decodedToken.avatarId,
          isLoaded: true
        });
      } else {
        // Token still valid, return as-is
        return res.json({
          token,
          ghostId: decodedToken.ghostId,
          ghostName: decodedToken.ghostName,
          avatarId: decodedToken.avatarId,
          isLoaded: true
        });
      }
    }

    // No valid token, create new identity
    const identity = identityService.generateGhostIdentity();
    const newToken = identityService.signToken(identity);

    res.json({
      token: newToken,
      ghostId: identity.ghostId,
      ghostName: identity.ghostName,
      avatarId: identity.avatarId,
      isLoaded: true
    });
  } catch (err) {
    console.error('[IDENTITY] Error in /init:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
