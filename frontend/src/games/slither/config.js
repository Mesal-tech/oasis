// ===== frontend/src/games/slither/config.js =====
import Phaser from 'phaser';

export const SlitherConfig = {
  getConfig(containerId) {
    return {
      type: Phaser.AUTO,
      parent: containerId,

      width: window.innerWidth,
      height: window.innerHeight - 80,

      backgroundColor: '#0a0a14',

      physics: {
        default: 'matter',
        matter: {
          gravity: { y: 0 },
          debug: false
        }
      },

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
  }
};
