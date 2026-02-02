import * as Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    private turnText!: Phaser.GameObjects.Text;

    updateTurn(player: string) {
        this.turnText.setText(`Turn: ${player}`);
        this.turnText.setColor(player === 'RED' ? '#ff4444' : '#4444ff');
    }

    constructor() {
        super('UIScene');
    }

    create() {
        this.turnText = this.add.text(10, 10, 'Turn: RED', { font: '24px Arial', color: '#ff4444' });

        this.add.text(680, 10, 'Restart Game', {
            font: '20px Arial',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.get('GameScene').events.emit('restart');
            });

        this.scene.get('GameScene').events.on('updateTurn', this.updateTurn, this);
    }
}
