// src/entities/Pellet.js
import * as Phaser from 'phaser';

export default class Pellet {
  constructor(scene, x, y, size = 'medium', color = null) {
    this.scene = scene;
    this.destroyed = false;

    // Size variants: small (0.5x), medium (1x), large (2x) relative to snake head
    const sizeConfig = {
      small: { scale: 1, growAmount: 0.5, radius: 25 },
      medium: { scale: 1.5, growAmount: 1, radius: 35 },
      large: { scale: 2.3, growAmount: 3, radius: 55 }
    };

    this.config = sizeConfig[size] || sizeConfig.medium;
    this.growAmount = this.config.growAmount;

    // Create container for layered sprites
    this.container = scene.add.container(x, y);
    this.container.setDepth(5);

    // Color selection first
    let selectedColor;
    if (color) {
      selectedColor = color;
    } else {
      // Random tint for variety
      const colors = [0xff6b9d, 0x6bddff, 0xffe66b, 0x9dff6b, 0xff6bff];
      selectedColor = Phaser.Utils.Array.GetRandom(colors);
    }

    // OUTER GLOW LAYERS (3 layers for soft glow effect)
    this.glowLayers = [];

    for (let i = 3; i >= 1; i--) {
      const glowLayer = scene.add.image(0, 0, 'food');
      const glowScale = this.config.scale * (0.65 + i * 0.3);
      glowLayer.setScale(glowScale);
      glowLayer.setTint(selectedColor);
      glowLayer.setAlpha(0.05 * i); // Outer layers more transparent
      glowLayer.setBlendMode(Phaser.BlendModes.SUB); // Additive blending for glow
      this.container.add(glowLayer);
      this.glowLayers.push(glowLayer);
    }

    // Foreground food layer (main pellet)
    this.foodSprite = scene.add.image(0, 0, 'food');
    this.foodSprite.setScale(this.config.scale * 0.85);
    this.foodSprite.setTint(selectedColor);
    this.container.add(this.foodSprite);

    // FLOATING ANIMATION - gentle up and down motion
    const floatDistance = Phaser.Math.Between(8, 15); // Random float distance
    const floatDuration = Phaser.Math.Between(1500, 2500); // Random speed
    const floatDelay = Phaser.Math.Between(0, 1000); // Stagger the start

    scene.tweens.add({
      targets: this.container,
      y: y + floatDistance,
      duration: floatDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: floatDelay
    });

    // SLIGHT HORIZONTAL DRIFT for more natural floating
    const driftDistance = Phaser.Math.Between(5, 10);
    const driftDuration = Phaser.Math.Between(2000, 3500);
    const driftDelay = Phaser.Math.Between(0, 1500);

    scene.tweens.add({
      targets: this.container,
      x: x + driftDistance,
      duration: driftDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: driftDelay
    });

    // Pulse animation (existing)
    const pulseScale = 1.1;
    scene.tweens.add({
      targets: this.foodSprite,
      scaleX: (this.config.scale * 0.85) * pulseScale,
      scaleY: (this.config.scale * 0.5) * pulseScale,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // GLOW PULSE - make the glow layers pulse
    this.glowLayers.forEach((glowLayer, index) => {
      const baseScale = this.config.scale * (0.85 + (3 - index) * 0.3);
      scene.tweens.add({
        targets: glowLayer,
        scaleX: baseScale * 1.2,
        scaleY: baseScale * 1.2,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: index * 100 // Stagger the glow layers
      });
    });

    // BLINKING EFFECT - periodic brightness increase
    const blinkDelay = Phaser.Math.Between(0, 2000);
    scene.tweens.add({
      targets: [this.foodSprite, ...this.glowLayers],
      alpha: 0.3, // Increase brightness
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: blinkDelay,
      repeatDelay: Phaser.Math.Between(1500, 3000) // Random blink interval
    });

    // SLIGHT ROTATION for extra floating effect
    const rotationAmount = Phaser.Math.Between(-5, 5);
    const rotationDuration = Phaser.Math.Between(3000, 5000);

    scene.tweens.add({
      targets: this.container,
      angle: rotationAmount,
      duration: rotationDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.collectRadius = this.config.radius;
  }

  update(snakeHead) {
    if (this.destroyed || !snakeHead || !this.container) return;

    const dist = Phaser.Math.Distance.Between(
      this.container.x,
      this.container.y,
      snakeHead.x,
      snakeHead.y
    );

    if (dist < this.collectRadius) {
      this.collect(snakeHead.snake);
    }
  }

  collect(snake) {
    if (this.destroyed) return;
    this.destroyed = true;

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (this.container) {
          this.container.destroy();
        }
      }
    });

    if (snake && typeof snake.grow === 'function') {
      snake.grow(this.growAmount);
    }
  }

  static createRandom(scene, x, y) {
    const rand = Math.random();
    let size;

    if (rand < 0.6) {
      size = 'small';
    } else if (rand < 0.9) {
      size = 'medium';
    } else {
      size = 'large';
    }

    return new Pellet(scene, x, y, size);
  }
}