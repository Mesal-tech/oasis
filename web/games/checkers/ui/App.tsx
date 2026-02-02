import React, { useState, useEffect } from 'react';
import { GameButton } from './GameButton';
import { GameOverModal } from './GameOverModal';
import { MenuModal } from './MenuModal';
import { FaLightbulb } from 'react-icons/fa';
import { TfiMenuAlt } from "react-icons/tfi";
import { GrRefresh } from "react-icons/gr";
import * as Phaser from 'phaser';
import { PhaserGame } from '../components/PhaserGame';

interface AppProps {
    gameOptions?: any;
}

export const App: React.FC<AppProps> = ({ gameOptions }) => {
    const [game, setGame] = useState<Phaser.Game | null>(null);
    const [showGameOver, setShowGameOver] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [gameResult, setGameResult] = useState({
        isWinner: false,
        isDraw: false,
        score: 0,
        redPieces: 0,
        bluePieces: 0,
        earnedXP: 0,
        earnedTokens: 0
    });

    useEffect(() => {
        if (!game) return;

        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
            // Listen for game over event
            gameScene.events.on('gameOver', (result: any) => {
                console.log('Game over event received:', result);
                setGameResult({
                    isWinner: result.isWinner,
                    isDraw: result.isDraw || false,
                    score: result.score,
                    redPieces: result.redPieces,
                    bluePieces: result.bluePieces,
                    earnedXP: 0, // Will be updated after backend call
                    earnedTokens: 0
                });

                // Save match result to backend
                saveMatchResult(result.score, result.isWinner);

                // Show modal after a short delay
                setTimeout(() => {
                    setShowGameOver(true);
                }, 500);
            });
        }

        return () => {
            if (gameScene) {
                gameScene.events.off('gameOver');
            }
        };
    }, [game]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showMenu) {
                    setShowMenu(false);
                } else if (!showGameOver) {
                    setShowMenu(true);
                }
            } else if (e.key.toLowerCase() === 'h' && !showMenu && !showGameOver) {
                handleHint();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showMenu, showGameOver]);

    const saveMatchResult = async (score: number, isWinner: boolean) => {
        try {
            // Get player and game data from parent context if available
            // For now, we'll emit an event that can be caught by GameScreen
            window.dispatchEvent(new CustomEvent('checkersGameOver', {
                detail: { score, isWinner }
            }));
        } catch (error) {
            console.error('Failed to save match result:', error);
        }
    };

    const handleRestart = () => {
        if (!game) return;
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
            gameScene.events.emit('restart');
        }
        setShowGameOver(false);
        setShowMenu(false);
    };

    const handleMenu = () => {
        setShowMenu(true);
    };

    const handleHint = () => {
        if (!game || showMenu || showGameOver) return;
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
            gameScene.events.emit('showHint');
        }
    };

    const handlePlayAgain = () => {
        handleRestart();
    };

    const handleBackToLobby = () => {
        // Emit event to be caught by GameScreen
        window.dispatchEvent(new CustomEvent('checkersBackToLobby'));
    };

    const handleResumeGame = () => {
        setShowMenu(false);
    };

    const handleToggleSound = () => {
        setSoundEnabled(!soundEnabled);
        // Here you can also emit an event to the game scene to mute/unmute sounds
        if (game) {
            const gameScene = game.scene.getScene('GameScene');
            if (gameScene) {
                // Toggle sound in the game
                game.sound.mute = !soundEnabled;
            }
        }
    };

    return (
        <div className="checkers-app">
            <div id="app-wrapper" className="relative w-full h-full" style={{ position: 'relative', width: '100%', height: '100%' }}>
                <PhaserGame onGameCreated={setGame} gameOptions={gameOptions} />

                <div className="ui-overlay absolute top-0 left-0 w-full h-full pointer-events-none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {/* Top Right */}
                    <div className="ui-corner top-right absolute" style={{ padding: '10px', pointerEvents: 'auto', position: 'absolute', top: 0, right: 0 }}>
                        <GameButton icon={<TfiMenuAlt />} onClick={handleMenu} />
                    </div>

                    {/* Bottom Left - Hide Restart in Multiplayer */}
                    {gameOptions?.gameMode !== 'multiplayer' && (
                        <div className="ui-corner bottom-left absolute" style={{ padding: '10px', pointerEvents: 'auto', position: 'absolute', bottom: 0, left: 0 }}>
                            <GameButton icon={<GrRefresh />} onClick={handleRestart} />
                        </div>
                    )}

                    {/* Bottom Right - Hide Hint in Multiplayer */}
                    {gameOptions?.gameMode !== 'multiplayer' && (
                        <div className="ui-corner bottom-right absolute" style={{ padding: '10px', pointerEvents: 'auto', position: 'absolute', bottom: 0, right: 0 }}>
                            <GameButton icon={<FaLightbulb />} onClick={handleHint} color="#00aa00" />
                        </div>
                    )}
                </div>

                {/* Menu Modal */}
                {showMenu && (
                    <MenuModal
                        onResume={handleResumeGame}
                        onRestart={handleRestart}
                        onBackToLobby={handleBackToLobby}
                        soundEnabled={soundEnabled}
                        onToggleSound={handleToggleSound}
                    />
                )}

                {/* Game Over Modal */}
                {showGameOver && (
                    <GameOverModal
                        isWinner={gameResult.isWinner}
                        isDraw={gameResult.isDraw}
                        score={gameResult.score}
                        redPieces={gameResult.redPieces}
                        bluePieces={gameResult.bluePieces}
                        earnedXP={gameResult.earnedXP}
                        earnedTokens={gameResult.earnedTokens}
                        onPlayAgain={handlePlayAgain}
                        onBackToLobby={handleBackToLobby}
                    />
                )}
            </div>
        </div>
    );
};
