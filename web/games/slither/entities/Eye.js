// Eye.js - FIXED (Proper world space positioning)
import * as Phaser from 'phaser';

export default class Eye {
  constructor(scene, head, scale = 1, offset = [15, -10]) {
    this.scene = scene;
    this.head = head;
    this.scale = scale;
    this.offset = offset;

    // ✅ FIXED: Create sprites directly in world space (no container)
    this.whiteCircle = scene.add.sprite(0, 0, 'eye-white');
    this.whiteCircle.setScale(scale);
    this.whiteCircle.setDepth(20);

    this.blackCircle = scene.add.sprite(0, 0, 'eye-black');
    this.blackCircle.setScale(scale * 0.85);
    this.blackCircle.setDepth(21);

    // === Matter Physics ===
    scene.matter.add.gameObject(this.whiteCircle, {
      shape: 'circle',
      radius: this.whiteCircle.width * 0.5 * scale,
      isStatic: true,
      label: 'eye_white'
    });

    scene.matter.add.gameObject(this.blackCircle, {
      shape: 'circle',
      radius: this.blackCircle.width * 0.5 * scale * 0.85,
      mass: 0.01,
      frictionAir: 0.2,
      label: 'eye_black'
    });

    // Lock white eye to head
    this.lockConstraint = scene.matter.add.constraint(
      head.body,
      this.whiteCircle.body,
      0,
      1.0,
      {
        pointA: { x: offset[0], y: offset[1] },
        pointB: { x: 0, y: 0 }
      }
    );

    // Keep pupil inside white eye (soft constraint)
    this.pupilConstraint = scene.matter.add.constraint(
      this.whiteCircle.body,
      this.blackCircle.body,
      this.whiteCircle.width * 0.25 * scale,
      0.6,
      { damping: 0.3 }
    );

    this.maxPupilDistance = this.whiteCircle.width * 0.25 * scale;
  }

  update() {
    if (!this.blackCircle?.body || !this.head) return;

    // ✅ FIXED: Sync sprite positions with physics bodies
    this.whiteCircle.x = this.whiteCircle.body.position.x;
    this.whiteCircle.y = this.whiteCircle.body.position.y;
    this.blackCircle.x = this.blackCircle.body.position.x;
    this.blackCircle.y = this.blackCircle.body.position.y;

    const pointer = this.scene.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.scene.cameras.main);

    const headX = this.head.x;
    const headY = this.head.y;
    const targetX = worldPoint.x;
    const targetY = worldPoint.y;

    const angle = Math.atan2(targetY - headY, targetX - headX);
    const targetOffsetX = Math.cos(angle) * this.maxPupilDistance * 0.9;
    const targetOffsetY = Math.sin(angle) * this.maxPupilDistance * 0.9;

    const currentOffsetX = this.blackCircle.x - this.whiteCircle.x;
    const currentOffsetY = this.blackCircle.y - this.whiteCircle.y;

    const fx = (targetOffsetX - currentOffsetX) * 0.012;
    const fy = (targetOffsetY - currentOffsetY) * 0.012;

    this.scene.matter.body.applyForce(this.blackCircle.body, this.blackCircle.body.position, {
      x: fx,
      y: fy
    });
  }

  setScale(scale) {
    this.scale = scale;
    this.whiteCircle.setScale(scale);
    this.blackCircle.setScale(scale * 0.85);

    // Update physics bodies by recreating them
    const whitePos = { x: this.whiteCircle.x, y: this.whiteCircle.y };
    const blackPos = { x: this.blackCircle.x, y: this.blackCircle.y };

    // Remove old constraints
    if (this.lockConstraint) {
      this.scene.matter.world.removeConstraint(this.lockConstraint);
    }
    if (this.pupilConstraint) {
      this.scene.matter.world.removeConstraint(this.pupilConstraint);
    }

    // Remove old bodies
    this.scene.matter.world.remove(this.whiteCircle.body);
    this.scene.matter.world.remove(this.blackCircle.body);

    // Recreate bodies with new scale
    this.scene.matter.add.gameObject(this.whiteCircle, {
      shape: 'circle',
      radius: this.whiteCircle.width * 0.5 * scale,
      isStatic: true,
      label: 'eye_white'
    });

    this.scene.matter.add.gameObject(this.blackCircle, {
      shape: 'circle',
      radius: this.blackCircle.width * 0.5 * scale * 0.85,
      mass: 0.01,
      frictionAir: 0.2,
      label: 'eye_black'
    });

    // Restore positions
    this.whiteCircle.x = whitePos.x;
    this.whiteCircle.y = whitePos.y;
    this.blackCircle.x = blackPos.x;
    this.blackCircle.y = blackPos.y;

    // Recreate constraints with updated offset
    this.lockConstraint = this.scene.matter.add.constraint(
      this.head.body,
      this.whiteCircle.body,
      0,
      1.0,
      {
        pointA: { x: this.offset[0] * scale, y: this.offset[1] * scale },
        pointB: { x: 0, y: 0 }
      }
    );

    this.maxPupilDistance = this.whiteCircle.width * 0.25 * scale;

    this.pupilConstraint = this.scene.matter.add.constraint(
      this.whiteCircle.body,
      this.blackCircle.body,
      this.maxPupilDistance,
      0.6,
      { damping: 0.3 }
    );
  }

  destroy() {
    if (this.lockConstraint) {
      this.scene.matter.world.removeConstraint(this.lockConstraint);
    }
    if (this.pupilConstraint) {
      this.scene.matter.world.removeConstraint(this.pupilConstraint);
    }
    this.whiteCircle?.destroy();
    this.blackCircle?.destroy();
  }
}