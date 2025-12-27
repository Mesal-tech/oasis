// src/games/slither/index.js
import Phaser from 'phaser';
import { SlitherConfig } from './config.js';
import { BootScene } from './scenes/Boot.js';
import { PreloaderScene } from './scenes/Preloader.js';
import { GameScene } from './scenes/Game.js';

export class SlitherGame {
  constructor(containerId) {
    this.containerId = containerId;
    this.game = null;
  }

  launch(options = {}) {
    const config = SlitherConfig.getConfig(this.containerId);
    config.scene = [BootScene, PreloaderScene, GameScene];
    this.game = new Phaser.Game(config);

    // Pass player options (nickname, skin) to the registry so scenes can access them
    this.game.registry.set('playerData', options);

    return this.game;
  }

  stopMusic() {
    if (this.game && this.game.scene) {
      const gameScene = this.game.scene.getScene('Game');
      if (gameScene && gameScene.sound) {
        const bgm = gameScene.sound.get('bgm');
        if (bgm) {
          bgm.stop();
        }
      }
    }
  }

  stop() {
    if (this.game) {
      this.stopMusic(); // Stop music before destroying
      this.game.destroy(true);
      this.game = null;
    }
  }
}