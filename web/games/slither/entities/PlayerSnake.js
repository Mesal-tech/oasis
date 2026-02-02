// PlayerSnake.js
import Snake from './Snake.js';

export class PlayerSnake extends Snake {
  constructor(scene, spriteKey, x, y) {
    super(scene, spriteKey, x, y);

    // Keyboard controls
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Boost handling
    this.spaceKey.on('down', () => this.startBoost());
    this.spaceKey.on('up', () => this.endBoost());

    // THIS NOW WORKS — method exists on Snake parent
    this.addDestroyedCallback(() => {
      this.spaceKey.off('down');
      this.spaceKey.off('up');
    }, this);
  }

  startBoost() {
    this.speed = this.fastSpeed;
    if (this.shadow) this.shadow.isLightingUp = true;
  }

  endBoost() {
    this.speed = this.slowSpeed;
    if (this.shadow) this.shadow.isLightingUp = false;
  }

  update(time, delta) {
    if (!this.head?.body || this.destroyed) return;

    const pointer = this.scene.input.activePointer;
    const worldPoint = { x: pointer.worldX, y: pointer.worldY };

    const headX = this.head.x;
    const headY = this.head.y;
    const targetX = worldPoint.x;
    const targetY = worldPoint.y;

    let targetAngle = Phaser.Math.Angle.Between(headX, headY, targetX, targetY);
    targetAngle = Phaser.Math.Wrap(targetAngle, -Math.PI, Math.PI);

    let currentAngle = this.head.rotation;
    let deltaAngle = targetAngle - currentAngle;
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

    const turnSpeed = this.rotationSpeed * 0.017;

    let rotation = 0;

    if (this.cursors.left.isDown) {
      rotation = -turnSpeed;
    } else if (this.cursors.right.isDown) {
      rotation = turnSpeed;
    } else {
      if (Math.abs(deltaAngle) > 0.01) {
        rotation = Phaser.Math.Clamp(deltaAngle, -turnSpeed, turnSpeed);
      }
    }

    this.head.rotation += rotation;

    super.update(time, delta);
  }
}