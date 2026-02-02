// src/entities/Snake.js
import * as Phaser from 'phaser';
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

    // Physics-based movement - each segment follows the one in front
    // No trail needed - segments have their own positions and velocities

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

    // Store previous head position
    const prevHeadX = head.x;
    const prevHeadY = head.y;

    head.x += Math.cos(this.angle) * distance;
    head.y += Math.sin(this.angle) * distance;

    // Get current spacing and scale
    const spacing = this.getSegmentSpacing();
    const scale = this.getCurrentScale();

    // Update all segment scales
    this.segments.forEach((seg, i) => {
      const segScale = i === 0 ? scale : scale * 0.98;
      seg.setScale(segScale);
    });

    // Physics-based segment following - each segment follows the one in front
    // This creates natural snake-like curves without needing a trail
    for (let i = 1; i < this.segments.length; i++) {
      const currentSeg = this.segments[i];
      const prevSeg = this.segments[i - 1];

      // Calculate direction from current segment to previous segment
      const dx = prevSeg.x - currentSeg.x;
      const dy = prevSeg.y - currentSeg.y;
      const dist = Math.hypot(dx, dy);

      // Only move if segments are too far apart
      if (dist > spacing) {
        // Move segment towards the previous one to maintain spacing
        const angle = Math.atan2(dy, dx);
        const moveDistance = dist - spacing;

        // Smooth movement with damping for more natural motion
        const damping = 0.5; // Adjust for more/less rigid movement
        currentSeg.x += Math.cos(angle) * moveDistance * damping;
        currentSeg.y += Math.sin(angle) * moveDistance * damping;
      }
    }

    // Update eyes with appropriate target
    let targetX, targetY;
    if (this.isPlayer) {
      // Get pointer world position (accounts for camera position)
      const pointer = this.scene.input.activePointer;
      targetX = pointer.worldX;
      targetY = pointer.worldY;
    } else {
      // Bots look in their movement direction
      const lookDistance = 300;
      targetX = head.x + Math.cos(this.angle) * lookDistance;
      targetY = head.y + Math.sin(this.angle) * lookDistance;
    }

    this.eyes.update(scale, targetX, targetY, this.angle);
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
    const otherHead = otherSnake.segments[0];
    const radii = this.getCollisionRadii();
    const otherRadii = otherSnake.getCollisionRadii();

    // Check head-to-head collision first
    const headDistance = Math.hypot(head.x - otherHead.x, head.y - otherHead.y);
    if (headDistance < radii.head + otherRadii.head - 10) {
      // Head-to-head collision detected
      // Determine which snake was moving toward the other
      // Calculate angle from this snake's head to other snake's head
      const angleToOther = Math.atan2(otherHead.y - head.y, otherHead.x - head.x);

      // Calculate the difference between this snake's movement angle and the angle to the other snake
      let angleDiff = Math.abs(this.angle - angleToOther);
      // Normalize to 0-PI range
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

      // If this snake is moving toward the other (angle difference < 90 degrees)
      if (angleDiff < Math.PI / 2) {
        return true; // This snake dies (it was moving toward the collision)
      }

      return false; // This snake was moving away, so it doesn't die
    }

    // Check collision with OTHER snake's BODY segments (skip their head at index 0)
    // This way, only the snake whose head hits another's body dies
    for (let i = 1; i < otherSnake.segments.length; i++) {
      const segment = otherSnake.segments[i];
      const distance = Math.hypot(head.x - segment.x, head.y - segment.y);

      // Body collision - this snake's head hit other snake's body
      if (distance < radii.head + otherRadii.body - 8) {
        return true;
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

      // Spawn new segment at tail position
      // It will naturally follow the tail through physics-based movement
      const seg = this.scene.add.image(tail.x, tail.y, config.texture);
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

    // Animate segments fading out
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

    // Animate eyes fading out at the same time
    if (this.eyes && this.eyes.leftEye && this.eyes.rightEye) {
      const eyeTargets = [this.eyes.leftEye, this.eyes.rightEye];

      // Add pupils if they exist
      if (this.eyes.leftPupil) eyeTargets.push(this.eyes.leftPupil);
      if (this.eyes.rightPupil) eyeTargets.push(this.eyes.rightPupil);

      this.scene.tweens.add({
        targets: eyeTargets,
        alpha: 0,
        scale: 0,
        duration: 400,
        delay: 30,
        ease: 'Power2'
      });
    }

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