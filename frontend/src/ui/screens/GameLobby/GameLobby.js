// ===== frontend/src/ui/screens/GameLobby/GameLobby.js =====
import { router } from '../../../router.js';
import { userStore } from '../../../state/userStore.js';
import GAMES from '../../../config/games.js';
import "./GameLobby.css"
let SlitherGame;

export class GameScreen {
  constructor(gameName) {
    this.gameName = gameName;
    this.game = null;
    this.gameData = GAMES.find(g => g.id === gameName);
    this.element = null;
    this.gameStarted = false;
  }

  render() {
    this.element = document.createElement('div');
    this.element.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 100; display: flex; flex-direction: column;';
    // Game Container
    const gameContainer = document.createElement('div');
    gameContainer.id = 'gameContainer';
    gameContainer.style.cssText = 'flex: 1; display: flex; flex-direction: column; position: relative;';

    // Start Screen (shown initially)
    const startScreen = this.createStartScreen();
    gameContainer.appendChild(startScreen);

    this.element.appendChild(gameContainer);

    return this.element;
  }

  createStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.id = 'startScreen';
    startScreen.style.cssText = `
            height: 100dvh;
            background: #141415;
        `;

    startScreen.innerHTML = `
            <div class="relative h-full flex justify-between gap-2 items-start">
              <div class="absolute top-0 left-0 w-full h-full">
                <img src="/assets/slither-thumb.jpg" class="w-full h-full object-cover" />
              </div>
              <div style="text-align: center;">
                  <h1 style="font-size: 3rem; color: #00d4ff; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);">
                      ${this.gameData.title}
                  </h1>
                  <p style="color: #888; font-size: 1.2rem; margin-bottom: 2rem;">
                      ${this.gameData.description}
                  </p>
              </div>
              <div class="min-w-2/3 aspect-video min-h-[15rem] rounded-[25px] bg-white/5"></div>

              <div class="absolute bottom-0 w-full p-4">
                <div class="bg-gradient-to-t from-black to-transparent p-4 w-[15rem]">
                  <div class="flex justify-between items-center">
                    <div class="h-15 w-15 bg-white/5"></div>
                    <div class="h-15 w-15 bg-white/5"></div>
                    <div class="h-15 w-15 bg-white/5"></div>
                  </div>
                  <button id="startGameBtn" class="btn-primary w-full">
                    🎮 Start Game
                  </button>
                </div>
              </div>
            </div>
        `;

    startScreen.querySelector('#startGameBtn').onclick = () => this.showGameModeModal();

    return startScreen;
  }

  showGameModeModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #00d4ff;
            border-radius: 12px;
            padding: 2.5rem;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 212, 255, 0.5);
        `;

    modalContent.innerHTML = `
            <h2 style="color: #00d4ff; margin-bottom: 2rem; font-size: 2rem; text-align: center;">
                🎮 Select Game Mode
            </h2>
            <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem;">
                <div class="game-mode-option" data-mode="ai" style="
                    padding: 1.5rem;
                    background: rgba(0, 212, 255, 0.1);
                    border: 2px solid #00d4ff;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 2rem;">🤖</span>
                        <div style="flex: 1;">
                            <div style="font-size: 1.3rem; font-weight: bold; color: #00d4ff;">
                                AI Mode
                            </div>
                            <div style="color: #888; font-size: 0.9rem;">
                                Play against AI bots
                            </div>
                        </div>
                        <span style="
                            padding: 0.3rem 0.8rem;
                            background: #00ff88;
                            color: black;
                            border-radius: 4px;
                            font-size: 0.8rem;
                            font-weight: bold;
                        ">ACTIVE</span>
                    </div>
                </div>
                
                <div class="game-mode-option" data-mode="pvp" style="
                    padding: 1.5rem;
                    background: rgba(100, 100, 100, 0.1);
                    border: 2px solid #555;
                    border-radius: 8px;
                    cursor: not-allowed;
                    opacity: 0.5;
                    transition: all 0.3s;
                ">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 2rem;">⚔️</span>
                        <div style="flex: 1;">
                            <div style="font-size: 1.3rem; font-weight: bold; color: #888;">
                                PvP Mode
                            </div>
                            <div style="color: #666; font-size: 0.9rem;">
                                Play against other players
                            </div>
                        </div>
                        <span style="
                            padding: 0.3rem 0.8rem;
                            background: #ff4444;
                            color: white;
                            border-radius: 4px;
                            font-size: 0.8rem;
                            font-weight: bold;
                        ">COMING SOON</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="cancelBtn" style="
                    padding: 0.8rem 2rem;
                    background: transparent;
                    border: 1px solid #ff4444;
                    border-radius: 6px;
                    color: #ff4444;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                ">
                    Cancel
                </button>
                <button id="confirmBtn" style="
                    padding: 0.8rem 2rem;
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    border: none;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
                " disabled>
                    Start Game
                </button>
            </div>
        `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    let selectedMode = null;
    const confirmBtn = modalContent.querySelector('#confirmBtn');

    const aiOption = modalContent.querySelector('[data-mode="ai"]');
    aiOption.onmouseover = () => {
      aiOption.style.background = 'rgba(0, 212, 255, 0.2)';
      aiOption.style.transform = 'scale(1.02)';
    };
    aiOption.onmouseout = () => {
      if (selectedMode !== 'ai') {
        aiOption.style.background = 'rgba(0, 212, 255, 0.1)';
        aiOption.style.transform = 'scale(1)';
      }
    };
    aiOption.onclick = () => {
      selectedMode = 'ai';
      aiOption.style.background = 'rgba(0, 212, 255, 0.3)';
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
    };

    modalContent.querySelector('#cancelBtn').onclick = () => modal.remove();

    confirmBtn.onclick = () => {
      if (selectedMode === 'ai') {
        modal.remove();
        this.launchGame(selectedMode);
      }
    };

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    confirmBtn.style.opacity = '0.5';
  }

  async launchGame(mode = 'ai') {
    const container = this.element.querySelector('#gameContainer');

    const startScreen = container.querySelector('#startScreen');

    if (this.gameName === 'slither') {
      try {
        const slitherModule = await import('../../../games/slither/index.js');
        SlitherGame = slitherModule.SlitherGame;

        container.innerHTML = '';
        const phaserContainer = document.createElement('div');
        phaserContainer.id = 'phaserContainer';
        phaserContainer.style.cssText = 'flex: 1;';
        container.appendChild(phaserContainer);

        this.game = new SlitherGame('phaserContainer');
        this.game.launch();
        this.gameStarted = true;

        // Wait a bit for the game to initialize, then access the Phaser game instance
        setTimeout(() => {
          if (this.game && this.game.game && this.game.game.events) {
            // Listen for game over event (player died)
            this.game.game.events.on('gameOver', (length) => {
              this.showGameOverScreen(length, false);
            });

            // Listen for game won event (player is last survivor)
            this.game.game.events.on('gameWon', (length) => {
              this.showGameOverScreen(length, true);
            });
          }
        }, 100);
      } catch (error) {
        console.error('Error launching Slither game:', error);
        container.innerHTML = `<div style="color: red; padding: 2rem;">Error loading game: ${error.message}</div>`;
      }
    } else {
      container.innerHTML = `
                <div style="
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 2rem;
                ">
                    <div style="font-size: 4rem;">${this.gameData.icon}</div>
                    <div style="text-align: center;">
                        <h2 style="font-size: 2rem; color: #00d4ff; margin-bottom: 1rem;">
                            ${this.gameData.title}
                        </h2>
                        <p style="color: #888; font-size: 1rem;">
                            Coming soon...
                        </p>
                    </div>
                </div>
            `;
    }
  }

  showGameOverScreen(length, isWinner) {
    const modal = document.createElement('div');
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in;
        `;

    const modalContent = document.createElement('div');
    const borderColor = isWinner ? '#00ff88' : '#ff4444';
    const titleColor = isWinner ? '#00ff88' : '#ff4444';
    const emoji = isWinner ? '🏆' : '💀';
    const title = isWinner ? 'Victory!' : 'Game Over!';

    modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 3px solid ${borderColor};
            border-radius: 16px;
            padding: 3rem;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(${isWinner ? '0, 255, 136' : '255, 68, 68'}, 0.5);
            text-align: center;
            animation: slideIn 0.4s ease-out;
        `;

    modalContent.innerHTML = `
            <div style="font-size: 5rem; margin-bottom: 1rem;">${emoji}</div>
            <h2 style="color: ${titleColor}; margin-bottom: 1rem; font-size: 2.5rem; text-shadow: 0 0 20px rgba(${isWinner ? '0, 255, 136' : '255, 68, 68'}, 0.5);">
                ${title}
            </h2>
            <div style="margin-bottom: 2rem;">
                <div style="font-size: 1.2rem; color: #888; margin-bottom: 1rem;">Your Final Length</div>
                <div style="font-size: 4rem; color: #00d4ff; font-weight: bold; text-shadow: 0 0 30px rgba(0, 212, 255, 0.7);">
                    ${length}
                </div>
                <div style="font-size: 1rem; color: #888; margin-top: 0.5rem;">segments</div>
            </div>
            ${isWinner ? '<div style="font-size: 1.2rem; color: #00ff88; margin-bottom: 2rem;">🎉 You are the last snake standing! 🎉</div>' : ''}
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="playAgainBtn" style="
                    padding: 1rem 2.5rem;
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.3s;
                    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
                ">
                    🎮 Play Again
                </button>
                <button id="backToLobbyBtn" style="
                    padding: 1rem 2.5rem;
                    background: transparent;
                    border: 2px solid #00d4ff;
                    border-radius: 8px;
                    color: #00d4ff;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.3s;
                ">
                    ← Back to Lobby
                </button>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
        `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modalContent.querySelector('#playAgainBtn').onclick = () => {
      modal.remove();
      this.cleanup();
      this.showGameModeModal();
    };

    modalContent.querySelector('#backToLobbyBtn').onclick = () => {
      modal.remove();
      const container = this.element.querySelector('#gameContainer');

      const startScreen = container.querySelector('#startScreen');
      if (startScreen) {
        startScreen.add();
      }
    };
  }

  goBack() {
    this.cleanup();
    router.navigateTo('lobby');
  }

  showSettings() {
    this.showModal('Game Settings', `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                    <label style="color: #00d4ff; font-weight: 600; display: block; margin-bottom: 0.5rem;">
                        Sound Volume
                    </label>
                    <input type="range" min="0" max="100" value="80" style="width: 100%; cursor: pointer;">
                </div>
                <div>
                    <label style="color: #00d4ff; font-weight: 600; display: block; margin-bottom: 0.5rem;">
                        Music Volume
                    </label>
                    <input type="range" min="0" max="100" value="50" style="width: 100%; cursor: pointer;">
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <input type="checkbox" id="screenShake" checked style="cursor: pointer;">
                    <label for="screenShake" style="color: #00d4ff; cursor: pointer;">
                        Screen Shake Effects
                    </label>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <input type="checkbox" id="particles" checked style="cursor: pointer;">
                    <label for="particles" style="color: #00d4ff; cursor: pointer;">
                        Particle Effects
                    </label>
                </div>
            </div>
        `);
  }

  showModal(title, content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #00d4ff;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3);
        `;

    modalContent.innerHTML = `
            <h2 style="color: #00d4ff; margin-bottom: 1.5rem; font-size: 1.5rem;">
                ${title}
            </h2>
            <div style="margin-bottom: 2rem;">
                ${content}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="closeBtn" style="
                    padding: 0.7rem 1.5rem;
                    background: transparent;
                    border: 1px solid #00d4ff;
                    border-radius: 6px;
                    color: #00d4ff;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                ">
                    Close
                </button>
            </div>
        `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const closeBtn = modalContent.querySelector('#closeBtn');
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  cleanup() {
    if (this.game) {
      this.game.stop();
    }
  }
}