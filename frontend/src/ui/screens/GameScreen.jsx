import { usePlayer } from '../../state/PlayerContext';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Settings, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import GAMES from '../../config/games.js';
import { GameLobby } from '../components/GameLobby';
import apiClient from '../../api/client';

// --- DATA ---
const MAPS = [
  { id: 'classic', name: 'Classic Arena', preview: '/assets/slither-thumb.jpg' },
  { id: 'neon', name: 'Neon Grid', preview: '/assets/flappy-thumb.jpg' },
  { id: 'void', name: 'Void Zone', preview: '/assets/racing-thumb.jpg' },
  { id: 'jungle', name: 'Toxic Jungle', preview: '/assets/stitch-bg.png' }
];

const SKILLS = [
  { id: 'speed', name: 'Boost', icon: '⚡', color: 'from-yellow-500 to-orange-500', desc: '+50% speed for 6s' },
  { id: 'shield', name: 'Shield', icon: '🛡️', color: 'from-blue-500 to-primary-500', desc: 'Block one hit' },
  { id: 'ghost', name: 'Ghost', icon: '👻', color: 'from-purple-500 to-pink-500', desc: 'Pass through snakes 5s' },
  { id: 'magnet', name: 'Magnet', icon: '🧲', color: 'from-green-500 to-teal-500', desc: 'Pull food toward you' },
  { id: 'cut', name: 'Cut', icon: '✂️', color: 'from-red-500 to-rose-500', desc: 'Sever enemy tails' },
  { id: 'freeze', name: 'Freeze', icon: '❄️', color: 'from-primary-400 to-blue-600', desc: 'Slow all enemies 4s' }
];

const SLITHER_SKINS = [
  { id: 'default', name: 'Classic Green', color: '#00ff88', img: '/assets/slither/skins/skin_green.png' },
  { id: 'neon-blue', name: 'Neon Blue', color: '#00d4ff', img: '/assets/slither/skins/skin_neon.png' },
  { id: 'fire', name: 'Magma Red', color: '#ff4444', img: '/assets/slither/skins/skin_fire.png' },
  { id: 'galaxy', name: 'Cosmic Purple', color: '#aa00ff', img: '/assets/slither/skins/skin_galaxy.png' },
  { id: 'gold', name: 'Golden Luck', color: '#ffd700', img: '/assets/slither/skins/skin_galaxy.png' }
];

const SkillSelectorModal = ({ slotIndex, selectedSkills, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-cyan-500 rounded-2xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Select Skill {slotIndex + 1}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SKILLS.map(skill => {
            const isSelected = selectedSkills.includes(skill.id);
            const isInThisSlot = selectedSkills[slotIndex] === skill.id;
            return (
              <div
                key={skill.id}
                onClick={() => {
                  if (isSelected && !isInThisSlot) return;
                  onSelect(skill.id);
                }}
                className={`skill-card transition-all bg-gray-900/80 border-2 rounded-xl p-5 text-center cursor-pointer ${isSelected && !isInThisSlot ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isInThisSlot ? 'border-cyan-500 ring-4 ring-cyan-500/50' : 'border-gray-700'}`}
              >
                <div className="text-6xl mb-3">{skill.icon}</div>
                <div className="font-bold text-lg text-cyan-400">{skill.name}</div>
                <div className="text-xs text-gray-400 mt-1">{skill.desc}</div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="mt-8 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition">
          Close
        </button>
      </div>
    </div>
  );
};

const GameModeModal = ({ onConfirm, onCancel, gameId }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999]">
      <div className="bg-[#171717] border-2 border-[#333333] rounded-[25px] p-10 max-w-[600px] w-[90%]">
        <h2 className="text-white mb-8 text-3xl text-center">🎮 Select Game Mode</h2>
        <div className="flex flex-col gap-6 mb-8">
          <div onClick={() => setSelectedMode('ai')} className={`p-6 bg-[#282828] border-2 rounded-lg cursor-pointer transition-all ${selectedMode === 'ai' ? 'bg-[#00d4ff]/30 border-[#00d4ff] scale-[1.02]' : 'border-[#333333] hover:bg-[#00d4ff]/10 hover:scale-[1.02]'}`}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">🤖</span>
              <div className="flex-1">
                <div className="text-xl font-bold text-white">AI Mode</div>
                <div className="text-[#888] text-sm">Play against AI bots</div>
              </div>
              <span className="px-3 py-1 bg-[#00ff88] text-black rounded font-bold text-xs">ACTIVE</span>
            </div>
          </div>
          <div className="p-6 bg-[#282828] border-2 border-[#333333] rounded-lg opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">⚔️</span>
              <div className="flex-1">
                <div className="text-xl font-bold text-[#888]">PvP Mode</div>
                <div className="text-[#666] text-sm">Play against other players</div>
              </div>
              <span className="px-3 py-1 bg-[#ff4444] text-white rounded font-bold text-xs">COMING SOON</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="px-6 py-2 bg-transparent text-white border border-white/20 hover:bg-white/10 rounded-lg">Cancel</button>
          <button onClick={() => selectedMode && onConfirm(selectedMode)} disabled={!selectedMode} className={`px-6 py-2 bg-white text-black font-bold rounded-lg transition-opacity ${!selectedMode ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:bg-white/80'}`}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

const GameOverModal = ({ isWinner, length, score, earnedXP, earnedTokens, onPlayAgain, onBackToLobby }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] animate-[fadeIn_0.3s_ease-in]">
      <div className="bg-[#171717] border-[3px] border-[#353535] rounded-[25px] p-12 max-w-[500px] w-[90%] text-center animate-[slideIn_0.4s_ease-out]">
        <div className="text-7xl mb-4">{isWinner ? '🏆' : '💀'}</div>
        <h2 className="mb-4 text-4xl font-bold" style={{ color: '#ffffff', textShadow: `0 0 20px rgba(${isWinner ? '0, 255, 136' : '255, 68, 68'}, 0.5)` }}>
          {isWinner ? 'Victory!' : 'Game Over!'}
        </h2>
        <div className="mb-8">
          <div className="text-xl text-[#888] mb-4">Your Final Score</div>
          <div className="text-6xl font-bold text-[#00d4ff] drop-shadow-[0_0_30px_rgba(0,212,255,0.7)]">
            {score || length || 0}
          </div>
          <div className="text-base text-[#888] mt-2">{score ? 'points' : 'segments'}</div>
        </div>

        {/* Rewards Section */}
        {(earnedXP > 0 || earnedTokens > 0) && (
          <div className="mb-8 bg-[#27272A] rounded-xl p-6">
            <div className="text-xs font-bold text-[#71717A] uppercase mb-4 tracking-wider">Rewards Earned</div>
            <div className="space-y-3">
              {earnedXP > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium flex items-center gap-2">
                    <span className="text-2xl">⚡</span> Experience
                  </span>
                  <span className="text-[#00ff88] font-black text-xl">+{earnedXP} XP</span>
                </div>
              )}
              {earnedTokens > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium flex items-center gap-2">
                    <span className="text-2xl">🪙</span> Tokens
                  </span>
                  <span className="text-[#FFCE31] font-black text-xl">+{earnedTokens}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isWinner && <div className="text-xl text-[#00ff88] mb-8">🎉 You are the last one standing! 🎉</div>}
        <div className="flex gap-4 justify-center">
          <button onClick={onPlayAgain} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/80 transition shadow-lg shadow-white/10">
            🎮 Play Again
          </button>
          <button onClick={onBackToLobby} className="px-6 py-3 bg-transparent text-white border border-white/20 rounded-lg hover:bg-white/5 transition">
            ← Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameScreen = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { player, refreshPlayer } = usePlayer(); // Get player context

  const [gameState, setGameState] = useState('lobby'); // lobby, playing, gameover
  const [gameData, setGameData] = useState(null);
  const [currentMap, setCurrentMap] = useState('classic');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeSkillSlot, setActiveSkillSlot] = useState(null); // index of slot being edited
  const [showModeModal, setShowModeModal] = useState(false);

  // Game tracking
  const [savingMatch, setSavingMatch] = useState(false);

  // Slither Specific State
  // Default nickname to player username or 'Guest'
  const [nickname, setNickname] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('neon-blue');

  useEffect(() => {
    if (player?.username) {
      setNickname(player.username);
    }
  }, [player]);
  const [skinIndex, setSkinIndex] = useState(1); // Index of current skin in SLITHER_SKINS

  // Game Over State (enhanced with rewards)
  const [gameResult, setGameResult] = useState({
    score: 0,
    length: 0,
    isWinner: false,
    earnedXP: 0,
    earnedTokens: 0
  });

  // Phaser refs
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const reactRootRef = useRef(null);
  const gameStartTimeRef = useRef(null); // Use ref instead of state for start time

  useEffect(() => {
    const data = GAMES.find(g => g.id === gameId);
    if (data) setGameData(data);
  }, [gameId]);

  // Cleanup Phaser on unmount
  useEffect(() => {
    return () => {
      if (gameInstanceRef.current) {
        if (gameInstanceRef.current.stop) gameInstanceRef.current.stop();
        gameInstanceRef.current = null;
      }
      if (reactRootRef.current) {
        reactRootRef.current.unmount();
        reactRootRef.current = null;
      }
    };
  }, []);

  const rotateSkin = (dir) => {
    const count = SLITHER_SKINS.length;
    let newIndex = skinIndex + dir;
    if (newIndex < 0) newIndex = count - 1;
    if (newIndex >= count) newIndex = 0;
    setSkinIndex(newIndex);
    setSelectedSkin(SLITHER_SKINS[newIndex].id);
  };

  // Save match result to backend
  const saveMatchResult = async (score, isWinner, metadata = {}) => {
    console.log('💾 saveMatchResult called:', {
      score,
      isWinner,
      hasPlayer: !!player,
      playerId: player?.id,
      hasGameData: !!gameData,
      gameId: gameData?.id
    });

    if (!player?.id || !gameData?.id) {
      console.warn('Cannot save match: missing player or game data', {
        player: player,
        gameData: gameData
      });
      return;
    }

    try {
      setSavingMatch(true);
      const duration = gameStartTimeRef.current ? Math.floor((Date.now() - gameStartTimeRef.current) / 1000) : 0;

      console.log('⏱️ Duration calculation:', {
        startTime: gameStartTimeRef.current,
        now: Date.now(),
        duration
      });

      const result = await apiClient.recordMatch(gameData.id, {
        playerId: player.id,
        score,
        duration,
        metadata: {
          ...metadata,
          isWinner,
          gameMode: 'solo',
          skin: selectedSkin,
          map: currentMap
        }
      });

      if (result.success) {
        // Update game result with earned rewards
        setGameResult(prev => ({
          ...prev,
          earnedXP: result.earnedXP || 0,
          earnedTokens: result.earnedTokens || 0
        }));

        // Refresh player data to get updated XP/Level/Tokens
        if (refreshPlayer) {
          await refreshPlayer();
        }

        console.log('Match saved successfully:', result);
      }
    } catch (error) {
      console.error('Failed to save match:', error);
      // Don't block the game over screen if save fails
    } finally {
      setSavingMatch(false);
    }
  };

  const launchGame = async (mode = 'ai') => {
    setGameState('playing');
    setShowModeModal(false);
    gameStartTimeRef.current = Date.now(); // Use ref instead of state
    console.log('🎮 Game started at:', gameStartTimeRef.current);

    // Allow DOM to update first so container exists
    setTimeout(async () => {
      const container = document.getElementById('phaser-game-container');
      if (!container) return;

      // Clear
      container.innerHTML = '';

      try {
        if (gameData.id === 'slither') {
          const mod = await import('../../games/slither/index.js');
          const Game = mod.SlitherGame;

          const d = document.createElement('div');
          d.id = 'phaser-root';
          d.style.width = '100%';
          d.style.height = '100%';
          container.appendChild(d);

          const game = new Game('phaser-root');
          // Pass the Launch Config
          game.launch({
            nickname: nickname || 'You',
            skin: selectedSkin
          });
          gameInstanceRef.current = game;

          // Attach listeners
          setTimeout(() => {
            if (game.game && game.game.events) {
              game.game.events.on('gameOver', async (len) => {
                console.log('🐍 Slither gameOver event received. Length:', len, 'Type:', typeof len);

                // Stop music
                if (game.stopMusic) {
                  game.stopMusic();
                }

                const finalScore = len || 0;
                setGameResult({ score: finalScore, length: finalScore, isWinner: false });
                setGameState('gameover');

                // Save match to backend
                await saveMatchResult(finalScore, false, { finalLength: len });
              });
              game.game.events.on('gameWon', async (len) => {
                console.log('🏆 Slither gameWon event received. Length:', len);

                // Stop music
                if (game.stopMusic) {
                  game.stopMusic();
                }

                const finalScore = len || 0;
                setGameResult({ score: finalScore, length: finalScore, isWinner: true });
                setGameState('gameover');

                // Save match to backend
                await saveMatchResult(finalScore, true, { finalLength: len });
              });
            }
          }, 500);

        } else if (gameData.id === 'flappy') {
          const mod = await import('../../games/flappy-bird/index.js');
          const Game = mod.FlappyBirdGame;

          const d = document.createElement('div');
          d.id = 'flappy-root';
          d.style.cssText = 'width: 100%; height: 100%; overflow: hidden;';
          container.appendChild(d);

          const game = new Game('flappy-root');
          game.launch();
          gameInstanceRef.current = game;

          // Attach game over listener for Flappy Bird
          setTimeout(() => {
            if (game.game && game.game.events) {
              game.game.events.on('gameOver', async (score) => {
                const finalScore = score || 0;
                setGameResult({ score: finalScore, length: 0, isWinner: false });
                setGameState('gameover');

                // Save match to backend
                await saveMatchResult(finalScore, false, { pipesCleared: finalScore });
              });
            }
          }, 500);

        } else if (gameData.id === 'checkers') {
          // Checkers Integration
          await import('../../games/checkers/index.css'); // Ensure styles are loaded
          const mod = await import('../../games/checkers/ui/App');
          const CheckersApp = mod.App;

          const d = document.createElement('div');
          d.id = 'checkers-root';
          d.style.width = '100%';
          d.style.height = '100%';
          container.appendChild(d);

          const root = createRoot(d);
          root.render(<CheckersApp />);
          reactRootRef.current = root;

          // Listen for game over event from checkers
          const handleCheckersGameOver = async (event) => {
            const { score, isWinner } = event.detail;
            console.log('Checkers game over:', { score, isWinner });

            // Save match to backend
            await saveMatchResult(score, isWinner, { gameType: 'checkers' });
          };

          const handleCheckersBackToLobby = () => {
            setGameState('lobby');
            if (reactRootRef.current) {
              reactRootRef.current.unmount();
              reactRootRef.current = null;
            }
          };

          window.addEventListener('checkersGameOver', handleCheckersGameOver);
          window.addEventListener('checkersBackToLobby', handleCheckersBackToLobby);

          // Store cleanup function
          gameInstanceRef.current = {
            cleanup: () => {
              window.removeEventListener('checkersGameOver', handleCheckersGameOver);
              window.removeEventListener('checkersBackToLobby', handleCheckersBackToLobby);
            }
          };

        } else if (gameData.id === 'whot') {
          // Whot Integration
          const mod = await import('../../games/whot/index.js');
          const Game = mod.WhotGame;

          const d = document.createElement('div');
          d.id = 'whot-root';
          d.style.width = '100%';
          d.style.height = '100%';
          container.appendChild(d);

          const game = new Game('whot-root');
          game.launch({
            nickname: nickname || 'You',
            difficulty: 'medium'
          });
          gameInstanceRef.current = game;

          // Attach game over listener
          setTimeout(() => {
            if (game.game && game.game.events) {
              game.game.events.on('gameOver', async (score, isWinner) => {
                console.log('🃏 Whot gameOver event received. Score:', score, 'Winner:', isWinner);

                // Stop music
                if (game.stopMusic) {
                  game.stopMusic();
                }

                const finalScore = score || 0;
                setGameResult({ score: finalScore, length: 0, isWinner });
                setGameState('gameover');

                // Save match to backend
                await saveMatchResult(finalScore, isWinner, { gameType: 'whot' });
              });
            }
          }, 500);

        } else {
          // Placeholder
          container.innerHTML = '<div className="text-white text-center pt-20">Coming Soon</div>';
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
  };

  if (!gameData) return <div className="text-white">Loading...</div>;

  const isSlither = gameData.id === 'slither';

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#141415] z-50 flex flex-col">

      {/* LOBBY UI */}
      {gameState === 'lobby' && (
        <GameLobby
          gameData={gameData}
          onPlay={() => launchGame()}
          nickname={nickname}
          setNickname={setNickname}
          selectedSkin={selectedSkin}
          setSelectedSkin={setSelectedSkin}
          skins={isSlither ? SLITHER_SKINS : []}
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
          onConfirm={launchGame}
          onCancel={() => setShowModeModal(false)}
        />
      )}

      {/* PLAYING CONTAINER */}
      <div
        id="phaser-game-container"
        className={`flex-1 w-full h-full relative ${gameState === 'playing' ? 'block' : 'hidden'}`}
      ></div>

      {/* GAME OVER */}
      {gameState === 'gameover' && (
        <GameOverModal
          isWinner={gameResult.isWinner}
          length={gameResult.length}
          score={gameResult.score}
          earnedXP={gameResult.earnedXP}
          earnedTokens={gameResult.earnedTokens}
          onPlayAgain={() => launchGame()}
          onBackToLobby={() => {
            setGameState('lobby');
            if (gameInstanceRef.current) {
              if (gameInstanceRef.current.stop) gameInstanceRef.current.stop();
              gameInstanceRef.current = null;
            }
          }}
        />
      )}
    </div>
  );
};
