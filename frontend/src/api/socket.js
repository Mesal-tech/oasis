import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class GameSocketManager {
  constructor() {
    this.sockets = new Map();
  }

  connect(gameId, playerId, username) {
    // Disconnect existing socket if any
    this.disconnect(gameId);

    // Create new socket connection for the game
    const socket = io(`${SOCKET_URL}/${gameId}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Store socket
    this.sockets.set(gameId, socket);

    // Connection events
    socket.on('connect', () => {
      console.log(`Connected to ${gameId} game server`);
      // Join the game
      socket.emit('join', { playerId, username });
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected from ${gameId} game server`);
    });

    socket.on('connect_error', (error) => {
      console.error(`Connection error for ${gameId}:`, error);
    });

    return socket;
  }

  disconnect(gameId) {
    const socket = this.sockets.get(gameId);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(gameId);
    }
  }

  disconnectAll() {
    this.sockets.forEach((socket) => socket.disconnect());
    this.sockets.clear();
  }

  getSocket(gameId) {
    return this.sockets.get(gameId);
  }

  // Send input to game server
  sendInput(gameId, inputData) {
    const socket = this.sockets.get(gameId);
    if (socket && socket.connected) {
      socket.emit('input', inputData);
    }
  }

  // Listen to game state updates
  onGameState(gameId, callback) {
    const socket = this.sockets.get(gameId);
    if (socket) {
      socket.on('gameState', callback);
    }
  }

  // Listen to player events
  onPlayerJoined(gameId, callback) {
    const socket = this.sockets.get(gameId);
    if (socket) {
      socket.on('playerJoined', callback);
    }
  }

  onPlayerLeft(gameId, callback) {
    const socket = this.sockets.get(gameId);
    if (socket) {
      socket.on('playerLeft', callback);
    }
  }

  // Remove event listeners
  off(gameId, event, callback) {
    const socket = this.sockets.get(gameId);
    if (socket) {
      socket.off(event, callback);
    }
  }
}

export default new GameSocketManager();
