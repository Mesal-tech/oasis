// src/entities/EyePair.js
export default class EyePair {
  constructor(scene, head) {
    this.scene = scene;
    this.head = head;

    // === LEFT EYE ===
    this.leftEye = scene.add.image(0, 0, 'eye-white');
    this.leftEye.setScale(0.6); // Adjust size as needed
    this.leftPupil = scene.add.image(0, 0, 'eye-black');
    this.leftPupil.setScale(0.4);

    // === RIGHT EYE ===
    this.rightEye = scene.add.image(0, 0, 'eye-white');
    this.rightEye.setScale(0.6);
    this.rightPupil = scene.add.image(0, 0, 'eye-black');
    this.rightPupil.setScale(0.4);

    this.pupils = [this.leftPupil, this.rightPupil];
    this.maxOffset = 4.5;

    // Make sure eyes render on top of the snake
    this.leftEye.setDepth(200);
    this.rightEye.setDepth(200);
    this.leftPupil.setDepth(201);
    this.rightPupil.setDepth(201);
  }

  update() {
    if (!this.head || this.head.destroyed) return;

    const pointer = this.scene.input.activePointer;
    const worldX = pointer.worldX ?? pointer.x;
    const worldY = pointer.worldY ?? pointer.y;

    const dx = worldX - this.head.x;
    const dy = worldY - this.head.y;
    const angle = Math.atan2(dy, dx);
    const lookStrength = Math.min(Math.hypot(dx, dy) / 120, 1);

    // Position white eyeballs on the head
    this.leftEye.setPosition(this.head.x - 8, this.head.y - 6);
    this.rightEye.setPosition(this.head.x + 8, this.head.y - 6);

    // Move pupils inside the white eyeballs
    this.pupils.forEach((pupil, i) => {
      const offsetX = Math.cos(angle) * this.maxOffset * lookStrength;
      const offsetY = Math.sin(angle) * this.maxOffset * lookStrength;

      const baseX = this.head.x + (i === 0 ? -8 : 8);
      pupil.setPosition(baseX + offsetX, this.head.y - 6 + offsetY);
    });
  }

  destroy() {
    [this.leftEye, this.leftPupil, this.rightEye, this.rightPupil].forEach(obj => {
      if (obj && typeof obj.destroy === 'function') obj.destroy();
    });
  }
}