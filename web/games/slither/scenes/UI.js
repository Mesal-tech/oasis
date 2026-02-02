// src/games/slither/scenes/UI.js
import * as Phaser from 'phaser';

export default class UI {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    // Responsive positioning
    const { width, height } = scene.scale;

    this.leaderboardWidth = 220;
    this.minimapSize = 160;

    // Create UI Elements
    this.createLeaderboard(width, 10);
    this.createMinimap(width, height);
    this.createStats(0, height);
    this.createCompass(width, height); // Optional polish
  }

  createLeaderboard(screenWidth, y) {
    const x = screenWidth - this.leaderboardWidth - 20;

    // Background Panel
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(0, 0, this.leaderboardWidth, 260, 10);

    this.leaderboardContainer = this.scene.add.container(x, y);
    this.leaderboardContainer.add(bg);
    this.container.add(this.leaderboardContainer);

    // Title
    const title = this.scene.add.text(
      this.leaderboardWidth / 2, 15,
      'LEADERBOARD',
      {
        fontSize: '14px',
        fontFamily: '"Segoe UI", sans-serif',
        fontStyle: 'bold',
        color: '#aaaaaa',
      }
    ).setOrigin(0.5);
    this.leaderboardContainer.add(title);

    // Entries
    this.leaderboardEntries = [];
    for (let i = 0; i < 10; i++) {
      const entryText = this.scene.add.text(
        15, 45 + (i * 20),
        '',
        {
          fontSize: '13px',
          fontFamily: '"Segoe UI", sans-serif',
          fontStyle: 'bold',
          color: '#ffffff'
        }
      );
      this.leaderboardEntries.push(entryText);
      this.leaderboardContainer.add(entryText);
    }
  }

  createMinimap(screenWidth, screenHeight) {
    const margin = 20;
    const x = screenWidth - this.minimapSize - margin;
    const y = screenHeight - this.minimapSize - margin;

    this.minimapContainer = this.scene.add.container(x, y);
    this.container.add(this.minimapContainer);

    // Background
    const bg = this.scene.add.circle(
      this.minimapSize / 2, this.minimapSize / 2,
      this.minimapSize / 2,
      0x000000, 0.4
    );
    this.minimapContainer.add(bg);

    // Border
    const border = this.scene.add.circle(
      this.minimapSize / 2, this.minimapSize / 2,
      this.minimapSize / 2
    );
    border.setStrokeStyle(2, 0xffffff, 0.2);
    this.minimapContainer.add(border);

    // Store properties
    this.minimapRadius = (this.minimapSize / 2) - 4;
    this.minimapScale = this.minimapRadius / this.scene.arenaRadius;

    // Dots Container
    this.minimapDots = this.scene.add.graphics();
    this.minimapContainer.add(this.minimapDots);

    // Player Indicator (Pulsing ring)
    this.playerIndicator = this.scene.add.graphics();
    this.minimapContainer.add(this.playerIndicator);

    // Label
    /*const label = this.scene.add.text(this.minimapSize/2, -15, 'MAP', {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'sans-serif'
    }).setOrigin(0.5);
    this.minimapContainer.add(label);*/
  }

  createStats(x, screenHeight) {
    const margin = 20;
    this.statsContainer = this.scene.add.container(margin, screenHeight - 60);
    this.container.add(this.statsContainer);

    // Length Display
    this.lengthText = this.scene.add.text(0, 0, 'Length: 0', {
      fontSize: '24px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.statsContainer.add(this.lengthText);

    // Rank Display
    this.rankText = this.scene.add.text(0, 30, 'Rank: -', {
      fontSize: '16px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.statsContainer.add(this.rankText);
  }

  createCompass(w, h) {
    // Maybe just a simple coordinate text debug in dev?
    // Skipping for now to keep it clean.
  }

  update() {
    this.updateLeaderboard();
    this.updateMinimap();
    this.updateStats();
  }

  updateLeaderboard() {
    if (!this.scene.snakes) return;

    const sorted = [...this.scene.snakes]
      .filter(s => !s.isDead)
      .sort((a, b) => b.getLength() - a.getLength())
      .slice(0, 10);

    this.leaderboardEntries.forEach((entry, i) => {
      if (i < sorted.length) {
        const snake = sorted[i];
        const isPlayer = snake.isPlayer;
        const name = snake.nickname || (isPlayer ? 'You' : `Bot ${snake.id || Math.floor(Math.random() * 1000)}`);
        const len = Math.floor(snake.getLength());

        // Formatting
        const maxLen = 12;
        const trunkName = name.length > maxLen ? name.substring(0, maxLen) + '...' : name;

        entry.setText(`#${i + 1}  ${trunkName}  (${len})`);

        if (isPlayer) {
          entry.setColor('#00ff88');
          entry.setStroke('#004400', 2);
        } else {
          entry.setColor('#ffffff');
          entry.setStroke(null);
          if (i === 0) entry.setColor('#ffd700'); // Gold for #1
        }
        entry.setVisible(true);
      } else {
        entry.setVisible(false);
      }
    });
  }

  updateMinimap() {
    const g = this.minimapDots;
    g.clear();

    const cx = this.minimapSize / 2;
    const cy = this.minimapSize / 2;

    // Draw all snakes
    this.scene.snakes.forEach(snake => {
      if (snake.isDead) return;

      const head = snake.segments[0];
      // Rel to arena center
      const rx = head.x - this.scene.arenaCenterX;
      const ry = head.y - this.scene.arenaCenterY;

      const mx = cx + rx * this.minimapScale;
      const my = cy + ry * this.minimapScale;

      // Check bounds
      const d = Math.hypot(mx - cx, my - cy);
      if (d > this.minimapRadius) return;

      if (snake.isPlayer) {
        // Player is drawn specially
        this.playerIndicator.clear();
        this.playerIndicator.lineStyle(2, 0xffffff, 0.8);
        this.playerIndicator.strokeCircle(mx, my, 4);

        g.fillStyle(0x00ff88, 1);
        g.fillCircle(mx, my, 2.5);
      } else {
        // Bots
        g.fillStyle(0xaaaaaa, 0.6);
        g.fillCircle(mx, my, 1.5);
      }
    });
  }

  updateStats() {
    if (!this.scene.player || this.scene.player.isDead) return;

    const len = Math.floor(this.scene.player.getLength());
    this.lengthText.setText(`Length: ${len}`);

    // Calculate rank
    const rank = this.scene.snakes.filter(s => !s.isDead && s.getLength() > len).length + 1;
    this.rankText.setText(`Your Rank: ${rank} of ${this.scene.snakes.filter(s => !s.isDead).length}`);
  }

  destroy() {
    this.container.destroy();
  }
}