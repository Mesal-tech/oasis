// src/games/slither/scenes/Boot.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    this.scene.start('Preloader');
  }
}