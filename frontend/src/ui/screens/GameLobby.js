// ===== frontend/src/ui/screens/GameLobby/GameLobby.js =====
import { router } from '../../router.js';
import { userStore } from '../../state/userStore.js';
import GAMES from '../../config/games.js';
let SlitherGame;
let FlappyBirdGame;

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
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    `;

        // === DATA ===
        const maps = [
            { id: 'classic', name: 'Classic Arena', preview: `/assets/slither-thumb.jpg` },
            { id: 'neon', name: 'Neon Grid', preview: '/assets/flappy-thumb.jpg' },
            { id: 'void', name: 'Void Zone', preview: '/assets/racing-thumb.jpg' },
            { id: 'jungle', name: 'Toxic Jungle', preview: '/assets/stitch-bg.png' }
        ];

        const skills = [
            { id: 'speed', name: 'Boost', icon: '⚡', color: 'from-yellow-500 to-orange-500', desc: '+50% speed for 6s' },
            { id: 'shield', name: 'Shield', icon: '🛡️', color: 'from-blue-500 to-primary-500', desc: 'Block one hit' },
            { id: 'ghost', name: 'Ghost', icon: '👻', color: 'from-purple-500 to-pink-500', desc: 'Pass through snakes 5s' },
            { id: 'magnet', name: 'Magnet', icon: '🧲', color: 'from-green-500 to-teal-500', desc: 'Pull food toward you' },
            { id: 'cut', name: 'Cut', icon: '✂️', color: 'from-red-500 to-rose-500', desc: 'Sever enemy tails' },
            { id: 'freeze', name: 'Freeze', icon: '❄️', color: 'from-primary-400 to-blue-600', desc: 'Slow all enemies 4s' }
        ];

        let currentMapIndex = 0;
        let selectedSkills = []; // max 3

        // === UPDATE FUNCTIONS ===
        const updateMapGrid = () => {
            mapCards.forEach((card, index) => {
                if (index === currentMapIndex) {
                    card.classList.add('active');
                    card.style.borderColor = 'rgba(223, 4, 10, 0.6)';
                    card.style.transform = 'scale(1.05)';
                    card.style.boxShadow = '0 0 5px #5d5c5cff';
                } else {
                    card.classList.remove('active');
                    card.style.borderColor = '#333333';
                    card.style.transform = 'scale(1)';
                    card.style.boxShadow = 'none';
                }
            });
        };

        const updateSkillSlots = () => {
            skillSlots.forEach((slot, i) => {
                if (selectedSkills[i]) {
                    const skill = skills.find(s => s.id === selectedSkills[i]);
                    slot.innerHTML = `
                    <div class="text-5xl">${skill.icon}</div>
                    <div class="text-xs font-bold text-primary-400 mt-1">${skill.name}</div>
                `;
                    slot.classList.add('selected', 'border-primary-500', 'bg-primary-900/30');
                    slot.classList.remove('border-[#353535');
                } else {
                    slot.innerHTML = `<div class="text-5xl text-white/70">?</div>`;
                    slot.classList.remove('selected', 'border-primary-500', 'bg-primary-900/30');
                    slot.classList.add('border-[#353535]');
                }
            });
        };

        const openSkillModal = (slotIndex) => {
            const modal = document.createElement('div');
            modal.style.cssText = `position:fixed;inset-0;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;`;

            modal.innerHTML = `
            <div class="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-primary-500 rounded-2xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
                <h2 class="text-3xl font-bold text-primary-400 mb-6 text-center">Select Skill ${slotIndex + 1}</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    ${skills.map(skill => {
                const isSelected = selectedSkills.includes(skill.id);
                const isInThisSlot = selectedSkills[slotIndex] === skill.id;
                return `
                            <div class="skill-card ${isSelected && !isInThisSlot ? 'opacity-50' : 'cursor-pointer hover:scale-105'} transition-all bg-gray-900/80 border-2 ${isInThisSlot ? 'border-primary-500 ring-4 ring-primary-500/50' : 'border-gray-700'} rounded-xl p-5 text-center"
                                 data-id="${skill.id}">
                                <div class="text-6xl mb-3">${skill.icon}</div>
                                <div class="font-bold text-lg text-primary-400">${skill.name}</div>
                                <div class="text-xs text-gray-400 mt-1">${skill.desc}</div>
                            </div>
                        `;
            }).join('')}
                </div>
                <button id="closeSkillModal" class="mt-8 w-full py-4 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-bold rounded-xl hover:from-primary-400 hover:to-blue-500 transition">
                    Close
                </button>
            </div>
        `;

            document.body.appendChild(modal);

            modal.querySelectorAll('.skill-card').forEach(card => {
                card.onclick = () => {
                    const id = card.dataset.id;
                    if (selectedSkills.includes(id) && selectedSkills[slotIndex] !== id) return; // already used elsewhere

                    selectedSkills[slotIndex] = id;
                    if (selectedSkills.length > 3) selectedSkills = selectedSkills.slice(0, 3);
                    if (!selectedSkills.includes(id)) selectedSkills.push(id);

                    modal.remove();
                    updateSkillSlots();
                };
            });

            modal.querySelector('#closeSkillModal').onclick = () => modal.remove();
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        };

        // === HTML ===
        startScreen.innerHTML = `
        <!-- Background -->
        <div class="absolute inset-0">
            <img src="${this.gameData.thumbnail}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/60"></div>
        </div>

        <!-- Top Bar -->
        <div class="relative z-10 flex flex-col p-4 gap-4">
            <div class="flex justify-between items-center">
                <div class="flex gap-2 items-center">
                    <button>Back icon</button>
                    <h2>${this.gameData.title}</h2>
                </div>

                <div>
                    Settings Icon
                </div>
            </div>

            <div class="flex justify-between items-start">
                <!-- Player -->
                <div class="space-y-2">
                    <div class="flex gap-2 items-center">
                        <div class="h-16 w-16 rounded-xl bg-white/10"></div>
                        <div>
                            <h2>Best Score Ever</h2>
                            <p>10,000</p>
                        </div>
                    </div>
                    <div class="flex gap-2 items-center">
                        <div class="h-16 w-16 rounded-xl bg-white/10"></div>
                        <div>
                            <h2>Last Game</h2>
                            <p>1,000</p>
                        </div>
                    </div>
                    <div class="flex gap-2 items-center p-2 rounded-xl bg-white/10">
                        <div class="h-10 w-10 rounded-md bg-white/10"></div>
                        <h2>Daily Login</h2>
                    </div>
                </div>

                <div class="flex flex-col itmes-end space-y-2">
                    <!-- Shop -->
                    <button id="shopBtn" class="btn-primary font-bold">
                        Shop
                    </button>
                    <div class="flex gap-2 items-center p-2 rounded-xl bg-white/10">
                        <div class="h-10 w-10 rounded-md bg-white/10"></div>
                        <h2>Missions</h2>
                    </div>
                    <div class="flex gap-2 items-center p-2 rounded-xl bg-white/10">
                        <div class="h-10 w-10 rounded-md bg-white/10"></div>
                        <h2>LeaderBoard</h2>
                    </div>
                    
                    <div class="flex gap-2 items-center p-2 rounded-xl bg-white/10">
                        <div class="h-10 w-10 rounded-md bg-white/10"></div>
                        <h2>Inventory</h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="relative z-10 flex justify-between items-end p-4 gap-4">
            <div>
                <!-- Selected Skills (3 slots) -->
                <div class="mb-4">
                    <div class="flex justify-center gap-2" id="skillSlots">
                        <div class="skill-slot w-22 h-22 sm:w-18 sm:h-18 bg-[#171717] border-2 border-[#353535] rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-white/80 transition">
                            <div class="text-5xl text-white/70">?</div>
                        </div>
                        <div class="skill-slot w-22 h-22 sm:w-18 sm:h-18 bg-[#171717] border-2 border-[#353535] rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-white/80 transition">
                            <div class="text-5xl text-white/70">?</div>
                       </div>
                        <div class="skill-slot w-22 h-22 sm:w-18 sm:h-18 bg-[#171717] border-2 border-[#353535] rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-white/80 transition">
                            <div class="text-5xl text-white/70">?</div>
                        </div>
                    </div>
                </div>

                <!-- Start Button -->
                <button id="startGameBtn" class="btn-primary w-full">
                    🎮 Start Game
                </button>
            </div>

            <!-- Map Grid -->
            <div class="bg-[#171717] backdrop-blur-lg border-2 border-[#353535] rounded-xl p-4 shadow-2xl">
                <h3 style="color: #ffffff; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; text-align: center;">SELECT MAP</h3>
                <div id="mapGrid" class="grid grid-cols-2 gap-3">
                    ${maps.map((map, index) => `
                        <div class="map-card cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300" 
                             data-index="${index}"
                             style="border-color: #333333; width: 100px; height: 70px;">
                            <div style="position: relative; width: 100%; height: 100%;">
                                <img src="${map.preview}" style="width: 100%; height: 100%; object-fit: cover;" alt="${map.name}" />
                                <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; align-items: flex-end; padding: 0.5rem;">
                                    <div style="font-size: 0.65rem; font-weight: 600; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${map.name}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

        // === DOM Elements ===
        const shopBtn = startScreen.querySelector('#shopBtn');
        const skillSlots = startScreen.querySelectorAll('.skill-slot');
        const startGameBtn = startScreen.querySelector('#startGameBtn');
        const mapCards = startScreen.querySelectorAll('.map-card');

        // === Event Listeners ===
        mapCards.forEach((card, index) => {
            card.onclick = () => {
                currentMapIndex = index;
                updateMapGrid();
            };

            // Hover effects for non-active maps
            card.onmouseover = () => {
                if (index !== currentMapIndex) {
                    card.style.transform = 'scale(1.02)';
                    card.style.borderColor = '#555555';
                }
            };

            card.onmouseout = () => {
                if (index !== currentMapIndex) {
                    card.style.transform = 'scale(1)';
                    card.style.borderColor = '#333333';
                }
            };
        });

        shopBtn.onclick = () => {
            this.showModal('Shop', `
            <div class="text-center">
                <p class="text-3xl mb-8">Coming Soon!</p>
                <p class="text-gray-400">Skins, trails, emotes & more...</p>
            </div>
        `);
        };

        skillSlots.forEach((slot, i) => {
            slot.onclick = () => openSkillModal(i);
        });

        startGameBtn.onclick = () => {
            this.showGameModeModal();
        };

        // Init
        updateMapGrid();
        updateSkillSlots();

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
            background: #171717;
            border: 2px solid #333333;
            border-radius: 25px;
            padding: 2.5rem;
            max-width: 600px;
            width: 90%;
        `;

        modalContent.innerHTML = `
            <h2 style="color: #ffffff; margin-bottom: 2rem; font-size: 2rem; text-align: center;">
                🎮 Select Game Mode
            </h2>
            <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem;">
                <div class="game-mode-option" data-mode="ai" style="
                    padding: 1.5rem;
                    background: #282828;
                    border: 2px solid #333333;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 2rem;">🤖</span>
                        <div style="flex: 1;">
                            <div style="font-size: 1.3rem; font-weight: bold; color: #ffffff;">
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
                    background: #282828;
                    border: 2px solid #333333;
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
                <button id="cancelBtn" class="btn">
                    Cancel
                </button>
                <button id="confirmBtn" class="btn-primary" disabled>
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

        if (this.gameName === 'slither') {
            try {
                const slitherModule = await import('../../games/slither/index.js');
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
        } else if (this.gameName === 'flappy') {
            try {
                const flappyModule = await import('../../games/flappy-bird/index.js');
                FlappyBirdGame = flappyModule.FlappyBirdGame;

                container.innerHTML = '';
                const flappyContainer = document.createElement('div');
                flappyContainer.id = 'flappyContainer';
                flappyContainer.style.cssText = 'flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden;';
                container.appendChild(flappyContainer);

                this.game = new FlappyBirdGame('flappyContainer');
                this.game.launch();
                this.gameStarted = true;
            } catch (error) {
                console.error('Error launching Flappy game:', error);
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
                        <h2 style="font-size: 2rem; color: #DF040A; margin-bottom: 1rem;">
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
        const borderColor = '#353535';
        const titleColor = '#ffffff';
        const emoji = isWinner ? '🏆' : '💀';
        const title = isWinner ? 'Victory!' : 'Game Over!';

        modalContent.style.cssText = `
            background: #171717;
            border: 3px solid ${borderColor};
            border-radius: 25px;
            padding: 3rem;
            max-width: 500px;
            width: 90%;
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
                <button id="playAgainBtn" class="btn-primary">
                    🎮 Play Again
                </button>
                <button id="backToLobbyBtn" class="btn">
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

        modalContent.querySelector('#backToLobbyBtn').onclick = () => {
            modal.remove();
            this.resetToStartScreen();
        };

        modalContent.querySelector('#playAgainBtn').onclick = () => {
            modal.remove();
            this.resetToStartScreen();
            this.showGameModeModal();
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
            background: #171717;
            border: 2px solid #333333;
            border-radius: 25px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
        `;

        modalContent.innerHTML = `
            <h2 style="color: #ffffff; margin-bottom: 1.5rem; font-size: 1.5rem;">
                ${title}
            </h2>
            <div style="margin-bottom: 2rem;">
                ${content}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="closeBtn" class="btn">
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

    resetToStartScreen() {
        this.cleanup();
        this.gameStarted = false;

        const gameContainer = this.element.querySelector('#gameContainer');
        if (gameContainer) {
            gameContainer.innerHTML = '';
            const startScreen = this.createStartScreen();
            gameContainer.appendChild(startScreen);
        }
    }

    cleanup() {
        if (this.game) {
            this.game.stop();
        }
    }
}