// src/scenes/UI.js
import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI' });
  }

  create() {
    const { width, height } = this.scale;

    // Score display
    this.scoreText = this.add.text(width / 2, 30, 'Length: 5', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    // Boost indicator
    this.boostText = this.add.text(width / 2, 65, 'SPACE to Boost', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00d4ff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    // Listen to game scene events
    const gameScene = this.scene.get('Game');

    gameScene.events.on('grow', (score) => {
      this.scoreText.setText(`Length: ${score + 5}`);

      // Scale effect
      this.tweens.add({
        targets: this.scoreText,
        scale: { from: 1.2, to: 1 },
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    gameScene.events.on('playerDied', (finalLength) => {
      this.showGameOver(finalLength);
    });
  }

  showGameOver(finalLength) {
    const { width, height } = this.scale;

    // Dark overlay
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7
    ).setScrollFactor(0).setDepth(2000);

    // Game over text
    const gameOverText = this.add.text(
      width / 2,
      height / 2 - 60,
      'GAME OVER',
      {
        fontSize: '64px',
        fontFamily: 'Arial Black',
        color: '#ff4444',
        stroke: '#000000',
        strokeThickness: 8
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    // Final score
    const scoreText = this.add.text(
      width / 2,
      height / 2 + 20,
      `Final Length: ${finalLength}`,
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    // Restart hint
    const restartText = this.add.text(
      width / 2,
      height / 2 + 80,
      'Press ENTER to restart',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00d4ff',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    // Blinking effect
    this.tweens.add({
      targets: restartText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Restart on Enter
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.stop('UI');
      this.scene.stop('Game');
      this.scene.start('Game');
      this.scene.launch('UI');
    });
  }
}