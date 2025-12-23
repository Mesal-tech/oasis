// src/games/slither/scenes/Game.js
import Phaser from 'phaser';
import Snake from '../entities/Snake.js';
import Pellet from '../entities/Pellet.js';
import UI from './UI.js';

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

    // Skins
    this.load.image('skin_green', '/assets/slither/skins/skin_green.png');
    this.load.image('skin_neon', '/assets/slither/skins/skin_neon.png');
    this.load.image('skin_fire', '/assets/slither/skins/skin_fire.png');
    this.load.image('skin_galaxy', '/assets/slither/skins/skin_galaxy.png');

    this.load.audio('bgm', [
      '/assets/slither/audio/bgm.mp3',
      '/assets/slither/audio/bgm.ogg'
    ]);
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
    const playerData = this.registry.get('playerData') || {};
    const playerSkin = playerData.skin || 'neon-blue';
    const playerNickname = playerData.nickname || 'You';

    this.player = new Snake(this, this.arenaCenterX, this.arenaCenterY, playerSkin, true);
    this.player.nickname = playerNickname;
    this.snakes.push(this.player);

    // === CAMERA FOLLOW PLAYER ===
    this.cameras.main.startFollow(this.player.segments[0], true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBackgroundColor('#0a0a1f');
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // === UI SETUP ===
    this.ui = new UI(this);

    // === BOT SNAKES ===
    const skins = ['default', 'fire', 'galaxy', 'gold'];
    const minDistanceFromEdge = 400; // Minimum distance from arena edge
    const minDistanceFromOthers = 300; // Minimum distance from other snakes
    const maxSpawnAttempts = 50; // Maximum attempts to find valid spawn position

    for (let i = 0; i < 20; i++) {
      let botX, botY;
      let validPosition = false;
      let attempts = 0;

      // Keep trying to find a valid spawn position
      while (!validPosition && attempts < maxSpawnAttempts) {
        attempts++;

        // Generate random position within safe zone (away from edge)
        const angle = Math.random() * Math.PI * 2;
        const maxDistance = this.arenaRadius - minDistanceFromEdge;
        const distance = Math.random() * maxDistance;

        botX = this.arenaCenterX + Math.cos(angle) * distance;
        botY = this.arenaCenterY + Math.sin(angle) * distance;

        // Check distance from all existing snakes
        validPosition = true;
        for (const existingSnake of this.snakes) {
          const head = existingSnake.segments[0];
          const dist = Math.hypot(botX - head.x, botY - head.y);

          if (dist < minDistanceFromOthers) {
            validPosition = false;
            break;
          }
        }
      }

      // If we found a valid position (or exhausted attempts), spawn the bot
      if (validPosition) {
        const bot = new Snake(
          this,
          botX,
          botY,
          skins[i % skins.length]
        );

        this.snakes.push(bot);
      }
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

    this.sound.add('bgm', {
      loop: true,
      volume: 0.5
    }).play();

    // Optional: nice fade-in (feels more polished)
    this.tweens.add({
      targets: this.sound.get('bgm'),
      volume: 0.5,
      duration: 4000,
      ease: 'Linear'
    });
  }

  // Spawn initial food distribution
  spawnInitialFood() {
    const numberOfClusters = 30; // Number of clusters to spawn (reduced from 60)
    const pelletsPerCluster = Phaser.Math.Between(4, 7); // Pellets per cluster (reduced from 5-10)

    for (let i = 0; i < numberOfClusters; i++) {
      // Random cluster center position within arena
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (this.arenaRadius - 200);
      const clusterX = this.arenaCenterX + Math.cos(angle) * distance;
      const clusterY = this.arenaCenterY + Math.sin(angle) * distance;

      // Spawn pellets around this cluster center
      this.spawnCluster(clusterX, clusterY, pelletsPerCluster);
    }
  }

  // New method: Spawn a cluster of pellets
  spawnCluster(centerX, centerY, count) {
    const clusterRadius = Phaser.Math.Between(100, 180); // Size of cluster spread (increased for more spacing)

    for (let i = 0; i < count; i++) {
      // Random position within cluster using circular distribution
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * clusterRadius;

      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Make sure it's within arena bounds
      if (this.isWithinArena(x, y)) {
        const pellet = Pellet.createRandom(this, x, y);
        this.foods.push(pellet);
      }
    }
  }

  // Replace maintainFoodSupply method with this:
  maintainFoodSupply() {
    const currentFoodCount = this.foods.filter(f => !f.destroyed).length;
    const targetCount = 200; // Reduced target count (was 400)
    const deficit = targetCount - currentFoodCount;

    if (deficit > 15) {
      // Spawn a new cluster when food is low
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (this.arenaRadius - 200);
      const clusterX = this.arenaCenterX + Math.cos(angle) * distance;
      const clusterY = this.arenaCenterY + Math.sin(angle) * distance;

      const pelletsToSpawn = Math.min(Phaser.Math.Between(4, 8), deficit);
      this.spawnCluster(clusterX, clusterY, pelletsToSpawn);
    }
  }

  // Replace spawnPelletInArena with this (still useful for boost pellets):
  spawnPelletInArena() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (this.arenaRadius - 100);
    const x = this.arenaCenterX + Math.cos(angle) * distance;
    const y = this.arenaCenterY + Math.sin(angle) * distance;

    const pellet = Pellet.createRandom(this, x, y);
    this.foods.push(pellet);
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

    // 8. SPAWN NEW BOTS IF NEEDED
    if (this.snakes.length < 25) {
      if (Math.random() < 0.05) { // Small chance per frame to spawn a new bot
        this.spawnBot();
      }
    }

    // 9. UPDATE UI
    if (this.ui) {
      this.ui.update();
    }
  }

  spawnBot() {
    const skins = ['default', 'fire', 'galaxy', 'gold', 'neon-blue'];
    const names = ['Viper', 'Python', 'Anaconda', 'Cobra', 'Sidewinder', 'Noodle', 'Snek', 'Danger Noodle', 'Hiss', 'Venom', 'Hydra', 'Basilisk', 'Worm', 'Slider', 'Glider'];

    let botX, botY;
    let validPosition = false;
    let attempts = 0;
    const minDistanceFromOthers = 300;
    const minDistanceFromEdge = 400;

    while (!validPosition && attempts < 20) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const maxDistance = this.arenaRadius - minDistanceFromEdge;
      const distance = Math.random() * maxDistance;
      botX = this.arenaCenterX + Math.cos(angle) * distance;
      botY = this.arenaCenterY + Math.sin(angle) * distance;

      validPosition = true;
      for (const existingSnake of this.snakes) {
        const head = existingSnake.segments[0];
        const dist = Math.hypot(botX - head.x, botY - head.y);
        if (dist < minDistanceFromOthers) {
          validPosition = false;
          break;
        }
      }
    }

    if (validPosition) {
      const bot = new Snake(
        this,
        botX,
        botY,
        skins[Math.floor(Math.random() * skins.length)]
      );
      bot.nickname = names[Math.floor(Math.random() * names.length)];
      this.snakes.push(bot);
    }
  }
}