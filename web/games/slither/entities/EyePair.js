// src/entities/EyePair.js
export default class EyePair {
  constructor(scene, head) {
    this.scene = scene;
    this.head = head;

    // Base scales (will be multiplied by snake scale)
    this.baseEyeScale = 0.2;
    this.basePupilScale = 0.3;

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

  update(snakeScale = 0.3, targetX = null, targetY = null, snakeAngle = 0) {
    if (!this.head || this.head.destroyed) return;

    let angle = 0;
    let lookStrength = 0;

    if (targetX !== null && targetY !== null) {
      const dx = targetX - this.head.x;
      const dy = targetY - this.head.y;
      const targetAngle = Math.atan2(dy, dx);

      // Calculate the angle difference between snake's direction and target
      let angleDiff = targetAngle - snakeAngle;

      // Normalize angle difference to -PI to PI range
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      // Limit eye rotation to ±90 degrees (forward hemisphere only)
      const maxEyeAngle = Math.PI / 2; // 90 degrees
      if (Math.abs(angleDiff) > maxEyeAngle) {
        // Clamp to max angle in the appropriate direction
        angleDiff = Math.sign(angleDiff) * maxEyeAngle;
      }

      // Final angle for pupils
      angle = snakeAngle + angleDiff;

      // Calculate look strength based on distance
      lookStrength = Math.min(Math.hypot(dx, dy) / 120, 1);

      // Reduce look strength if looking to the side (makes it more natural)
      lookStrength *= (1 - Math.abs(angleDiff) / Math.PI);
    } else {
      // Fallback if no target provided
      angle = snakeAngle;
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

    // Rotate eye positions with the snake's head direction
    // Eyes are positioned perpendicular to the snake's movement direction
    const cosAngle = Math.cos(snakeAngle);
    const sinAngle = Math.sin(snakeAngle);

    // Calculate perpendicular direction for eye spacing (90 degrees rotated)
    const perpCos = -sinAngle; // Perpendicular to movement
    const perpSin = cosAngle;

    // Forward direction for vertical offset
    const forwardX = cosAngle * eyeVerticalOffset;
    const forwardY = sinAngle * eyeVerticalOffset;

    // Left eye position (to the left of movement direction)
    const leftEyeX = this.head.x + forwardX - perpCos * eyeSpacing;
    const leftEyeY = this.head.y + forwardY - perpSin * eyeSpacing;

    // Right eye position (to the right of movement direction)
    const rightEyeX = this.head.x + forwardX + perpCos * eyeSpacing;
    const rightEyeY = this.head.y + forwardY + perpSin * eyeSpacing;

    // Position white eyeballs on the head (rotated with snake)
    this.leftEye.setPosition(leftEyeX, leftEyeY);
    this.rightEye.setPosition(rightEyeX, rightEyeY);

    // Move pupils inside the white eyeballs
    this.pupils.forEach((pupil, i) => {
      const offsetX = Math.cos(angle) * maxOffset * lookStrength;
      const offsetY = Math.sin(angle) * maxOffset * lookStrength;

      const baseX = i === 0 ? leftEyeX : rightEyeX;
      const baseY = i === 0 ? leftEyeY : rightEyeY;
      pupil.setPosition(baseX + offsetX, baseY + offsetY);
    });
  }

  destroy() {
    [this.leftEye, this.leftPupil, this.rightEye, this.rightPupil].forEach(obj => {
      if (obj && typeof obj.destroy === 'function') obj.destroy();
    });
  }
}