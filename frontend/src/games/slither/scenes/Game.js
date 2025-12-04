// src/games/slither/scenes/Game.js
import Phaser from 'phaser';
import Snake from '../entities/Snake.js';
import Pellet from '../entities/Pellet.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
    this.snakes = [];
    this.foods = [];
  }

  preload() {
    // Load all assets
    this.load.image('circle', '/assets/slither/circle.png');
    this.load.image('eye-black', '/assets/slither/eye-black.png');
    this.load.image('eye-white', '/assets/slither/eye-white.png');
    this.load.image('food', '/assets/slither/food.png');
    this.load.image('hex', '/assets/slither/hex.png');
    this.load.image('tile', '/assets/slither/tile.png');
    this.load.image('white-shadow', '/assets/slither/white-shadow.png');
  }

  create() {
    // Register Pellet class for death pellets
    this.sys.game.registry.set('PelletClass', Pellet);

    // === ARENA SETTINGS ===
    const worldWidth = 6000;
    const worldHeight = 4500;
    this.arenaRadius = 2000; // Circular boundary radius
    this.arenaCenterX = worldWidth / 2;
    this.arenaCenterY = worldHeight / 2;

    // Create a tiled background
    const bg = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'tile');
    bg.setOrigin(0, 0);
    bg.setDepth(-10);
    bg.setAlpha(0.3);

    // === CIRCULAR BOUNDARY ===
    // Outer border
    const border = this.add.circle(
      this.arenaCenterX,
      this.arenaCenterY,
      this.arenaRadius,
      0x000000,
      0
    );
    border.setStrokeStyle(8, 0xff0000, 0.8);
    border.setDepth(1);

    // Inner warning zone (visual indicator)
    const warningZone = this.add.circle(
      this.arenaCenterX,
      this.arenaCenterY,
      this.arenaRadius - 50,
      0x000000,
      0
    );
    warningZone.setStrokeStyle(4, 0xff6600, 0.4);
    warningZone.setDepth(1);

    // === PLAYER SNAKE ===
    this.player = new Snake(this, this.arenaCenterX, this.arenaCenterY, 'neon-blue', true);
    this.snakes.push(this.player);

    // === CAMERA FOLLOW PLAYER ===
    this.cameras.main.startFollow(this.player.segments[0], true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBackgroundColor('#0a0a1f');
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // === BOT SNAKES ===
    const skins = ['default', 'fire', 'galaxy', 'gold'];
    for (let i = 0; i < 20; i++) {
      // Spawn bots randomly within arena
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (this.arenaRadius - 200);
      const botX = this.arenaCenterX + Math.cos(angle) * distance;
      const botY = this.arenaCenterY + Math.sin(angle) * distance;

      const bot = new Snake(
        this,
        botX,
        botY,
        skins[i % skins.length]
      );

      this.snakes.push(bot);
    }

    // === FOOD (PELLETS) ===
    this.targetFoodCount = 400; // Target number of pellets
    this.spawnInitialFood();

    // Set up continuous food spawning
    this.time.addEvent({
      delay: 100, // Check every 100ms
      callback: this.maintainFoodSupply,
      callbackScope: this,
      loop: true
    });
  }

  // Spawn initial food distribution
  spawnInitialFood() {
    for (let i = 0; i < this.targetFoodCount; i++) {
      this.spawnPelletInArena();
    }
  }

  // Spawn a single pellet randomly within the arena
  spawnPelletInArena() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (this.arenaRadius - 100);
    const x = this.arenaCenterX + Math.cos(angle) * distance;
    const y = this.arenaCenterY + Math.sin(angle) * distance;

    const pellet = new Pellet(this, x, y);
    this.foods.push(pellet);
  }

  // Maintain constant food supply
  maintainFoodSupply() {
    const currentFoodCount = this.foods.filter(f => !f.destroyed).length;
    const deficit = this.targetFoodCount - currentFoodCount;

    if (deficit > 0) {
      // Spawn 1-3 pellets at a time to smooth out spawning
      const spawnCount = Math.min(3, deficit);
      for (let i = 0; i < spawnCount; i++) {
        this.spawnPelletInArena();
      }
    }
  }

  // Check if position is within arena boundary
  isWithinArena(x, y) {
    const dist = Math.hypot(x - this.arenaCenterX, y - this.arenaCenterY);
    return dist < this.arenaRadius;
  }

  // Method to add pellets from dead snakes
  addDeathPellets(pellets) {
    this.foods.push(...pellets);
  }

  update(time, delta) {
    // 1. CHECK ARENA BOUNDARY COLLISIONS
    this.snakes.forEach(snake => {
      if (snake.isDead) return;

      const head = snake.segments[0];
      const distFromCenter = Math.hypot(
        head.x - this.arenaCenterX,
        head.y - this.arenaCenterY
      );

      // Snake dies if head goes outside arena
      if (distFromCenter > this.arenaRadius) {
        snake.die();
        return;
      }
    });

    // 2. UPDATE BOT AI
    this.snakes.forEach(snake => {
      if (snake.isDead || snake.isPlayer) return;

      const head = snake.segments[0];

      // Check distance from arena center for boundary avoidance
      const distFromCenter = Math.hypot(
        head.x - this.arenaCenterX,
        head.y - this.arenaCenterY
      );
      const boundaryProximity = distFromCenter / this.arenaRadius;

      // Find threats and food
      const threat = snake.findNearestThreat(this.snakes);
      const food = snake.findNearestFood(this.foods);

      // Calculate urgency of threat (0 to 1)
      const threatUrgency = threat.distance < 200 ?
        Math.max(0, 1 - threat.distance / 200) : 0;

      // BOUNDARY AVOIDANCE (highest priority)
      if (boundaryProximity > 0.85) {
        // Calculate angle toward center
        const angleToCenter = Math.atan2(
          this.arenaCenterY - head.y,
          this.arenaCenterX - head.x
        );

        const boundaryUrgency = (boundaryProximity - 0.85) / 0.15;
        const turnSpeed = 0.1 + (boundaryUrgency * 0.15);

        snake.targetAngle = Phaser.Math.Angle.RotateTo(
          snake.targetAngle,
          angleToCenter,
          turnSpeed
        );

        // Boost away from boundary if very close
        if (boundaryProximity > 0.95 && Math.random() < 0.2) {
          snake.startBoost();
          this.time.delayedCall(400, () => snake.endBoost());
        }
      } else if (threat.angle !== null && threatUrgency > 0.3) {
        // AVOID THREAT - Calculate escape angle
        const avoidAngle = threat.angle + Math.PI; // Opposite direction from threat center

        // Add some perpendicular movement for more natural avoidance
        const perpendicularOffset = Math.sin(time * 0.002) * 0.5;
        const finalAvoidAngle = avoidAngle + perpendicularOffset;

        // Stronger avoidance when threat is closer
        const turnSpeed = 0.08 + (threatUrgency * 0.12);

        snake.targetAngle = Phaser.Math.Angle.RotateTo(
          snake.targetAngle,
          finalAvoidAngle,
          turnSpeed
        );

        // Boost when in danger
        if (threatUrgency > 0.6 && Math.random() < 0.1) {
          snake.startBoost();
          this.time.delayedCall(300, () => snake.endBoost());
        }
      } else if (food.angle !== null && food.distance < 300) {
        // PURSUE FOOD - but be more cautious
        const foodWeight = Math.max(0.3, 1 - food.distance / 300);
        const turnSpeed = 0.05 * foodWeight;

        snake.targetAngle = Phaser.Math.Angle.RotateTo(
          snake.targetAngle,
          food.angle,
          turnSpeed
        );

        // Only boost for close food when safe
        if (food.distance < 100 && threatUrgency < 0.2 && Math.random() < 0.03) {
          snake.startBoost();
          this.time.delayedCall(400, () => snake.endBoost());
        }
      } else {
        // WANDER - smooth random movements
        if (Math.random() < 0.008) {
          const currentAngle = snake.targetAngle;
          const randomOffset = Phaser.Math.FloatBetween(-0.6, 0.6);
          snake.targetAngle = currentAngle + randomOffset;
        }
      }
    });

    // 3. CHECK SNAKE-TO-SNAKE COLLISIONS
    for (let i = 0; i < this.snakes.length; i++) {
      const snake1 = this.snakes[i];
      if (snake1.isDead) continue;

      for (let j = 0; j < this.snakes.length; j++) {
        if (i === j) continue; // Don't check self-collision

        const snake2 = this.snakes[j];
        if (snake2.isDead) continue;

        if (snake1.checkCollisionWith(snake2)) {
          snake1.die();
          break; // Snake is dead, no need to check more collisions
        }
      }
    }

    // 4. LET EVERY SNAKE CHECK FOR NEARBY FOOD
    this.snakes.forEach(snake => {
      if (snake.isDead) return;

      const head = snake.segments[0];

      this.foods.forEach(pellet => {
        if (pellet.destroyed) return;
        pellet.update(head);
      });
    });

    // 5. UPDATE ALL SNAKES (movement)
    this.snakes.forEach(snake => {
      if (!snake.isDead) {
        snake.update(delta);
      }
    });

    // 6. CLEAN UP DESTROYED FOOD
    this.foods = this.foods.filter(p => !p.destroyed);

    // 7. CLEAN UP DEAD SNAKES
    this.snakes = this.snakes.filter(s => !s.isDead);
  }
}