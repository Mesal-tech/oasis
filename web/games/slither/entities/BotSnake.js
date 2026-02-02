// BotSnake.js - FIXED (Better AI)
import Snake from './Snake.js';

export class BotSnake extends Snake {
  constructor(scene, spriteKey, x, y) {
    super(scene, spriteKey, x, y);

    // Bot AI state
    this.turnTrend = 1;
    this.turnChangeTimer = 0;
    this.turnChangeDelay = 60;

    // Randomize initial direction
    this.turnTrend = Math.random() < 0.5 ? -1 : 1;
    this.head.rotation = Math.random() * Math.PI * 2;

    // Optional: give bots a unique color tint
    const botColors = [0x00ff00, 0x00ffff, 0xff00ff, 0xffff00, 0xff8800, 0x88ff00];
    const tint = Phaser.Utils.Array.GetRandom(botColors);
    this.sections.forEach(sec => sec.tint = tint);
  }

  update(time, delta) {
    if (!this.head?.body || this.destroyed) return;

    // AI: Random smooth turning
    this.turnChangeTimer--;

    if (this.turnChangeTimer <= 0) {
      // Occasionally change direction
      if (Math.random() < 0.3) {
        this.turnTrend *= -1;
      }

      this.turnChangeDelay = Phaser.Math.Between(60, 300);
      this.turnChangeTimer = this.turnChangeDelay;
    }

    // Apply smooth rotation
    const turnSpeed = this.rotationSpeed * 0.017 * (delta / 16.67);
    this.head.rotation += this.turnTrend * turnSpeed;

    // Avoid edges
    const margin = 150;
    const bounds = this.scene.matter.world.bounds;

    if (this.head.x < margin) {
      this.head.rotation = Phaser.Math.Angle.RotateTo(this.head.rotation, 0, 0.05);
    } else if (this.head.x > bounds.max.x - margin) {
      this.head.rotation = Phaser.Math.Angle.RotateTo(this.head.rotation, Math.PI, 0.05);
    }

    if (this.head.y < margin) {
      this.head.rotation = Phaser.Math.Angle.RotateTo(this.head.rotation, Math.PI / 2, 0.05);
    } else if (this.head.y > bounds.max.y - margin) {
      this.head.rotation = Phaser.Math.Angle.RotateTo(this.head.rotation, -Math.PI / 2, 0.05);
    }

    // Call parent update
    super.update(time, delta);
  }
}