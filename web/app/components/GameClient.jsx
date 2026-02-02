'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '../providers/PlayerProvider';
import GameLobby from './GameLobby';
import SkillSelectorModal from './game-modals/SkillSelectorModal';
import GameModeModal from './game-modals/GameModeModal';
import MatchmakingModal from './game-modals/MatchmakingModal';
import GameOverModal from './game-modals/GameOverModal';
import { GAMES, SLITHER_SKINS } from '../../lib/constants';

// --- Helper for API calls ---
const apiRecordMatch = async (gameId, data) => {
  const res = await fetch(`/api/games/${gameId}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export default function GameClient({ gameId }) {
  const router = useRouter();
  const { player, refreshPlayer } = usePlayer();

  const [gameState, setGameState] = useState('lobby'); // lobby, playing, gameover
  const [gameData, setGameData] = useState(null);
  const [currentMap, setCurrentMap] = useState('classic');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeSkillSlot, setActiveSkillSlot] = useState(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showMatchmakingModal, setShowMatchmakingModal] = useState(false);

  // Slither Specific State
  const [nickname, setNickname] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('neon-blue');

  // React-based games (Whot, Checkers)
  const [ActiveReactGame, setActiveReactGame] = useState(null);
  const [reactGameProps, setReactGameProps] = useState({});

  // Game Result State
  const [gameResult, setGameResult] = useState({
    score: 0,
    length: 0,
    isWinner: false,
    earnedXP: 0,
    earnedTokens: 0
  });

  // Refs
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const gameStartTimeRef = useRef(null);

  useEffect(() => {
    // Find game in constants using the ID
    const data = GAMES.find(g => g.id === gameId);
    if (data) {
        setGameData(data);
    } else {
        // Handle invalid game ID?
        console.warn("Game not found:", gameId);
    }
  }, [gameId]);

  useEffect(() => {
    if (player?.username) {
      setNickname(player.username);
    }
  }, [player]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameInstanceRef.current) {
        if (gameInstanceRef.current.stop) gameInstanceRef.current.stop();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  const saveMatchResult = async (score, isWinner, metadata = {}) => {
    if (!player?.id || !gameData?.id) return;

    try {
      const duration = gameStartTimeRef.current ? Math.floor((Date.now() - gameStartTimeRef.current) / 1000) : 0;
      
      const result = await apiRecordMatch(gameData.id, {
        playerId: player.id,
        score,
        duration,
        metadata: {
          ...metadata,
          isWinner,
          gameMode: 'solo', // or dynamic
          skin: selectedSkin,
          map: currentMap
        }
      });

      if (result.success) {
        setGameResult(prev => ({
          ...prev,
          earnedXP: result.earnedXP || 0,
          earnedTokens: result.earnedTokens || 0
        }));
        if (refreshPlayer) await refreshPlayer();
      }
    } catch (error) {
      console.error('Failed to save match:', error);
    }
  };

  const launchGame = async (mode = 'ai', matchmakingOptions = {}) => {
    setGameState('playing');
    setShowModeModal(false);
    setShowMatchmakingModal(false);
    gameStartTimeRef.current = Date.now();

    // Allow DOM to update first so container exists
    setTimeout(async () => {
      const container = document.getElementById('phaser-game-container');
      if (!container) return;
      container.innerHTML = '';

      try {
        if (gameId === 'slither') {
          // Dynamic import
          const mod = await import('../../games/slither/index.js');
          const Game = mod.SlitherGame;

          const d = document.createElement('div');
          d.id = 'phaser-root';
          d.style.width = '100%';
          d.style.height = '100%';
          container.appendChild(d);

          const game = new Game('phaser-root');
          game.launch({
            nickname: nickname || 'Guest',
            skin: selectedSkin
          });
          gameInstanceRef.current = game;

          // Event Listeners
          setTimeout(() => {
             if (game.game && game.game.events) {
                game.game.events.on('gameOver', async (len) => {
                    if (game.stopMusic) game.stopMusic();
                    const finalScore = len || 0;
                    setGameResult({ score: finalScore, length: finalScore, isWinner: false });
                    setGameState('gameover');
                    await saveMatchResult(finalScore, false, { finalLength: len });
                });
                game.game.events.on('gameWon', async (len) => {
                    if (game.stopMusic) game.stopMusic();
                    const finalScore = len || 0;
                    setGameResult({ score: finalScore, length: finalScore, isWinner: true });
                    setGameState('gameover');
                    await saveMatchResult(finalScore, true, { finalLength: len });
                });
             }
          }, 500);

        } else if (gameId === 'flappy') {
            const mod = await import('../../games/flappy-bird/index.js');
            const Game = mod.FlappyBirdGame;

            const d = document.createElement('div');
            d.id = 'flappy-root';
            d.style.cssText = 'width: 100%; height: 100%; overflow: hidden;';
            container.appendChild(d);

            const game = new Game('flappy-root');
            game.launch();
            gameInstanceRef.current = game;

            setTimeout(() => {
                if (game.game && game.game.events) {
                  game.game.events.on('gameOver', async (score) => {
                    const finalScore = score || 0;
                    setGameResult({ score: finalScore, length: 0, isWinner: false });
                    setGameState('gameover');
                    await saveMatchResult(finalScore, false, { pipesCleared: finalScore });
                  });
                }
            }, 500);


        } else if (gameId === 'checkers') {
             // Checkers
             // Ensure styles are loaded
             // Note: dynamic import of CSS might work if supported by Next.js/Webpack
             try {
                // Dynamically import CSS? Or just rely on global? 
                // Next.js might complain about importing CSS in client component dynamically if not global.
                // Assuming it works for now or we might need to move it to global.
                await import('../../games/checkers/index.css'); 
             } catch (e) { console.warn("CSS import failed", e); }

             const mod = await import('../../games/checkers/ui/App');
             setActiveReactGame(() => mod.App);
             setReactGameProps({
                gameOptions: {
                  gameMode: mode, // 'ai' or 'multiplayer'
                  playerId: player?.id,
                  username: nickname || player?.username,
                  joinType: matchmakingOptions.joinType || 'quickmatch',
                  roomCode: matchmakingOptions.roomCode || null
                }
             });

             // Listeners for React Game
             const handleCheckersGameOver = async (event) => {
                const { score, isWinner } = event.detail;
                 await saveMatchResult(score, isWinner, { gameType: 'checkers' });
             };
             const handleCheckersBackToLobby = () => {
                setGameState('lobby');
                setActiveReactGame(null);
             };

             window.addEventListener('checkersGameOver', handleCheckersGameOver);
             window.addEventListener('checkersBackToLobby', handleCheckersBackToLobby);

             // Store cleanup function in ref
             gameInstanceRef.current = {
                stop: () => {
                   window.removeEventListener('checkersGameOver', handleCheckersGameOver);
                   window.removeEventListener('checkersBackToLobby', handleCheckersBackToLobby);
                   setActiveReactGame(null);
                }
             };

        } else if (gameId === 'whot') {
             // Whot
             const mod = await import('../../games/whot/ui/App');
             setActiveReactGame(() => mod.WhotApp);
             
             // Whot might need specific props
             setReactGameProps({
                 gameOptions: {
                   playerName: nickname || 'You',
                   difficulty: 'medium'
                 }
             });

              gameInstanceRef.current = {
                stop: () => {
                   setActiveReactGame(null);
                }
             };

        } else {
             container.innerHTML = '<div class="text-white text-center pt-20">Game Coming Soon</div>';
        }
      } catch (e) {
        console.error("Error launching game:", e);
        container.innerHTML = `<div class="text-red-500 text-center pt-20">Error loading game module: ${e.message}</div>`;
      }
    }, 100);
  };

  if (!gameData) return <div className="text-white flex items-center justify-center h-screen">Loading Game Data...</div>;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#141415] z-50 flex flex-col">
      
      {/* LOBBY UI */}
      {gameState === 'lobby' && (
        <GameLobby
          gameData={gameData}
          onPlay={() => setShowModeModal(true)}
          nickname={nickname}
          setNickname={setNickname}
          selectedSkin={selectedSkin}
          setSelectedSkin={setSelectedSkin}
          skins={gameId === 'slither' ? SLITHER_SKINS : []}
          player={player}
        />
      )}

      {/* MODALS */}
      {activeSkillSlot !== null && (
        <SkillSelectorModal
          slotIndex={activeSkillSlot}
          selectedSkills={selectedSkills}
          onSelect={(id) => {
             const newSkills = [...selectedSkills];
             newSkills[activeSkillSlot] = id;
             // Ensure unique skills
             if (!newSkills.filter((s, idx) => idx !== activeSkillSlot).includes(id)) {
                setSelectedSkills(newSkills);
             }
             setActiveSkillSlot(null);
          }}
          onClose={() => setActiveSkillSlot(null)}
        />
      )}

      {showModeModal && (
        <GameModeModal
          gameId={gameId}
          onConfirm={(mode) => {
             if (mode === 'multiplayer') {
                setShowModeModal(false);
                setShowMatchmakingModal(true);
             } else {
                launchGame(mode);
             }
          }}
          onCancel={() => setShowModeModal(false)}
        />
      )}

      {showMatchmakingModal && (
        <MatchmakingModal
          onConfirm={(options) => {
             launchGame('multiplayer', options);
          }}
          onCancel={() => {
             setShowMatchmakingModal(false);
             setShowModeModal(true);
          }}
        />
      )}

      {/* PLAYING CONTAINER */}
      <div 
        id="phaser-game-container" 
        className={`flex-1 w-full h-full relative ${gameState === 'playing' ? 'block' : 'hidden'}`}
      >
        {ActiveReactGame && <ActiveReactGame {...reactGameProps} />}
      </div>

      {/* GAME OVER */}
      {gameState === 'gameover' && (
        <GameOverModal
          isWinner={gameResult.isWinner}
          length={gameResult.length}
          score={gameResult.score}
          earnedXP={gameResult.earnedXP}
          earnedTokens={gameResult.earnedTokens}
          onPlayAgain={() => {
              setGameState('lobby'); // Go back to lobby first? Or relaunch immediately?
              // Original code: onPlayAgain={() => launchGame()} calls launchGame directly.
              // But cleaning up phaser instance usually needs a reset?
              // Let's go to lobby for safety, or we must ensure destruction works perfect.
              // Let's check original...
              // Original calls launchGame().
              // But cleanup useEffect removes game if it exists? No, only on unmount.
              // But launchGame clears innerHTML. 
              // Better to stop previous instance first.
              if (gameInstanceRef.current && gameInstanceRef.current.stop) {
                  gameInstanceRef.current.stop();
              }
              launchGame();
          }}
          onBackToLobby={() => {
             setGameState('lobby');
             if (gameInstanceRef.current && gameInstanceRef.current.stop) {
                gameInstanceRef.current.stop();
                gameInstanceRef.current = null;
             }
          }}
        />
      )}

    </div>
  );
}
