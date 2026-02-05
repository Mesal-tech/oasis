import { io } from 'socket.io-client';
import { updateGamePlayers } from '../slices/gamesSlice';
import { updatePlayerRank } from '../slices/leaderboardSlice';
import { updateArenaPlayers, addPlayerToArena, removePlayerFromArena } from '../slices/arenasSlice';

// Socket.IO middleware for real-time updates
const socketMiddleware = (store) => {
  let socket = null;

  // Only connect to Socket.IO if backend URL is configured and not in serverless environment
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const isServerless = process.env.VERCEL === '1' || !backendUrl || backendUrl.includes('vercel.app');
  
  if (isServerless) {
    console.log('[Socket.IO] Skipping connection - running in serverless environment');
    return (next) => (action) => next(action);
  }

  return (next) => (action) => {
    // Initialize socket connection on store creation
    if (!socket && typeof window !== 'undefined') {
      try {
        console.log(`[Socket.IO] Connecting to: ${backendUrl}`);
        
        socket = io(backendUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
          console.log('[Socket.IO] Connected:', socket.id);
        });

        socket.on('disconnect', () => {
          console.log('[Socket.IO] Disconnected');
        });

        socket.on('connect_error', (error) => {
          console.warn('[Socket.IO] Connection error:', error.message);
        });

        // Listen for game player count updates
        socket.on('game:playerCountUpdate', (data) => {
          console.log('[Socket.IO] Game player count update:', data);
          store.dispatch(updateGamePlayers(data));
        });

        // Listen for leaderboard updates
        socket.on('leaderboard:update', (data) => {
          console.log('[Socket.IO] Leaderboard update:', data);
          store.dispatch(updatePlayerRank(data));
        });

        // Listen for arena updates
        socket.on('arena:playerJoined', (data) => {
          console.log('[Socket.IO] Player joined arena:', data);
          store.dispatch(addPlayerToArena(data));
        });

        socket.on('arena:playerLeft', (data) => {
          console.log('[Socket.IO] Player left arena:', data);
          store.dispatch(removePlayerFromArena(data));
        });

        socket.on('arena:playerCountUpdate', (data) => {
          console.log('[Socket.IO] Arena player count update:', data);
          store.dispatch(updateArenaPlayers(data));
        });

      } catch (error) {
        console.error('[Socket.IO] Failed to initialize:', error);
      }
    }

    // Handle socket disconnect on cleanup
    if (action.type === 'socket/disconnect' && socket) {
      socket.disconnect();
      socket = null;
    }

    return next(action);
  };
};

export default socketMiddleware;
