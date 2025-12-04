// src/scenes/Preloader.js
import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload() {
    const { width, height } = this.scale;

    // Loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00d4ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Create particle textures procedurally
    this.createParticleTextures();

    // Create pellet textures
    this.createPelletTextures();
  }

  createParticleTextures() {
    // Glow particle
    const glowTexture = this.textures.createCanvas('particle-glow', 20, 20);
    const ctx = glowTexture.getContext();
    const gradient = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 1)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 20, 20);
    glowTexture.refresh();
  }

  createPelletTextures() {
    // Regular pellet
    const pelletTexture = this.textures.createCanvas('pellet', 14, 14);
    let ctx = pelletTexture.getContext();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(7, 7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    pelletTexture.refresh();

    // Power pellet
    const powerTexture = this.textures.createCanvas('pellet-power', 22, 22);
    ctx = powerTexture.getContext();

    const gradient = ctx.createRadialGradient(11, 11, 0, 11, 11, 11);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(1, '#8800ff');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(11, 11, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    powerTexture.refresh();
  }

  create() {
    this.scene.start('Game');
  }
}