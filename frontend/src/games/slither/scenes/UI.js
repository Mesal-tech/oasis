// src/games/slither/scenes/UI.js
import Phaser from 'phaser';

export default class UI {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    // UI dimensions
    this.leaderboardWidth = 200;
    this.leaderboardHeight = 300;
    this.minimapSize = 180;
    this.statsWidth = 180;
    this.statsHeight = 80;

    this.createLeaderboard();
    this.createMinimap();
    this.createPlayerStats();
  }

  createLeaderboard() {
    const padding = 15;
    const x = this.scene.cameras.main.width - this.leaderboardWidth - padding;
    const y = padding;

    // Title
    this.leaderboardTitle = this.scene.add.text(
      x + this.leaderboardWidth / 2, y + 15,
      'LEADERBOARD',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#00ffff',
        align: 'center'
      }
    ).setOrigin(0.5, 0).setScrollFactor(0);
    this.container.add(this.leaderboardTitle);

    // Leaderboard entries
    this.leaderboardEntries = [];
    for (let i = 0; i < 10; i++) {
      const entryY = y + 45 + (i * 24);

      const entry = this.scene.add.text(
        x + 10, entryY,
        '',
        {
          fontSize: '13px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
          align: 'left'
        }
      ).setOrigin(0, 0).setScrollFactor(0);

      this.leaderboardEntries.push(entry);
      this.container.add(entry);
    }
  }

  createMinimap() {
    const padding = 15;
    const x = padding;
    const y = padding;

    // Arena circle (centered, no square background)
    const centerX = x + this.minimapSize / 2;
    const centerY = y + this.minimapSize / 2;
    const arenaRadius = (this.minimapSize / 2) - 10;

    // Circular background
    this.minimapBg = this.scene.add.circle(
      centerX, centerY,
      arenaRadius,
      0x000000, 0.6
    ).setScrollFactor(0);
    this.container.add(this.minimapBg);

    // Circular border
    this.minimapArena = this.scene.add.circle(
      centerX, centerY,
      arenaRadius,
      0x000000, 0
    ).setScrollFactor(0).setStrokeStyle(2, 0x00ff00, 0.8);
    this.container.add(this.minimapArena);

    // Store minimap properties for updating
    this.minimapCenterX = centerX;
    this.minimapCenterY = centerY;
    this.minimapRadius = arenaRadius;
    this.minimapScale = arenaRadius / this.scene.arenaRadius;

    // Container for minimap dots (snakes and player)
    this.minimapDots = this.scene.add.container(0, 0).setScrollFactor(0);
    this.container.add(this.minimapDots);
  }

  createPlayerStats() {
    const padding = 15;
    const x = padding;
    const y = this.scene.cameras.main.height - this.statsHeight - padding;

    // Background
    this.statsBg = this.scene.add.rectangle(
      x, y,
      this.statsWidth, this.statsHeight,
      0x000000, 0.6
    ).setOrigin(0, 0).setScrollFactor(0);
    this.container.add(this.statsBg);

    // Border
    const border = this.scene.add.rectangle(
      x, y,
      this.statsWidth, this.statsHeight,
      0x000000, 0
    ).setOrigin(0, 0).setScrollFactor(0).setStrokeStyle(2, 0xffff00, 0.8);
    this.container.add(border);

    // Length text
    this.lengthText = this.scene.add.text(
      x + 10, y + 15,
      'Length: 0',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    ).setOrigin(0, 0).setScrollFactor(0);
    this.container.add(this.lengthText);

    // Rank text
    this.rankText = this.scene.add.text(
      x + 10, y + 45,
      'Rank: -',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffff00'
      }
    ).setOrigin(0, 0).setScrollFactor(0);
    this.container.add(this.rankText);
  }

  update() {
    this.updateLeaderboard();
    this.updateMinimap();
    this.updatePlayerStats();
  }

  updateLeaderboard() {
    // Sort snakes by length (segment count)
    const sortedSnakes = [...this.scene.snakes]
      .filter(s => !s.isDead)
      .sort((a, b) => b.segments.length - a.segments.length)
      .slice(0, 10);

    // Update each leaderboard entry
    this.leaderboardEntries.forEach((entry, i) => {
      if (i < sortedSnakes.length) {
        const snake = sortedSnakes[i];
        const isPlayer = snake.isPlayer;
        const rank = i + 1;
        const name = isPlayer ? 'YOU' : `Bot ${snake.id || i}`;
        const length = snake.segments.length;

        // Highlight player entry
        const color = isPlayer ? '#00ff00' : '#ffffff';
        entry.setColor(color);
        entry.setText(`${rank}. ${name}: ${length}`);
        entry.setVisible(true);
      } else {
        entry.setVisible(false);
      }
    });
  }

  updateMinimap() {
    // Clear previous dots
    this.minimapDots.removeAll(true);

    // Draw all snakes on minimap
    this.scene.snakes.forEach(snake => {
      if (snake.isDead) return;

      const head = snake.segments[0];

      // Convert world position to minimap position
      const relX = head.x - this.scene.arenaCenterX;
      const relY = head.y - this.scene.arenaCenterY;

      const minimapX = this.minimapCenterX + (relX * this.minimapScale);
      const minimapY = this.minimapCenterY + (relY * this.minimapScale);

      // Draw dot
      const dotSize = snake.isPlayer ? 4 : 2;
      const dotColor = snake.isPlayer ? 0x00ff00 : 0xff0000;

      const dot = this.scene.add.circle(
        minimapX, minimapY,
        dotSize,
        dotColor, 1
      ).setScrollFactor(0);

      this.minimapDots.add(dot);
    });
  }

  updatePlayerStats() {
    if (!this.scene.player || this.scene.player.isDead) {
      this.lengthText.setText('Length: 0');
      this.rankText.setText('Rank: -');
      return;
    }

    // Update length
    const length = this.scene.player.segments.length;
    this.lengthText.setText(`Length: ${length}`);

    // Calculate rank
    const sortedSnakes = [...this.scene.snakes]
      .filter(s => !s.isDead)
      .sort((a, b) => b.segments.length - a.segments.length);

    const rank = sortedSnakes.findIndex(s => s === this.scene.player) + 1;
    this.rankText.setText(`Rank: ${rank}/${sortedSnakes.length}`);
  }

  destroy() {
    this.container.destroy();
  }
}