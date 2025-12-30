import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.path = '/assets/';
        this.load.image('bg_wood', 'bg_wood.png');
        // this.load.image('piece_red', 'piece_red.png'); // Replacing with generated high-quality sprites
        // this.load.image('piece_cyan', 'piece_cyan.png'); 
        this.load.image('btn_menu', 'btn_menu.png');
        this.load.image('btn_settings', 'btn_settings.png');
        this.load.image('btn_restart', 'btn_restart.png');
        this.load.image('base_game', 'base_game.png'); // Board Background
        // this.load.image('btn_hint', 'btn_hint.png'); // Missing, will fallback or use placeholder

        // Highlight
        const h = this.make.graphics({ x: 0, y: 0 });
        h.lineStyle(4, 0x00ff00);
        h.strokeRect(0, 0, 80, 80);
        h.generateTexture('highlight', 80, 80);

        // Valid Move Highlight
        const vm = this.make.graphics({ x: 0, y: 0 });
        vm.fillStyle(0x00ff00, 0.5);
        vm.fillCircle(40, 40, 15);
        vm.generateTexture('valid_move', 80, 80);

        // King marker (crown/star)
        const k = this.make.graphics({ x: 0, y: 0 });
        k.lineStyle(4, 0xffff00, 0.8);
        k.strokeCircle(40, 40, 20);
        k.generateTexture('king_overlay', 80, 80);

        // Generate high-quality puck sprites
        const generatePuck = (key: string, color: number, darkColor: number) => {
            const g = this.make.graphics({ x: 0, y: 0 });
            
            // Shadow
            g.fillStyle(0x000000, 0.3);
            g.fillCircle(40, 44, 34);

            // Rim
            g.fillStyle(darkColor);
            g.fillCircle(40, 40, 34);

            // Face
            g.fillStyle(color);
            g.fillCircle(40, 40, 31);

            // Inner Rings
            g.lineStyle(2, darkColor, 0.5);
            g.strokeCircle(40, 40, 24);
            g.strokeCircle(40, 40, 15);

            // Top Highlight (shine)
            g.fillStyle(0xffffff, 0.2);
            g.fillEllipse(40, 25, 20, 10);

            g.generateTexture(key, 80, 80);
        };

        generatePuck('puck_red', 0xFF5252, 0xC62828);
        generatePuck('puck_blue', 0x03A9F4, 0x0277BD);

        // Generate simple textures for fallbacks if needed, or for tile backgrounds
        this.make.graphics({ x: 0, y: 0 })
            .fillStyle(0xffffff) // White tile
            .fillRect(0, 0, 80, 80)
            .generateTexture('tile_light', 80, 80);

        this.make.graphics({ x: 0, y: 0 })
            .fillStyle(0x404040) // Dark Grey tile
            .fillRect(0, 0, 80, 80)
            .generateTexture('tile_dark', 80, 80);
    }

    create() {
        this.scene.start('GameScene');

    }
}
