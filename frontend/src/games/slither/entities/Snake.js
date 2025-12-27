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

    // Scaling configuration
    this.minLength = 5; // Initial/minimum number of segments
    this.minScale = 0.3; // Scale at minimum length
    this.maxScale = 0.65; // Maximum scale (won't grow fatter beyond this)
    this.maxScaleLength = 100; // Length at which max scale is reached

    // Dynamic segment spacing for flexibility
    this.baseSegmentSpacing = 8;
    this.minSegmentSpacing = 5; // More flexible when longer

    this.speed = 160;
    this.boostSpeed = 280;
    this.currentSpeed = this.speed;
    this.angle = 0;
    this.targetAngle = 0;

    // Store trail positions for smooth following
    this.trail = [];
    this.maxTrailLength = 1000;

    // Dynamic collision radius
    this.baseHeadRadius = 16;
    this.baseBodyRadius = 14;

    // Boost mechanics
    this.isBoosting = false;
    this.boostTrailTimer = 0;
    this.boostTrailInterval = 100;
    this.lastBoostPelletTime = 0;

    // Double tap detection
    this.lastTapTime = 0;
    this.doubleTapDelay = 300;

    // Map skin IDs to texture keys and optional tints
    this.skinConfig = {
      default: { texture: 'skin_green', tint: 0xffffff },
      'neon-blue': { texture: 'skin_neon', tint: 0xffffff },
      fire: { texture: 'skin_fire', tint: 0xffffff },
      galaxy: { texture: 'skin_galaxy', tint: 0xffffff },
      gold: { texture: 'skin_green', tint: 0xffd700 } // Fallback to green with gold tint for now
    };

    this.createSnake();
    this.eyes = new EyePair(scene, this.segments[0]);

    if (isPlayer) {
      this.setupPlayerControls();
    }
  }

  // Calculate current scale based on snake length
  getCurrentScale() {
    const length = this.segments.length;
    if (length <= this.minLength) return this.minScale;
    if (length >= this.maxScaleLength) return this.maxScale;

    // Linear interpolation between min and max scale
    const progress = (length - this.minLength) / (this.maxScaleLength - this.minLength);
    return this.minScale + (this.maxScale - this.minScale) * progress;
  }

  // Calculate segment spacing based on length (more flexible when longer)
  getSegmentSpacing() {
    const length = this.segments.length;
    if (length <= this.minLength) return this.baseSegmentSpacing;

    // Gradually reduce spacing as snake grows for better flexibility
    const progress = Math.min((length - this.minLength) / 50, 1);
    return this.baseSegmentSpacing - (this.baseSegmentSpacing - this.minSegmentSpacing) * progress;
  }

  // Get collision radii based on current scale
  getCollisionRadii() {
    const scale = this.getCurrentScale();
    return {
      head: this.baseHeadRadius * (scale / this.minScale),
      body: this.baseBodyRadius * (scale / this.minScale)
    };
  }

  createSnake() {
    const config = this.skinConfig[this.skin] || this.skinConfig['default'];
    const scale = this.getCurrentScale();

    // HEAD
    const head = this.scene.add.image(this.x, this.y, config.texture);
    head.setTint(config.tint);
    head.setScale(scale);
    head.setDepth(100);
    head.snake = this;

    this.segments.push(head);
    this.trail.push({ x: this.x, y: this.y });

    // BODY SEGMENTS
    const segmentCount = this.minLength - 1;
    const spacing = this.getSegmentSpacing();

    for (let i = 1; i <= segmentCount; i++) {
      const seg = this.scene.add.image(
        this.x - i * spacing,
        this.y,
        config.texture // Use same texture for body
      );

      seg.setTint(config.tint);
      seg.setScale(scale * 0.98); // Slightly smaller than head
      seg.setDepth(100 - i);

      this.segments.push(seg);
      this.trail.push({ x: this.x - i * spacing, y: this.y });
    }
  }

  // ... (keep setupPlayerControls) ...
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
        this.startBoost();
      }

      this.lastTapTime = currentTime;
    });

    this.scene.input.on('pointerup', () => this.endBoost());

    // Space key for boost
    const space = this.scene.input.keyboard.addKey('SPACE');
    let spaceLastPress = 0;

    space.on('down', () => {
      if (this.isDead) return;

      const currentTime = Date.now();
      const timeSinceLastPress = currentTime - spaceLastPress;

      if (timeSinceLastPress < this.doubleTapDelay) {
        this.startBoost();
      }

      spaceLastPress = currentTime;
    });

    space.on('up', () => this.endBoost());
  }
  startBoost() {
    // Can only boost if longer than initial length
    if (this.isDead || this.segments.length <= this.minLength) return;
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
        // Drop pellet and shrink proportionally
        const shrinkAmount = this.dropBoostPellet();
        if (shrinkAmount > 0) {
          this.shrink(shrinkAmount);
        }
        this.lastBoostPelletTime = 0;

        // Auto-stop boost if we reach minimum length
        if (this.segments.length <= this.minLength) {
          this.endBoost();
        }
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

    // Get current spacing and scale
    const spacing = this.getSegmentSpacing();
    const scale = this.getCurrentScale();

    // Update all segment scales
    this.segments.forEach((seg, i) => {
      const segScale = i === 0 ? scale : scale * 0.98;
      seg.setScale(segScale);
    });

    // Position each segment along the trail at fixed intervals
    for (let i = 1; i < this.segments.length; i++) {
      const targetDistance = i * spacing;

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

    // Update eyes with appropriate target
    let targetX, targetY;
    if (this.isPlayer) {
      const pointer = this.scene.input.activePointer;
      targetX = pointer.worldX ?? pointer.x;
      targetY = pointer.worldY ?? pointer.y;
    } else {
      // Bots look in their movement direction
      const lookDistance = 300;
      targetX = head.x + Math.cos(this.angle) * lookDistance;
      targetY = head.y + Math.sin(this.angle) * lookDistance;
    }

    this.eyes.update(scale, targetX, targetY);
  }

  dropBoostPellet() {
    if (this.segments.length <= this.minLength) {
      this.endBoost();
      return 0;
    }

    const tail = this.segments[this.segments.length - 1];
    const Pellet = this.scene.sys.game.registry.get('PelletClass');

    if (Pellet) {
      // Always drop small pellets while boosting
      const pellet = new Pellet(this.scene, tail.x, tail.y, 'small');

      if (this.scene.foods) {
        this.scene.foods.push(pellet);
      }

      // Gradual shrink - lose 0.3 segments per small pellet dropped
      return 0.3;
    }

    return 0;
  }

  shrink(amount = 1) {
    // Calculate how many segments to remove
    const segmentsToRemove = Math.floor(amount);
    const partialSegment = amount - segmentsToRemove;

    // Remove whole segments
    for (let i = 0; i < segmentsToRemove; i++) {
      if (this.segments.length <= this.minLength) break;

      const segment = this.segments.pop();
      if (segment) {
        segment.destroy();
      }
    }

    // Handle partial segment removal by accumulating
    if (!this.partialShrinkAccumulator) {
      this.partialShrinkAccumulator = 0;
    }

    this.partialShrinkAccumulator += partialSegment;

    // When accumulated partial reaches 1, remove a segment
    if (this.partialShrinkAccumulator >= 1 && this.segments.length > this.minLength) {
      const segment = this.segments.pop();
      if (segment) {
        segment.destroy();
      }
      this.partialShrinkAccumulator -= 1;
    }
  }

  checkCollisionWith(otherSnake) {
    if (this.isDead || otherSnake.isDead) return false;

    const head = this.segments[0];
    const radii = this.getCollisionRadii();
    const otherRadii = otherSnake.getCollisionRadii();

    for (let i = 0; i < otherSnake.segments.length; i++) {
      const segment = otherSnake.segments[i];
      const distance = Math.hypot(head.x - segment.x, head.y - segment.y);

      if (i === 0) {
        // Head-to-head collision
        if (distance < radii.head + otherRadii.head - 10) {
          return true;
        }
      } else {
        // Body collision
        if (distance < radii.head + otherRadii.body - 8) {
          return true;
        }
      }
    }

    return false;
  }

  findNearestThreat(allSnakes) {
    const head = this.segments[0];
    let nearestDist = Infinity;
    let nearestAngle = null;
    let threatX = 0;
    let threatY = 0;
    let threatCount = 0;

    allSnakes.forEach(snake => {
      if (snake === this || snake.isDead) return;

      snake.segments.forEach((seg, i) => {
        const dist = Math.hypot(head.x - seg.x, head.y - seg.y);

        if (dist < 200) {
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

    if (threatCount > 0) {
      threatX /= threatCount;
      threatY /= threatCount;
      nearestAngle = Math.atan2(threatY - head.y, threatX - head.x);
    }

    return { distance: nearestDist, angle: nearestAngle, intensity: threatCount };
  }

  findNearestFood(foods) {
    const head = this.segments[0];
    let nearestDist = Infinity;
    let nearestAngle = null;

    foods.forEach(food => {
      if (food.destroyed || !food.container) return;
      const dist = Math.hypot(head.x - food.container.x, head.y - food.container.y);

      if (dist < 300 && dist < nearestDist) {
        nearestDist = dist;
        nearestAngle = Math.atan2(food.container.y - head.y, food.container.x - head.x);
      }
    });

    return { distance: nearestDist, angle: nearestAngle };
  }

  grow(amount = 3) {
    const config = this.skinConfig[this.skin] || this.skinConfig['default'];
    const scale = this.getCurrentScale();
    const spacing = this.getSegmentSpacing();

    for (let i = 0; i < amount; i++) {
      const newIndex = this.segments.length;
      const tail = this.segments[newIndex - 1];

      // Calculate position behind tail using trail
      const targetDistance = newIndex * spacing;
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

      const seg = this.scene.add.image(newX, newY, config.texture);
      seg.setTint(config.tint);
      seg.setScale(scale * 0.98);
      seg.setDepth(100 - newIndex);

      this.segments.push(seg);
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;

    // IMPORTANT: Capture length BEFORE destruction
    const finalLength = this.segments.length;

    const pellets = [];
    this.segments.forEach((seg, i) => {
      if (i === 0) return;

      const Pellet = this.scene.sys.game.registry.get('PelletClass');
      if (Pellet) {
        const isWhite = Math.random() < 0.6;
        const color = isWhite ? 0xffffff : null;
        const pellet = new Pellet(this.scene, seg.x, seg.y, 'small', color);
        pellets.push(pellet);
      }
    });

    if (this.scene.addDeathPellets) {
      this.scene.addDeathPellets(pellets);
    }

    this.segments.forEach((seg) => {
      this.scene.tweens.add({
        targets: seg,
        alpha: 0,
        scale: 0,
        angle: Phaser.Math.Between(-180, 180),
        y: seg.y - 50,
        duration: 400,
        delay: 30,
        ease: 'Power2'
      });
    });

    this.scene.time.delayedCall(1000, () => {
      this.destroy();
      if (this.isPlayer) {
        // Use captured length instead of this.segments.length (which is now 0)
        this.scene.game.events.emit('gameOver', finalLength);
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