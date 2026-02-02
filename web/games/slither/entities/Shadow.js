// src/entities/Shadow.js
export default class Shadow {
  constructor(scene, segments) {
    this.scene = scene;
    this.segments = segments;
    this.shadows = [];
    this.isLightingUp = false;
    this.step = 0;

    // Create shadow for each segment
    segments.forEach(seg => {
      const shadow = scene.add.circle(seg.x, seg.y + 8, seg.displayWidth / 2 + 4, 0x000000);
      shadow.setAlpha(0.4);
      this.shadows.push(shadow);
    });
  }

  add(x, y) {
    const shadow = this.scene.add.circle(x, y + 8, 18, 0x000000);
    shadow.setAlpha(0.4);
    this.shadows.push(shadow);
  }

  update() {
    this.shadows.forEach((shadow, i) => {
      if (!this.segments[i]) return;
      shadow.x = this.segments[i].x;
      shadow.y = this.segments[i].y + 8;
      shadow.scale = this.segments[i].scale * 1.2;

      if (this.isLightingUp) {
        const pattern = (i + this.step) % 3;
        shadow.setFillStyle(pattern === 0 ? 0xff0000 : 0xff4444);
        shadow.setAlpha(0.7);
        this.step++;
      } else {
        shadow.setFillStyle(0x000000);
        shadow.setAlpha(0.3 + i * 0.01);
      }
    });
  }

  destroy() {
    this.shadows.forEach(s => s?.destroy());
  }
}