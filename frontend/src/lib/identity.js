import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const IdentityContext = createContext();

export function IdentityProvider({ children }) {
  const [identity, setIdentity] = useState({
    ghostId: null,
    ghostName: null,
    avatarId: null,
    token: null,
    isLoaded: false
  });

  useEffect(() => {
    const initializeIdentity = async () => {
      try {
        // Check localStorage for existing token
        const storedToken = localStorage.getItem('drift_token');
        const authHeader = storedToken ? `Bearer ${storedToken}` : undefined;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/identity/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { Authorization: authHeader })
          }
        });

        if (!response.ok) {
          throw new Error('Failed to initialize identity');
        }

        const data = await response.json();

        // Store token in localStorage
        localStorage.setItem('drift_token', data.token);

        setIdentity({
          ghostId: data.ghostId,
          ghostName: data.ghostName,
          avatarId: data.avatarId,
          token: data.token,
          isLoaded: true
        });
      } catch (err) {
        console.error('Identity initialization error:', err);
        setIdentity(prev => ({ ...prev, isLoaded: true }));
      }
    };

    initializeIdentity();
  }, []);

  const value = {
    ...identity
  };

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}
