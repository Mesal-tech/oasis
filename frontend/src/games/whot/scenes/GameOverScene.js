import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.winner = data.winner;
    this.playerScore = data.playerScore || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0);

    const isPlayerWinner = this.winner && !this.winner.isAI;

    // Title
    const title = isPlayerWinner ? 'YOU WIN!' : 'GAME OVER';
    const titleColor = isPlayerWinner ? '#00ff00' : '#ff4444';

    this.add.text(width / 2, height / 2 - 150, title, {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Winner name
    if (this.winner) {
      this.add.text(width / 2, height / 2 - 70, `Winner: ${this.winner.name}`, {
        fontSize: '32px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
    }

    // Score
    this.add.text(width / 2, height / 2, `Your Score: ${this.playerScore}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Emit game over event to parent
    this.game.events.emit('gameOver', this.playerScore, isPlayerWinner);

    // Buttons
    const playAgainBtn = this.add.text(width / 2, height / 2 + 80, 'PLAY AGAIN', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      backgroundColor: '#00aa00',
      padding: { x: 30, y: 15 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GameScene', {
          playerName: this.winner && !this.winner.isAI ? this.winner.name : 'You',
          difficulty: 'medium'
        });
      })
      .on('pointerover', function () { this.setScale(1.1); })
      .on('pointerout', function () { this.setScale(1); });

    const menuBtn = this.add.text(width / 2, height / 2 + 150, 'BACK TO LOBBY', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 25, y: 12 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // Signal to exit game
        this.game.events.emit('exitGame');
      })
      .on('pointerover', function () { this.setScale(1.1); })
      .on('pointerout', function () { this.setScale(1); });

    // Add some celebratory particles if player won
    if (isPlayerWinner) {
      this.createConfetti();
    }
  }

  createConfetti() {
    const { width, height } = this.cameras.main;

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-100, 0);
      const color = colors[Phaser.Math.Between(0, colors.length - 1)];

      const particle = this.add.rectangle(x, y, 10, 10, color);

      this.tweens.add({
        targets: particle,
        y: height + 100,
        x: x + Phaser.Math.Between(-100, 100),
        rotation: Phaser.Math.Between(0, 360),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Cubic.easeIn'
      });
    }
  }
}
