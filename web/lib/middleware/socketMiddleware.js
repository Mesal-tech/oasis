import { io } from 'socket.io-client';
import { updateGamePlayers } from '../slices/gamesSlice';
import { updatePlayerRank } from '../slices/leaderboardSlice';
import { updateArenaPlayers, addPlayerToArena, removePlayerFromArena } from '../slices/arenasSlice';

let socket = null;

const socketMiddleware = (store) => {
  return (next) => (action) => {
    // Initialize socket connection on first action
    if (!socket && typeof window !== 'undefined') {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      console.log('[Socket.IO] Connecting to:', socketUrl);

      // Connection events
      socket.on('connect', () => {
        console.log('[Socket.IO] Connected:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket.IO] Connection error:', error);
      });

      // Real-time event listeners
      
      // Game player count updates
      socket.on('game:playerCountUpdate', (data) => {
        console.log('[Socket.IO] Game player count update:', data);
        store.dispatch(updateGamePlayers({
          gameId: data.gameId,
          playerCount: data.playerCount,
        }));
      });

      // Leaderboard updates
      socket.on('leaderboard:update', (data) => {
        console.log('[Socket.IO] Leaderboard update:', data);
        store.dispatch(updatePlayerRank({
          playerId: data.playerId,
          newRank: data.rank,
          gameId: data.gameId || null,
        }));
      });

      // Arena player joined
      socket.on('arena:playerJoined', (data) => {
        console.log('[Socket.IO] Player joined arena:', data);
        store.dispatch(addPlayerToArena({
          arenaId: data.arenaId,
          player: data.player,
        }));
      });

      // Arena player left
      socket.on('arena:playerLeft', (data) => {
        console.log('[Socket.IO] Player left arena:', data);
        store.dispatch(removePlayerFromArena({
          arenaId: data.arenaId,
          playerId: data.playerId,
        }));
      });

      // Arena player count update
      socket.on('arena:playerCountUpdate', (data) => {
        console.log('[Socket.IO] Arena player count update:', data);
        store.dispatch(updateArenaPlayers({
          arenaId: data.arenaId,
          playerCount: data.playerCount,
        }));
      });
    }

    return next(action);
  };
};

// Export socket instance for manual emit if needed
export const getSocket = () => socket;

export default socketMiddleware;
