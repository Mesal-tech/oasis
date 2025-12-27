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

  update(snakeScale = 0.3, targetX = null, targetY = null) {
    if (!this.head || this.head.destroyed) return;

    let angle = 0;
    let lookStrength = 0;

    if (targetX !== null && targetY !== null) {
      const dx = targetX - this.head.x;
      const dy = targetY - this.head.y;
      angle = Math.atan2(dy, dx);
      lookStrength = Math.min(Math.hypot(dx, dy) / 120, 1);
    } else {
      // Fallback if no target provided (e.g. look straight ahead or default)
      angle = this.head.rotation || 0;
      lookStrength = 0.5;
    }

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

    // Compute rotation-based offsets for eyes relative to head center
    // The head image is rotated by snake.angle. We need to position eyes relative to that rotation.
    // Actually, in the current simple implementation, 'eyeVerticalOffset' assumes 0 rotation?
    // Looking at previous code: 
    // this.leftEye.setPosition(this.head.x - eyeSpacing, this.head.y - eyeVerticalOffset);
    // It didn't account for head rotation! 
    // Wait, the previous code just set x +/- spacing and y - offset.
    // If the snake rotates, the eyes would detach visually if they don't rotate with it.
    // Does the head image rotate?
    // Snake.js line 210: this.angle = ...
    // Snake.js line 214-216 move head.
    // Does it setHead rotation? 
    // I don't see head.setRotation(this.angle) in Snake.js update().
    // Ah, Snake.js uses separate segments. Maybe they stay circles and don't rotate?
    // If they are circles, then "up" is always absolute up.
    // But Slither snakes turn their whole head.

    // Let's stick to the previous logic but just fix the look direction for now.
    // The previous logic:
    // this.leftEye.setPosition(this.head.x - eyeSpacing, this.head.y - eyeVerticalOffset);
    // This implies eyes are always at top-left and top-right of the segment sprite, assuming sprite is always "up".
    // If the code works for the player currently, I shouldn't break the positioning logic, just the pupil movement.

    // Position white eyeballs on the head (keeping original logic)
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