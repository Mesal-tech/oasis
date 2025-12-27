const BaseGameServer = require('../BaseGameServer');
const logger = require('../../utils/logger');

class SlitherServer extends BaseGameServer {
  constructor(io) {
    super(io, '/slither');
    this.worldSize = 5000;
    this.pelletCount = 500;
  }

  initializeGameState() {
    return {
      snakes: {},
      pellets: this.generatePellets(),
      worldSize: this.worldSize,
    };
  }

  handleInput(socket, data) {
    const player = this.players.get(socket.id);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (!room) return;

    const { angle } = data;
    const snake = room.gameState.snakes[player.id];

    if (snake) {
      snake.angle = angle;
    } else {
      // Create new snake for player
      room.gameState.snakes[player.id] = this.createSnake(player);
    }
  }

  createSnake(player) {
    return {
      id: player.id,
      username: player.username,
      x: Math.random() * this.worldSize,
      y: Math.random() * this.worldSize,
      angle: Math.random() * Math.PI * 2,
      segments: [
        { x: 0, y: 0 },
        { x: -10, y: 0 },
        { x: -20, y: 0 },
      ],
      length: 3,
      speed: 5,
      color: this.randomColor(),
      alive: true,
    };
  }

  updateGameState(room) {
    const { snakes, pellets } = room.gameState;

    // Update snake positions
    Object.values(snakes).forEach((snake) => {
      if (!snake.alive) return;

      // Move snake
      snake.x += Math.cos(snake.angle) * snake.speed;
      snake.y += Math.sin(snake.angle) * snake.speed;

      // Wrap around world
      if (snake.x < 0) snake.x = this.worldSize;
      if (snake.x > this.worldSize) snake.x = 0;
      if (snake.y < 0) snake.y = this.worldSize;
      if (snake.y > this.worldSize) snake.y = 0;

      // Check pellet collisions
      pellets.forEach((pellet, index) => {
        const dx = snake.x - pellet.x;
        const dy = snake.y - pellet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          // Snake ate pellet
          snake.length += 1;
          pellets.splice(index, 1);
          pellets.push(this.generatePellet());
        }
      });
    });

    // Check snake collisions (simplified)
    const aliveSnakes = Object.values(snakes).filter((s) => s.alive);
    for (let i = 0; i < aliveSnakes.length; i++) {
      for (let j = i + 1; j < aliveSnakes.length; j++) {
        const s1 = aliveSnakes[i];
        const s2 = aliveSnakes[j];

        const dx = s1.x - s2.x;
        const dy = s1.y - s2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
          // Collision - smaller snake dies
          if (s1.length > s2.length) {
            s2.alive = false;
            s1.length += Math.floor(s2.length / 2);
          } else {
            s1.alive = false;
            s2.length += Math.floor(s1.length / 2);
          }
        }
      }
    }
  }

  generatePellets() {
    const pellets = [];
    for (let i = 0; i < this.pelletCount; i++) {
      pellets.push(this.generatePellet());
    }
    return pellets;
  }

  generatePellet() {
    return {
      x: Math.random() * this.worldSize,
      y: Math.random() * this.worldSize,
      value: 1,
    };
  }

  randomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  handleDisconnect(socket) {
    const player = this.players.get(socket.id);
    if (player) {
      const room = this.rooms.get(player.roomId);
      if (room && room.gameState.snakes[player.id]) {
        delete room.gameState.snakes[player.id];
      }
    }
    super.handleDisconnect(socket);
  }
}

module.exports = SlitherServer;
