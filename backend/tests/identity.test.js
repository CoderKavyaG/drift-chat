const { describe, it, expect } = require('vitest');
const identityService = require('../services/identity');
const jwt = require('jsonwebtoken');

// Mock JWT_SECRET for tests
process.env.JWT_SECRET = 'test-secret-key-12345';

describe('Identity Service', () => {
  it('should generate a valid ghost identity', () => {
    const identity = identityService.generateGhostIdentity();
    expect(identity.ghostId).toBeDefined();
    expect(identity.ghostName).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+#\d{4}$/);
    expect(identity.avatarId).toBeGreaterThanOrEqual(1);
    expect(identity.avatarId).toBeLessThanOrEqual(20);
  });

  it('should sign and verify a token', () => {
    const identity = {
      ghostId: 'test-uuid-123',
      ghostName: 'BoldFox#1234',
      avatarId: 5
    };

    const token = identityService.signToken(identity);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = identityService.verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.ghostId).toBe(identity.ghostId);
    expect(decoded.ghostName).toBe(identity.ghostName);
    expect(decoded.avatarId).toBe(identity.avatarId);
  });

  it('should return null for invalid token', () => {
    const decoded = identityService.verifyToken('completely-invalid-token-string');
    expect(decoded).toBeNull();
  });

  it('should indicate if token should be refreshed', () => {
    const now = Math.floor(Date.now() / 1000);
    
    const freshToken = { exp: now + 20 * 3600 }; // 20 hours left
    expect(identityService.shouldRefreshToken(freshToken)).toBe(false);

    const oldToken = { exp: now + 2 * 3600 }; // 2 hours left
    expect(identityService.shouldRefreshToken(oldToken)).toBe(true);
  });
});
