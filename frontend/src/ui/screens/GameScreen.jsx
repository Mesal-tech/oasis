import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Settings, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import GAMES from '../../config/games.js';

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
  { id: 'gold', name: 'Golden Luck', color: '#ffd700', img: '/assets/slither/skins/skin_galaxy.png' } // Placeholder reuse
];

// ... components ...

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
                className={`
                                    skill-card transition-all bg-gray-900/80 border-2 rounded-xl p-5 text-center cursor-pointer
                                    ${isSelected && !isInThisSlot ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                    ${isInThisSlot ? 'border-cyan-500 ring-4 ring-cyan-500/50' : 'border-gray-700'}
                                `}
              >
                <div className="text-6xl mb-3">{skill.icon}</div>
                <div className="font-bold text-lg text-cyan-400">{skill.name}</div>
                <div className="text-xs text-gray-400 mt-1">{skill.desc}</div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const GameModeModal = ({ onConfirm, onCancel, gameId }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  // If Slither, maybe skip this or just have "Free for All"

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999]">
      <div className="bg-[#171717] border-2 border-[#333333] rounded-[25px] p-10 max-w-[600px] w-[90%]">
        <h2 className="text-white mb-8 text-3xl text-center">🎮 Select Game Mode</h2>
        <div className="flex flex-col gap-6 mb-8">
          <div
            onClick={() => setSelectedMode('ai')}
            className={`
                            p-6 bg-[#282828] border-2 rounded-lg cursor-pointer transition-all
                            ${selectedMode === 'ai' ? 'bg-[#00d4ff]/30 border-[#00d4ff] scale-[1.02]' : 'border-[#333333] hover:bg-[#00d4ff]/10 hover:scale-[1.02]'}
                        `}
          >
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
          <button
            onClick={() => selectedMode && onConfirm(selectedMode)}
            disabled={!selectedMode}
            className={`
                            px-6 py-2 bg-white text-black font-bold rounded-lg transition-opacity
                            ${!selectedMode ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:bg-white/80'}
                        `}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

const GameOverModal = ({ isWinner, length, onPlayAgain, onBackToLobby }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] animate-[fadeIn_0.3s_ease-in]">
      <div className="bg-[#171717] border-[3px] border-[#353535] rounded-[25px] p-12 max-w-[500px] w-[90%] text-center animate-[slideIn_0.4s_ease-out]">
        <div className="text-7xl mb-4">{isWinner ? '🏆' : '💀'}</div>
        <h2 className="mb-4 text-4xl font-bold" style={{
          color: '#ffffff',
          textShadow: `0 0 20px rgba(${isWinner ? '0, 255, 136' : '255, 68, 68'}, 0.5)`
        }}>
          {isWinner ? 'Victory!' : 'Game Over!'}
        </h2>
        <div className="mb-8">
          <div className="text-xl text-[#888] mb-4">Your Final Length</div>
          <div className="text-6xl font-bold text-[#00d4ff] drop-shadow-[0_0_30px_rgba(0,212,255,0.7)]">
            {length}
          </div>
          <div className="text-base text-[#888] mt-2">segments</div>
        </div>
        {isWinner && <div className="text-xl text-[#00ff88] mb-8">🎉 You are the last snake standing! 🎉</div>}

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
  const { gameName } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('lobby'); // lobby, playing, gameover
  const [gameData, setGameData] = useState(null);
  const [currentMap, setCurrentMap] = useState('classic');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeSkillSlot, setActiveSkillSlot] = useState(null); // index of slot being edited
  const [showModeModal, setShowModeModal] = useState(false);

  // Slither Specific State
  const [nickname, setNickname] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('neon-blue');
  const [skinIndex, setSkinIndex] = useState(1); // Index of current skin in SLITHER_SKINS

  // Game Over State
  const [gameResult, setGameResult] = useState({ length: 0, isWinner: false });

  // Phaser refs
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    const data = GAMES.find(g => g.id === gameName);
    if (data) setGameData(data);
  }, [gameName]);

  // Cleanup Phaser on unmount
  useEffect(() => {
    return () => {
      if (gameInstanceRef.current) {
        if (gameInstanceRef.current.stop) gameInstanceRef.current.stop();
        gameInstanceRef.current = null;
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

  const launchGame = async (mode = 'ai') => {
    setGameState('playing');
    setShowModeModal(false);

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
              game.game.events.on('gameOver', (len) => {
                setGameResult({ length: len, isWinner: false });
                setGameState('gameover');
              });
              game.game.events.on('gameWon', (len) => {
                setGameResult({ length: len, isWinner: true });
                setGameState('gameover');
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
        } else {
          // Placeholder
          container.innerHTML = '<div class="text-white text-center pt-20">Coming Soon</div>';
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
        <div className="relative h-full flex flex-col justify-between overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img src={gameData.thumbnail} className="w-full h-full object-cover opacity-50" alt="bg" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
            {/* Animated Hex Pattern overlay could go here */}
          </div>

          {/* Top Bar */}
          <div className="relative z-10 p-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <button onClick={() => navigate('/')} className="text-white hover:text-cyan-400 transition flex items-center gap-2">
                <ChevronLeft /> Back
              </button>
            </div>
            <div className="flex gap-4">
              <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white font-mono shadow-lg">
                TOP SCORE: <span className="text-cyan-400 font-bold">10,420</span>
              </div>
              <button className="text-white/80 hover:text-white transition"><Settings /></button>
            </div>
          </div>

          {/* MAIN CONTENT CENTER */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8">

            {/* Slither Specific Logo/Title */}
            {isSlither && (
              <div className="text-center animate-[float_4s_ease-in-out_infinite]">
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00ff88] to-[#00d4ff] drop-shadow-[0_0_25px_rgba(0,255,136,0.5)] tracking-tighter italic"
                  style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>
                  SLITHER
                </h1>
                <div className="text-cyan-200 tracking-[0.5em] text-sm mt-2 font-bold opacity-80">PRO EDITION</div>
              </div>
            )}

            {isSlither ? (
              // SLITHER SPECIFIC LOBBY
              <div className="flex flex-col items-center gap-8 w-full max-w-md animate-[fadeIn_0.5s_ease-out]">

                {/* Nickname Input */}
                <div className="w-full relative group">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <input
                    type="text"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={12}
                    className="relative z-10 w-full bg-[#0a0a12]/80 backdrop-blur-md border-[3px] border-white/10 text-center text-2xl text-white font-bold py-5 rounded-2xl focus:border-cyan-500 focus:shadow-[0_0_30px_rgba(34,211,238,0.3)] outline-none transition-all placeholder:text-gray-600 focus:scale-105"
                  />
                </div>

                {/* Skin Selector */}
                <div className="flex items-center gap-6 select-none">
                  <button onClick={() => rotateSkin(-1)} className="p-3 text-white/30 hover:text-cyan-400 hover:bg-white/5 rounded-full transition active:scale-95">
                    <ChevronLeft size={40} />
                  </button>

                  <div className="relative group cursor-pointer" onClick={() => rotateSkin(1)}>
                    {/* Halo Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-green-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

                    <div className="w-40 h-40 bg-[#0a0a12] rounded-full border-[6px] border-[#222] relative flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                      {/* Skin Preview Circle - IMAGE BASED */}
                      <div
                        className="w-28 h-28 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 transform group-hover:scale-110 overflow-hidden relative"
                      >
                        <img
                          src={SLITHER_SKINS[skinIndex].img}
                          alt="skin"
                          className="w-full h-full object-cover"
                        />

                        {/* Simple Eyes for Preview */}
                        <div className="absolute top-[30%] left-[20%] w-8 h-8 bg-white rounded-full shadow-md z-10">
                          <div className="absolute top-[40%] right-[20%] w-3 h-3 bg-black rounded-full" />
                        </div>
                        <div className="absolute top-[30%] right-[20%] w-8 h-8 bg-white rounded-full shadow-md z-10">
                          <div className="absolute top-[40%] right-[20%] w-3 h-3 bg-black rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-white font-bold text-lg drop-shadow-md">{SLITHER_SKINS[skinIndex].name}</span>
                    </div>
                  </div>

                  <button onClick={() => rotateSkin(1)} className="p-3 text-white/30 hover:text-cyan-400 hover:bg-white/5 rounded-full transition active:scale-95">
                    <ChevronRight size={40} />
                  </button>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => launchGame()}
                  className="mt-8 w-full py-5 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#001e10] font-black text-3xl tracking-widest rounded-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,136,0.6)] active:scale-95 transition-all uppercase relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    PLAY NOW
                  </span>
                  <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                <div className="text-white/30 text-xs font-mono">v1.2.0 • HIGH PERFORMANCE</div>
              </div>
            ) : (
              // GENERIC LOBBY (Keep for other games)
              <div className="flex flex-col gap-6 items-center">
                <div className="text-white text-xl">Select a mode to begin</div>
                <button
                  onClick={() => setShowModeModal(true)}
                  className="w-64 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-white/90 shadow-lg shadow-cyan-500/20 active:scale-95 transition"
                >
                  🎮 Start Application
                </button>
              </div>
            )}

          </div>

          {/* Bottom Bar (Only for Generic or Extra Info) - Optional */}
          {!isSlither && (
            <div className="relative z-10 p-6 flex justify-center">
              {/* ... other lobby items ... */}
            </div>
          )}
        </div>
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
