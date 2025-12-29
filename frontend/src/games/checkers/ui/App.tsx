import React, { useState } from 'react';
import { GameButton } from './GameButton';
import { FaLightbulb } from 'react-icons/fa';
import { TfiMenuAlt } from "react-icons/tfi";
import { GrRefresh } from "react-icons/gr";
import Phaser from 'phaser';
import { PhaserGame } from '../components/PhaserGame';

export const App: React.FC = () => {
    const [game, setGame] = useState<Phaser.Game | null>(null);

    const handleRestart = () => {
        if (!game) return;
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
            gameScene.events.emit('restart');
        }
    };

    const handleMenu = () => {
        console.log("Menu clicked");
    };

    const handleHint = () => {
        console.log("Hint clicked");
    };

    return (
        <div className="checkers-app">
            <div id="app-wrapper" className="relative w-[100vmin] h-[100vmin] max-w-[800px] max-h-[800px]" style={{ position: 'relative', width: '100vmin', height: '100vmin', maxWidth: '800px', maxHeight: '800px' }}>
                <PhaserGame onGameCreated={setGame} />

                <div className="ui-overlay absolute top-0 left-0 w-full h-full pointer-events-none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {/* Top Right */}
                    <div className="ui-corner top-right absolute" style={{ padding: '10px', pointerEvents: 'auto', position: 'absolute', top: 0, right: 0 }}>
                        <GameButton icon={<TfiMenuAlt />} onClick={handleMenu} />
                    </div>

                    {/* Bottom Left */}
                    <div className="ui-corner bottom-left absolute" style={{ padding: '10px', pointerEvents: 'auto', position: 'absolute', bottom: 0, left: 0 }}>
                        <GameButton icon={<GrRefresh />} onClick={handleRestart} />
                    </div>

                    {/* Bottom Right */}
                    <div className="ui-corner bottom-right absolute" style={{ padding: '10px', pointerEvents: 'auto', position: 'absolute', bottom: 0, right: 0 }}>
                        <GameButton icon={<FaLightbulb />} onClick={handleHint} color="#00aa00" />
                    </div>
                </div>
            </div>
        </div>
    );
};
