const BaseGameServer = require('../BaseGameServer');
const logger = require('../../utils/logger');

class FlappyServer extends BaseGameServer {
  constructor(io) {
    super(io, '/flappy');
    this.gravity = 0.6;
    this.jumpStrength = -10;
    this.pipeGap = 150;
    this.pipeWidth = 60;
    this.pipeSpeed = 3;
  }

  initializeGameState() {
    return {
      birds: {},
      pipes: this.generateInitialPipes(),
      gameTime: 0,
    };
  }

  handleInput(socket, data) {
    const player = this.players.get(socket.id);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (!room) return;

    const { action } = data;
    const bird = room.gameState.birds[player.id];

    if (action === 'jump' && bird && bird.alive) {
      bird.velocity = this.jumpStrength;
    } else if (action === 'start' && !bird) {
      // Create new bird for player
      room.gameState.birds[player.id] = this.createBird(player);
    }
  }

  createBird(player) {
    return {
      id: player.id,
      username: player.username,
      y: 250,
      velocity: 0,
      score: 0,
      alive: true,
      color: this.randomColor(),
    };
  }

  updateGameState(room) {
    const { birds, pipes } = room.gameState;
    room.gameState.gameTime += 1;

    // Update birds
    Object.values(birds).forEach((bird) => {
      if (!bird.alive) return;

      // Apply gravity
      bird.velocity += this.gravity;
      bird.y += bird.velocity;

      // Check boundaries
      if (bird.y < 0 || bird.y > 500) {
        bird.alive = false;
        return;
      }

      // Check pipe collisions
      pipes.forEach((pipe) => {
        const birdX = 100; // Fixed X position for bird
        const birdRadius = 15;

        // Check if bird is in pipe's X range
        if (birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + this.pipeWidth) {
          // Check if bird hit the pipe
          if (bird.y - birdRadius < pipe.topHeight || bird.y + birdRadius > pipe.topHeight + this.pipeGap) {
            bird.alive = false;
          } else if (birdX > pipe.x + this.pipeWidth && !pipe.scored) {
            // Bird passed the pipe
            bird.score += 1;
            pipe.scored = true;
          }
        }
      });
    });

    // Update pipes
    pipes.forEach((pipe) => {
      pipe.x -= this.pipeSpeed;
    });

    // Remove off-screen pipes and add new ones
    while (pipes.length > 0 && pipes[0].x < -this.pipeWidth) {
      pipes.shift();
    }

    const lastPipe = pipes[pipes.length - 1];
    if (!lastPipe || lastPipe.x < 600) {
      pipes.push(this.generatePipe(lastPipe ? lastPipe.x + 250 : 800));
    }
  }

  generateInitialPipes() {
    const pipes = [];
    for (let i = 0; i < 3; i++) {
      pipes.push(this.generatePipe(400 + i * 250));
    }
    return pipes;
  }

  generatePipe(x) {
    const minHeight = 50;
    const maxHeight = 350;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    return {
      x,
      topHeight,
      scored: false,
    };
  }

  randomColor() {
    const colors = ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF69B4', '#FFA500'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  handleDisconnect(socket) {
    const player = this.players.get(socket.id);
    if (player) {
      const room = this.rooms.get(player.roomId);
      if (room && room.gameState.birds[player.id]) {
        delete room.gameState.birds[player.id];
      }
    }
    super.handleDisconnect(socket);
  }
}

module.exports = FlappyServer;
