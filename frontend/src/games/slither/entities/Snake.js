// src/entities/Snake.js
import Phaser from 'phaser';
import EyePair from './EyePair.js';

export default class Snake {
  constructor(scene, x, y, skin = 'default', isPlayer = false) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.skin = skin;
    this.isPlayer = isPlayer;
    this.isDead = false;

    this.segments = [];
    this.segmentSpacing = 12; // Reduced for smaller snake
    this.speed = 160;
    this.boostSpeed = 280;
    this.currentSpeed = this.speed;
    this.angle = 0;
    this.targetAngle = 0;

    // Store trail positions for smooth following
    this.trail = [];
    this.maxTrailLength = 1000;

    // Collision radius for head (smaller)
    this.headRadius = 16;
    this.bodyRadius = 14;

    // Boost mechanics
    this.isBoosting = false;
    this.boostTrailTimer = 0;
    this.boostTrailInterval = 100; // ms between pellet drops
    this.lastBoostPelletTime = 0;

    // Double tap detection
    this.lastTapTime = 0;
    this.doubleTapDelay = 300; // ms for double tap

    this.skinColors = {
      default: 0x00ff88,
      'neon-blue': 0x00d4ff,
      fire: 0xff4444,
      galaxy: 0xaa00ff,
      gold: 0xffd700
    };

    this.createSnake();
    this.eyes = new EyePair(scene, this.segments[0]);

    if (isPlayer) {
      this.setupPlayerControls();
    }
  }

  createSnake() {
    const baseColor = this.skinColors[this.skin] || 0x00ff88;

    // HEAD (using circle.png asset) - smaller size
    const head = this.scene.add.image(this.x, this.y, 'circle');
    head.setTint(baseColor);
    head.setScale(0.5); // Reduced from 0.7
    head.setDepth(100);
    head.snake = this;

    this.segments.push(head);
    this.trail.push({ x: this.x, y: this.y });

    // BODY SEGMENTS
    const segmentCount = 14;

    for (let i = 1; i <= segmentCount; i++) {
      const seg = this.scene.add.image(
        this.x - i * this.segmentSpacing,
        this.y,
        'circle'
      );

      seg.setTint(baseColor);
      seg.setScale(0.48); // Reduced from 0.68
      seg.setDepth(100 - i);

      this.segments.push(seg);
      this.trail.push({ x: this.x - i * this.segmentSpacing, y: this.y });
    }
  }

  setupPlayerControls() {
    this.scene.input.on('pointermove', (pointer) => {
      if (this.isDead) return;
      const dx = pointer.worldX - this.segments[0].x;
      const dy = pointer.worldY - this.segments[0].y;
      this.targetAngle = Math.atan2(dy, dx);
    });

    // Double tap/click for boost
    this.scene.input.on('pointerdown', () => {
      if (this.isDead) return;

      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - this.lastTapTime;

      if (timeSinceLastTap < this.doubleTapDelay) {
        // Double tap detected
        this.startBoost();
      }

      this.lastTapTime = currentTime;
    });

    this.scene.input.on('pointerup', () => this.endBoost());

    // Space key for boost (double tap)
    const space = this.scene.input.keyboard.addKey('SPACE');
    let spaceLastPress = 0;

    space.on('down', () => {
      if (this.isDead) return;

      const currentTime = Date.now();
      const timeSinceLastPress = currentTime - spaceLastPress;

      if (timeSinceLastPress < this.doubleTapDelay) {
        // Double press detected
        this.startBoost();
      }

      spaceLastPress = currentTime;
    });

    space.on('up', () => this.endBoost());
  }

  startBoost() {
    if (this.isDead || this.segments.length <= 5) return; // Need minimum length to boost
    this.currentSpeed = this.boostSpeed;
    this.isBoosting = true;
  }

  endBoost() {
    this.currentSpeed = this.speed;
    this.isBoosting = false;
  }

  update(delta) {
    if (this.isDead) return;

    // Handle boost trail
    if (this.isBoosting) {
      this.lastBoostPelletTime += delta;

      if (this.lastBoostPelletTime >= this.boostTrailInterval) {
        this.dropBoostPellet();
        this.shrink(0.5); // Lose length while boosting
        this.lastBoostPelletTime = 0;
      }
    }

    // Smooth turn
    this.angle = Phaser.Math.Angle.RotateTo(this.angle, this.targetAngle, 0.12);

    // Move head
    const distance = (this.currentSpeed * delta) / 1000;
    const head = this.segments[0];
    head.x += Math.cos(this.angle) * distance;
    head.y += Math.sin(this.angle) * distance;

    // Add current head position to trail
    this.trail.unshift({ x: head.x, y: head.y });

    // Limit trail length
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }

    // Position each segment along the trail at fixed intervals
    for (let i = 1; i < this.segments.length; i++) {
      const targetDistance = i * this.segmentSpacing;

      // Find position along trail
      let accumulatedDistance = 0;

      for (let j = 0; j < this.trail.length - 1; j++) {
        const p1 = this.trail[j];
        const p2 = this.trail[j + 1];
        const segmentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        if (accumulatedDistance + segmentDistance >= targetDistance) {
          // Interpolate position
          const remainingDistance = targetDistance - accumulatedDistance;
          const ratio = remainingDistance / segmentDistance;

          this.segments[i].x = p1.x + (p2.x - p1.x) * ratio;
          this.segments[i].y = p1.y + (p2.y - p1.y) * ratio;
          break;
        }

        accumulatedDistance += segmentDistance;
      }
    }

    this.eyes.update();
  }

  // Drop a small pellet while boosting
  dropBoostPellet() {
    if (this.segments.length <= 5) {
      this.endBoost();
      return;
    }

    const tail = this.segments[this.segments.length - 1];
    const Pellet = this.scene.sys.game.registry.get('PelletClass');

    if (Pellet) {
      const pellet = new Pellet(this.scene, tail.x, tail.y, 'small');
      if (this.scene.addBoostPellet) {
        this.scene.addBoostPellet(pellet);
      }
    }
  }

  // Shrink snake (lose segments)
  shrink(amount = 1) {
    const wholeSegments = Math.floor(amount);

    for (let i = 0; i < wholeSegments; i++) {
      if (this.segments.length <= 5) break; // Keep minimum length

      const segment = this.segments.pop();
      if (segment) {
        segment.destroy();
      }
    }
  }

  // Check collision with another snake's body
  checkCollisionWith(otherSnake) {
    if (this.isDead || otherSnake.isDead) return false;

    const head = this.segments[0];

    // Check against all segments of the other snake (skip head to head for now)
    for (let i = 0; i < otherSnake.segments.length; i++) {
      const segment = otherSnake.segments[i];
      const distance = Math.hypot(head.x - segment.x, head.y - segment.y);

      // If this is the other snake's head, use head-to-head collision
      if (i === 0) {
        if (distance < this.headRadius + otherSnake.headRadius - 10) {
          return true;
        }
      } else {
        // Body collision
        if (distance < this.headRadius + otherSnake.bodyRadius - 8) {
          return true;
        }
      }
    }

    return false;
  }

  // Find nearest threat (another snake's body)
  findNearestThreat(allSnakes) {
    const head = this.segments[0];
    let nearestDist = Infinity;
    let nearestAngle = null;
    let threatX = 0;
    let threatY = 0;
    let threatCount = 0;

    allSnakes.forEach(snake => {
      if (snake === this || snake.isDead) return;

      // Check each segment of other snakes
      snake.segments.forEach((seg, i) => {
        const dist = Math.hypot(head.x - seg.x, head.y - seg.y);

        if (dist < 200) { // Larger threat detection radius
          // Weight closer threats more heavily
          const weight = 1 / (dist + 1);
          threatX += seg.x * weight;
          threatY += seg.y * weight;
          threatCount += weight;

          if (dist < nearestDist) {
            nearestDist = dist;
          }
        }
      });
    });

    // Calculate average threat direction weighted by proximity
    if (threatCount > 0) {
      threatX /= threatCount;
      threatY /= threatCount;
      nearestAngle = Math.atan2(threatY - head.y, threatX - head.x);
    }

    return { distance: nearestDist, angle: nearestAngle, intensity: threatCount };
  }

  // Find nearest food
  findNearestFood(foods) {
    const head = this.segments[0];
    let nearestDist = Infinity;
    let nearestAngle = null;

    foods.forEach(food => {
      if (food.destroyed || !food.container) return;
      const dist = Math.hypot(head.x - food.container.x, head.y - food.container.y);

      if (dist < 300 && dist < nearestDist) { // Food detection radius
        nearestDist = dist;
        nearestAngle = Math.atan2(food.container.y - head.y, food.container.x - head.x);
      }
    });

    return { distance: nearestDist, angle: nearestAngle };
  }

  grow(amount = 3) {
    const baseColor = this.skinColors[this.skin] || 0x00ff88;

    for (let i = 0; i < amount; i++) {
      const newIndex = this.segments.length;
      const tail = this.segments[newIndex - 1];

      // Calculate position behind tail using trail
      const targetDistance = newIndex * this.segmentSpacing;
      let accumulatedDistance = 0;
      let newX = tail.x;
      let newY = tail.y;

      for (let j = 0; j < this.trail.length - 1; j++) {
        const p1 = this.trail[j];
        const p2 = this.trail[j + 1];
        const segmentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        if (accumulatedDistance + segmentDistance >= targetDistance) {
          const remainingDistance = targetDistance - accumulatedDistance;
          const ratio = remainingDistance / segmentDistance;

          newX = p1.x + (p2.x - p1.x) * ratio;
          newY = p1.y + (p2.y - p1.y) * ratio;
          break;
        }

        accumulatedDistance += segmentDistance;
      }

      const seg = this.scene.add.image(newX, newY, 'circle');
      seg.setTint(baseColor);
      seg.setScale(0.48); // Adjusted for smaller snake
      seg.setDepth(100 - newIndex);

      this.segments.push(seg);
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;

    // Create pellets from dead snake's body
    const pellets = [];
    this.segments.forEach((seg, i) => {
      if (i === 0) return; // Skip head

      // Create a pellet at each segment position
      const Pellet = this.scene.sys.game.registry.get('PelletClass');
      if (Pellet) {
        // 80% white pellets, 20% random colored
        const isWhite = Math.random() < 0.6;
        const color = isWhite ? 0xffffff : null;

        // Most pellets are small from death
        const pellet = new Pellet(this.scene, seg.x, seg.y, 'small', color);
        pellets.push(pellet);
      }
    });

    // Notify scene about new pellets
    if (this.scene.addDeathPellets) {
      this.scene.addDeathPellets(pellets);
    }

    // Death effect
    this.segments.forEach((seg, i) => {
      this.scene.tweens.add({
        targets: seg,
        alpha: 0,
        scale: 0,
        angle: Phaser.Math.Between(-180, 180),
        y: seg.y - 50,
        duration: 800,
        delay: 30,
        ease: 'Power2'
      });
    });

    this.scene.time.delayedCall(1000, () => {
      this.destroy();
      if (this.isPlayer) {
        this.scene.game.events.emit('gameOver', this.segments.length);
      }
    });
  }

  destroy() {
    this.segments.forEach(s => s.destroy());
    this.eyes?.destroy();
    this.segments = [];
    this.trail = [];
  }

  getLength() {
    return this.segments.length;
  }
}