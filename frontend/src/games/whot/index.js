import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

export class WhotGame {
  constructor(containerId) {
    this.containerId = containerId;
    this.game = null;
  }

  launch(config = {}) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container ${this.containerId} not found`);
      return;
    }

    const gameConfig = {
      type: Phaser.AUTO,
      parent: this.containerId,
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
      backgroundColor: '#0a4d2e',
      scene: [GameScene, GameOverScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      }
    };

    this.game = new Phaser.Game(gameConfig);

    // Pass config to first scene
    this.game.scene.start('GameScene', {
      playerName: config.nickname || 'You',
      difficulty: config.difficulty || 'medium'
    });

    // Listen for game events
    this.game.events.on('gameOver', (score, isWinner) => {
      console.log('Whot game over:', { score, isWinner });
    });

    this.game.events.on('exitGame', () => {
      console.log('Exit game requested');
      this.stop();
    });
  }

  stop() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  stopMusic() {
    // Placeholder for music control
    if (this.game && this.game.sound) {
      this.game.sound.stopAll();
    }
  }
}
