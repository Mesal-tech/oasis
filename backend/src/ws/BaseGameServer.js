const logger = require('../utils/logger');

class BaseGameServer {
  constructor(io, namespace) {
    this.io = io.of(namespace);
    this.rooms = new Map();
    this.players = new Map();
    this.tickRate = parseInt(process.env.GAME_TICK_RATE) || 60;
    this.tickInterval = 1000 / this.tickRate;

    this.setupEventHandlers();
    logger.info(`Game server initialized: ${namespace}`);
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Player connected to ${this.io.name}`, { socketId: socket.id });

      socket.on('join', (data) => this.handleJoin(socket, data));
      socket.on('leave', () => this.handleLeave(socket));
      socket.on('input', (data) => this.handleInput(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  handleJoin(socket, data) {
    const { playerId, username, roomId } = data;

    // Find or create room
    let room = this.findAvailableRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId || this.generateRoomId());
    }

    // Add player to room
    const player = {
      id: playerId,
      socketId: socket.id,
      username: username || 'Guest',
      roomId: room.id,
    };

    this.players.set(socket.id, player);
    room.players.set(socket.id, player);
    socket.join(room.id);

    // Notify player
    socket.emit('joined', {
      roomId: room.id,
      playerId,
      players: Array.from(room.players.values()),
    });

    // Notify other players
    socket.to(room.id).emit('playerJoined', player);

    logger.info('Player joined room', { playerId, roomId: room.id });
  }

  handleLeave(socket) {
    const player = this.players.get(socket.id);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (room) {
      room.players.delete(socket.id);
      socket.to(room.id).emit('playerLeft', { playerId: player.id });

      // Clean up empty rooms
      if (room.players.size === 0) {
        this.destroyRoom(room.id);
      }
    }

    this.players.delete(socket.id);
    socket.leave(player.roomId);

    logger.info('Player left room', { playerId: player.id, roomId: player.roomId });
  }

  handleDisconnect(socket) {
    this.handleLeave(socket);
    logger.info('Player disconnected', { socketId: socket.id });
  }

  handleInput(socket, data) {
    // Override in child classes
  }

  findAvailableRoom(preferredRoomId) {
    if (preferredRoomId && this.rooms.has(preferredRoomId)) {
      const room = this.rooms.get(preferredRoomId);
      if (room.players.size < room.maxPlayers) {
        return room;
      }
    }

    // Find any available room
    for (const room of this.rooms.values()) {
      if (room.players.size < room.maxPlayers) {
        return room;
      }
    }

    return null;
  }

  createRoom(roomId) {
    const room = {
      id: roomId,
      players: new Map(),
      maxPlayers: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 50,
      createdAt: Date.now(),
      gameState: this.initializeGameState(),
    };

    this.rooms.set(roomId, room);
    this.startGameLoop(room);

    logger.info('Room created', { roomId });
    return room;
  }

  destroyRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room && room.gameLoop) {
      clearInterval(room.gameLoop);
    }
    this.rooms.delete(roomId);
    logger.info('Room destroyed', { roomId });
  }

  startGameLoop(room) {
    room.gameLoop = setInterval(() => {
      this.updateGameState(room);
      this.broadcastGameState(room);
    }, this.tickInterval);
  }

  initializeGameState() {
    // Override in child classes
    return {};
  }

  updateGameState(room) {
    // Override in child classes
  }

  broadcastGameState(room) {
    this.io.to(room.id).emit('gameState', room.gameState);
  }

  generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = BaseGameServer;
