import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import apiClient from '../api/client';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const { user, authenticated } = usePrivy();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authenticated && user) {
      registerOrLoginPlayer();
    } else {
      setPlayer(null);
      setLoading(false);
    }
  }, [authenticated, user]);

  const registerOrLoginPlayer = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get wallet address or email from Privy user
      const walletAddress = user?.wallet?.address;
      const email = user?.email?.address;
      const username = user?.twitter?.username || user?.discord?.username || `Player${Date.now()}`;

      // Register or login player
      const response = await apiClient.registerPlayer({
        walletAddress,
        email,
        username,
      });

      if (response.success) {
        setPlayer(response.player);
        localStorage.setItem('playerId', response.player.id);
      }
    } catch (err) {
      console.error('Failed to register/login player:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPlayer = async () => {
    if (!player) return;

    try {
      const response = await apiClient.getPlayer(player.id);
      if (response.success) {
        setPlayer(response.player);
      }
    } catch (err) {
      console.error('Failed to refresh player:', err);
    }
  };

  const updatePlayerProfile = async (updates) => {
    if (!player) return;

    try {
      const response = await apiClient.updatePlayer(player.id, updates);
      if (response.success) {
        setPlayer(response.player);
      }
      return response;
    } catch (err) {
      console.error('Failed to update player:', err);
      throw err;
    }
  };

  const value = {
    player,
    loading,
    error,
    refreshPlayer,
    updatePlayerProfile,
    isAuthenticated: authenticated && !!player,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
