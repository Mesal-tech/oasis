// src/entities/EyePair.js
export default class EyePair {
  constructor(scene, head) {
    this.scene = scene;
    this.head = head;

    // Base scales (will be multiplied by snake scale)
    this.baseEyeScale = 0.3;
    this.basePupilScale = 0.4;

    // Base positioning offsets (will be scaled)
    this.baseEyeSpacing = 4;
    this.baseEyeVerticalOffset = 3;

    // === LEFT EYE ===
    this.leftEye = scene.add.image(0, 0, 'eye-white');
    this.leftEye.setScale(this.baseEyeScale);
    this.leftPupil = scene.add.image(0, 0, 'eye-black');
    this.leftPupil.setScale(this.basePupilScale);

    // === RIGHT EYE ===
    this.rightEye = scene.add.image(0, 0, 'eye-white');
    this.rightEye.setScale(this.baseEyeScale);
    this.rightPupil = scene.add.image(0, 0, 'eye-black');
    this.rightPupil.setScale(this.basePupilScale);

    this.pupils = [this.leftPupil, this.rightPupil];
    this.baseMaxOffset = 4.5;

    // Make sure eyes render on top of the snake
    this.leftEye.setDepth(200);
    this.rightEye.setDepth(200);
    this.leftPupil.setDepth(201);
    this.rightPupil.setDepth(201);
  }

  update(snakeScale = 0.3) {
    if (!this.head || this.head.destroyed) return;

    const pointer = this.scene.input.activePointer;
    const worldX = pointer.worldX ?? pointer.x;
    const worldY = pointer.worldY ?? pointer.y;

    const dx = worldX - this.head.x;
    const dy = worldY - this.head.y;
    const angle = Math.atan2(dy, dx);
    const lookStrength = Math.min(Math.hypot(dx, dy) / 120, 1);

    // Scale eye size based on snake size
    const eyeScale = this.baseEyeScale * (snakeScale / 0.3);
    const pupilScale = this.basePupilScale * (snakeScale / 0.3);

    this.leftEye.setScale(eyeScale);
    this.rightEye.setScale(eyeScale);
    this.leftPupil.setScale(pupilScale);
    this.rightPupil.setScale(pupilScale);

    // Scale eye positioning based on snake size
    const eyeSpacing = this.baseEyeSpacing * (snakeScale / 0.3);
    const eyeVerticalOffset = this.baseEyeVerticalOffset * (snakeScale / 0.3);
    const maxOffset = this.baseMaxOffset * (snakeScale / 0.3);

    // Position white eyeballs on the head
    this.leftEye.setPosition(this.head.x - eyeSpacing, this.head.y - eyeVerticalOffset);
    this.rightEye.setPosition(this.head.x + eyeSpacing, this.head.y - eyeVerticalOffset);

    // Move pupils inside the white eyeballs
    this.pupils.forEach((pupil, i) => {
      const offsetX = Math.cos(angle) * maxOffset * lookStrength;
      const offsetY = Math.sin(angle) * maxOffset * lookStrength;

      const baseX = this.head.x + (i === 0 ? -eyeSpacing : eyeSpacing);
      pupil.setPosition(baseX + offsetX, this.head.y - eyeVerticalOffset + offsetY);
    });
  }

  destroy() {
    [this.leftEye, this.leftPupil, this.rightEye, this.rightPupil].forEach(obj => {
      if (obj && typeof obj.destroy === 'function') obj.destroy();
    });
  }
}