import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import BootScene from '../scenes/BootScene';
import GameScene from '../scenes/GameScene';

interface PhaserGameProps {
    onGameCreated?: (game: Phaser.Game) => void;
    gameOptions?: any;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onGameCreated, gameOptions }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameContainerRef.current) return;

        // In StrictMode, this effect runs twice. We need to ensure we don't create two games.
        if (gameRef.current) {
            return;
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameContainerRef.current,
            backgroundColor: '#2d2d2d',
            // resolution: window.devicePixelRatio || 1, // Removed as it causes type error and is auto-handled
            pixelArt: false,
            antialias: true,
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

        if (gameOptions) {
            Object.keys(gameOptions).forEach(key => {
                game.registry.set(key, gameOptions[key]);
            });
        }

        return () => {
            // Only destroy if we are unmounting for real? 
            // In React 18 strict mode, unmount happens immediately after mount.
            // If we destroy, the second mount (re-run) needs to be able to create again.
            // But our guard `if (gameRef.current) return` prevents second creation if we DON'T destroy.

            // Correct pattern for React 18:
            // 1. Mount 1 -> Create Game 1
            // 2. Unmount 1 -> Destroy Game 1
            // 3. Mount 2 -> Create Game 2 (fresh)

            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this only runs once per mount cycle (physically)

    return (
        <div
            id="game-container"
            ref={gameContainerRef}
            style={{ width: '100%', height: '100%' }}
        />
    );
};
