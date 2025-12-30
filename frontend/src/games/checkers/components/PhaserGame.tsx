import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from '../scenes/BootScene';
import GameScene from '../scenes/GameScene';

interface PhaserGameProps {
    onGameCreated?: (game: Phaser.Game) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onGameCreated }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameContainerRef.current) return;

        // Prevent creating two games in strict mode
        if (gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameContainerRef.current,
            backgroundColor: '#2d2d2d',
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            dom: {
                createContainer: true
            },
            scene: [BootScene, GameScene]
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        if (onGameCreated) {
            onGameCreated(game);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this only runs once

    return (
        <div
            id="game-container"
            ref={gameContainerRef}
            style={{ width: '100%', height: '100%' }}
        />
    );
};
