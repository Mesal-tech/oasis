// src/entities/Pellet.js
import Phaser from 'phaser';

export default class Pellet {
  constructor(scene, x, y, size = 'medium', color = null) {
    this.scene = scene;
    this.destroyed = false;

    // Size variants: small (0.5x), medium (1x), large (2x) relative to snake head
    const sizeConfig = {
      small: { scale: 1.05, growAmount: 0.5, radius: 20 },
      medium: { scale: 2.1, growAmount: 1, radius: 30 },
      large: { scale: 4.2, growAmount: 3, radius: 45 }
    };

    this.config = sizeConfig[size] || sizeConfig.medium;
    this.growAmount = this.config.growAmount;

    // Create container for layered sprites
    this.container = scene.add.container(x, y);
    this.container.setDepth(5);

    // Background hex layer
    this.hexSprite = scene.add.image(0, 0, 'hex');
    this.hexSprite.setScale(this.config.scale);

    // Foreground food layer (slightly smaller for border effect)
    this.foodSprite = scene.add.image(0, 0, 'food');
    this.foodSprite.setScale(this.config.scale * 0.85);

    // Add both to container
    this.container.add([this.hexSprite, this.foodSprite]);

    // Color selection
    if (color) {
      this.foodSprite.setTint(color);
      // Hex gets a slightly darker version
      this.hexSprite.setTint(this.darkenColor(color));
    } else {
      // Random tint for variety
      const colors = [0xff6b9d, 0x6bddff, 0xffe66b, 0x9dff6b, 0xff6bff];
      const selectedColor = Phaser.Utils.Array.GetRandom(colors);
      this.foodSprite.setTint(selectedColor);
      this.hexSprite.setTint(this.darkenColor(selectedColor));
    }

    // Pulse animation on container
    const pulseScale = 1.15;
    scene.tweens.add({
      targets: this.container,
      scaleX: pulseScale,
      scaleY: pulseScale,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Rotate hex slowly for visual interest
    scene.tweens.add({
      targets: this.hexSprite,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear'
    });

    this.collectRadius = this.config.radius;
  }

  // Darken a color by reducing RGB values
  darkenColor(color) {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    const darkenFactor = 0.6;
    const newR = Math.floor(r * darkenFactor);
    const newG = Math.floor(g * darkenFactor);
    const newB = Math.floor(b * darkenFactor);

    return (newR << 16) | (newG << 8) | newB;
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

    if (rand < 0.9) {
      size = 'small';
    } else if (rand < 2.4) {
      size = 'medium';
    } else {
      size = 'large';
    }

    return new Pellet(scene, x, y, size);
  }
}