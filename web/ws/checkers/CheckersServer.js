
const BaseGameServer = require('../BaseGameServer');
const Board = require('./logic/Board');
const logger = require('../../utils/logger');

class CheckersServer extends BaseGameServer {
  constructor(io) {
    super(io, '/checkers');
    this.maxPlayersPerRoom = 2; // Override default
  }

  createRoom(roomId) {
    const room = super.createRoom(roomId);
    room.maxPlayers = 2; // Enforce 2 players
    room.board = new Board(); // Logic instance
    room.activeChainPiece = null;
    room.gameState = room.board.toState(); // Serializable state
    return room;
  }

  handleJoin(socket, data) {
    const { playerId, username, joinType, roomCode } = data;
    logger.info(`[Matchmaking] Player ${playerId} attempting to join. Type: ${joinType}, Code: ${roomCode || 'N/A'}`);

    let room = null;

    // --- GHOST CLEANUP (for reconnecting players) ---
    // If a specific roomCode is provided, clean up ghost sessions first
    if (roomCode && this.rooms.has(roomCode)) {
      const targetRoom = this.rooms.get(roomCode);
      for (const [existingSocketId, existingPlayer] of targetRoom.players) {
        if (existingPlayer.id === playerId) {
          logger.warn(`[Matchmaking] Kicking GHOST player ${playerId} from room ${roomCode}`);
          const oldSocket = this.io.sockets.get(existingSocketId);
          if (oldSocket) {
            oldSocket.disconnect(true);
          } else {
            targetRoom.players.delete(existingSocketId);
            this.players.delete(existingSocketId);
          }
        }
      }
    }

    // --- MATCHMAKING LOGIC ---
    if (joinType === 'quickmatch') {
      // Find any non-private room with 1 player
      room = this.findQuickMatchRoom();
      if (!room) {
        // Create a new public room
        const newRoomId = this.generateRoomCode();
        room = this.createRoom(newRoomId);
        room.isPrivate = false;
        logger.info(`[Matchmaking] Created new quickmatch room: ${newRoomId}`);
      } else {
        logger.info(`[Matchmaking] Joining existing quickmatch room: ${room.id}`);
      }
    } else if (joinType === 'private') {
      if (!roomCode) {
        socket.emit('error', { message: 'Room code is required for private rooms' });
        return;
      }
      if (this.rooms.has(roomCode)) {
        room = this.rooms.get(roomCode);
        if (room.players.size >= room.maxPlayers) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }
        logger.info(`[Matchmaking] Joining existing private room: ${roomCode}`);
      } else {
        // Create the private room
        room = this.createRoom(roomCode);
        room.isPrivate = true;
        logger.info(`[Matchmaking] Created new private room: ${roomCode}`);
      }
    } else {
      // Legacy fallback (e.g., old clients)
      logger.warn(`[Matchmaking] Unknown joinType: ${joinType}. Using quickmatch fallback.`);
      room = this.findQuickMatchRoom() || this.createRoom(this.generateRoomCode());
    }

    // --- JOIN ROOM ---
    if (room.players.size >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const color = room.players.size === 0 ? 'RED' : 'BLUE';
    const player = {
      id: playerId,
      socketId: socket.id,
      username: username || 'Guest',
      roomId: room.id,
      color: color
    };

    this.players.set(socket.id, player);
    room.players.set(socket.id, player);
    socket.join(room.id);

    socket.emit('joined', {
      roomId: room.id,
      playerId,
      players: Array.from(room.players.values()),
      yourColor: color,
      isPrivate: room.isPrivate || false
    });

    socket.to(room.id).emit('playerJoined', player);
    logger.info(`[Matchmaking] Player ${playerId} joined room ${room.id} as ${color}`);

    socket.emit('gameState', room.gameState);
  }

  /**
   * Find a public room with exactly 1 player waiting.
   */
  findQuickMatchRoom() {
    for (const room of this.rooms.values()) {
      if (!room.isPrivate && room.players.size === 1 && room.players.size < room.maxPlayers) {
        return room;
      }
    }
    return null;
  }

  /**
   * Generate a 6-character uppercase room code.
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like I, O, 0, 1
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  handleInput(socket, data) {
    const player = this.players.get(socket.id);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (!room || !room.board) return;

    if (data.type === 'move') {
      const { start, end } = data;

      // Validation: Is it this player's turn?
      if (room.board.currentPlayer !== player.color) {
        logger.warn(`Player ${player.id} tried to move out of turn`);
        return;
      }

      // Chain Guard
      if (room.activeChainPiece) {
        if (start.row !== room.activeChainPiece.row || start.col !== room.activeChainPiece.col) {
          // Trying to move a different piece during a chain
          return;
        }
      }

      // Validate move logic
      if (room.board.isValidMove(start, end)) {
        // Apply move
        const result = room.board.movePiece(start, end);

        // Chain Logic
        let chainAvailable = false;
        if (result.captured && !result.promoted) {
          const validMoves = room.board.getValidMoves(end);
          // Check if any move is a capture (distance 2)
          if (validMoves.some(m => Math.abs(m.row - end.row) === 2)) {
            chainAvailable = true;
            room.activeChainPiece = end;
          }
        }

        if (!chainAvailable) {
          room.board.switchTurn();
          room.activeChainPiece = null;
        }

        // Check Game Over
        const gameOver = room.board.checkGameOver();

        // Update State
        room.gameState = room.board.toState();

        // 1. Broadcast explicit move event FIRST for animation triggers
        logger.info(`[CheckersDebug] Broadcasting moveMade to room ${room.id}. Start: ${JSON.stringify(start)}, End: ${JSON.stringify(end)}`);
        this.io.to(room.id).emit('moveMade', {
          start,
          end,
          player: player.id,
          color: player.color,
          result: result // { captured, promoted }
        });

        // 2. Broadcast State AFTER to sync up (client ignores if animating)
        this.io.to(room.id).emit('gameState', room.gameState);

        if (gameOver.gameOver) {
          this.io.to(room.id).emit('gameOver', gameOver);
        }
      } else {
        logger.warn(`Invalid move attempt by ${player.id}`, { start, end });
        // Optionally emit 'invalidMove' to reset client UI
        socket.emit('invalidMove');
      }
    }
  }

  // Override to prevent default tick loop spamming empty updates if not needed,
  // or keep it if we add timers later. For now, we only update on input.
  updateGameState(room) {
    // No continuous updates for turn-based checkers yet
  }
}

module.exports = CheckersServer;
