// ===== frontend/src/ui/screens/MainLobby/MainLobby.js =====
import { createElement, createIcons, User, Sparkles, ChevronDown, LogOut, Settings, Wallet } from 'lucide';
import { router } from '../../../router.js';
import GAMES from '../../../config/games.js';

createIcons({
  icons: {
    User, Sparkles, ChevronDown, LogOut, Settings, Wallet
  }
});

export class MainLobby {
  constructor() {
    this.currentFilter = 'all';
    this.games = GAMES;
    this.element = null;
    this.dropdownOpen = false;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'min-h-screen overflow-y-auto';

    this.element.innerHTML = `
      <!-- HEADER -->
      <header class="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-end">
          <div class="flex items-center gap-4">
            <button class="md:hidden"><span class="menu-icon text-white text-2xl"></span></button>
            <button class="relative p-2 hover:bg-white/10 rounded-full transition-all">
              <span class="bell-icon text-white"></span>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <!-- User Profile Button -->
            <div class="relative user-dropdown-container">
              <button class="user-profile-btn flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full p-1 md:pl-2 md:pr-4 md:py-1 border border-white/20 hover:bg-white/15 transition-all">
                <div class="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
                <div class="hidden md:block text-left">
                  <p class="text-white font-semibold text-sm">Sal</p>
                  <p class="text-white/60 text-xs">Level 42 • 92K XP</p>
                </div>
              </button>

              <!-- Mobile Dropdown Menu -->
              <div class="user-dropdown absolute right-0 top-full mt-2 w-72 opacity-0 invisible pointer-events-none transition-all duration-300 transform origin-top-right scale-95">
                <div class="bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                  <!-- User Info -->
                  <div class="p-6 border-b border-white/10">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="relative">
                        <div class="w-16 h-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          S
                        </div>
                        <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                          <span class="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-white">Sal</h3>
                        <p class="text-white/60 text-sm">0xabcd...sal</p>
                      </div>
                    </div>

                    <!-- Stats -->
                    <div class="space-y-2">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-white/70">Level</span>
                        <span class="text-white font-semibold">42</span>
                      </div>
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-white/70">XP</span>
                        <span class="text-white font-semibold">92,000</span>
                      </div>
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-white/70">Rank</span>
                        <span class="bg-gradient-to-r from-amber-700 to-yellow-500 text-black px-2 py-0.5 rounded-full font-bold text-xs">Bronze</span>
                      </div>
                    </div>
                  </div>

                  <!-- Balance -->
                  <div class="p-4 border-b border-white/10 bg-gray-800/50">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="wallet-icon text-yellow-400"></span>
                      <span class="text-white/70 text-sm">Balance</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span class="bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-xs">10 USDC</span>
                      <span class="bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-xs">9,234 EXP</span>
                      <span class="bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-xs">599 stch</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="p-2">
                    <button class="settings-btn w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <span class="settings-icon"></span>
                      <span class="font-medium">Settings</span>
                    </button>
                    <button class="logout-btn w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                      <span class="logout-icon"></span>
                      <span class="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- PLAYER DETAILS SECTION -->
      <section class="relative min-h-[55vh] px-6 flex flex-col items-center justify-end">
        <!-- Background decorative -->
        <div class="absolute top-0 w-full p-4">
          <div class="h-[15rem] rounded-[20px] bg-white overflow-hidden">
            <img src="/assets/stitch-bg.png" alt="bg" class="w-full h-full object-cover" />
          </div>
        </div>

        <div class="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- Player Info Card -->
          <div class="md:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="w-18 h-18 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  S
                </div>
                <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
                  <span class="text-white text-xs">✓</span>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold text-white">Sal</h3>
                <p class="text-white/60 text-sm">0xabcd...sal</p>
              </div>
            </div>

            <!-- Rank Badge -->
            <div class="mt-6 flex items-center justify-between">
              <div class="flex flex-col items-center gap-1">
                <span class="">42/100</span>
              </div>
              <span class="bg-gradient-to-r from-amber-700 to-yellow-500 text-black px-2 py-1 rounded-full font-bold text-sm">
                Bronze
              </span>
            </div>

            <div class="mt-2 flex items-center gap-2">
              <span class="bg-white/30 border-white/10 truncate text-white px-2 py-1 rounded-full font-bold text-sm">
                10 USDC
              </span>
              <span class="bg-white/30 border-white/10 truncate text-white px-2 py-1 rounded-full font-bold text-sm">
                9,234 EXP
              </span>
              <span class="bg-white/30 border-white/10 truncate text-white px-2 py-1 rounded-full font-bold text-sm">
                599 stch
              </span>
            </div>
          </div>

          <!-- Player Journey / Progress Card -->
          <div class="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-2xl font-bold text-white">Your Journey</h3>
              </div>
              <div class="sparkles-icon text-cyan-400 text-3xl"></div>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span class="text-white/80">Next reward:</span>
                <span class="text-cyan-400 font-bold">87/100</span>
              </div>

              <div class="relative h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 blur-xl"></div>
                <div class="relative h-full w-[87%] bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-end pr-4 transition-all duration-1000 ease-out">
              </div>
            </div>

            <!-- Next Milestone -->
            <button class="btn-primary">
              Buy Premium pass to get extra rewards
           </button>
          </div>
        </div>
      </section>

      <div class="max-w-5xl mx-auto py-12 px-5">
        <!-- Spotlight Games Section -->
        <div class="bg-[#1d1d1d] p-6 rounded-[30px]">
          <div class="w-full flex items-start md:items-center justify-between mb-12 gap-8">
            <div>
              <h2 class="text-lg md:text-3xl font-semi-bold tracking-tighter text-white">
                Spotlight Games
              </h2>
              <p class="text-white/70 text-sm md:text-lg">Enjoy these highly curated Games.</p>
            </div>

            <button class="bg-white text-black text-xs font-bold py-2 px-4 font-bold cursor-pointer hover:bg-white/70 rounded-full active:scale-98 transition-all duration-300 transform hover:-translate-y-1">
              Explore
            </button>
          </div>

          <!-- Games Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="gameGrid"></div>
        </div>
      </div>
    `;

    this.setupDropdown();
    this.renderGames();

    return this.element;
  }

  setupDropdown() {
    const profileBtn = this.element.querySelector('.user-profile-btn');
    const dropdown = this.element.querySelector('.user-dropdown');

    // Insert icons
    this.insertIcon('.wallet-icon', createElement(Wallet, { size: 16 }));
    this.insertIcon('.settings-icon', createElement(Settings, { size: 18 }));
    this.insertIcon('.logout-icon', createElement(LogOut, { size: 18 }));

    // Toggle dropdown
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdownOpen = !this.dropdownOpen;

      if (this.dropdownOpen) {
        dropdown.classList.remove('opacity-0', 'invisible', 'pointer-events-none', 'scale-95');
        dropdown.classList.add('opacity-100', 'visible', 'pointer-events-auto', 'scale-100');
      } else {
        dropdown.classList.add('opacity-0', 'invisible', 'pointer-events-none', 'scale-95');
        dropdown.classList.remove('opacity-100', 'visible', 'pointer-events-auto', 'scale-100');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.element.querySelector('.user-dropdown-container').contains(e.target)) {
        if (this.dropdownOpen) {
          dropdown.classList.add('opacity-0', 'invisible', 'pointer-events-none', 'scale-95');
          dropdown.classList.remove('opacity-100', 'visible', 'pointer-events-auto', 'scale-100');
          this.dropdownOpen = false;
        }
      }
    });

    // Dropdown action handlers
    this.element.querySelector('.settings-btn').addEventListener('click', () => {
      console.log('Navigate to settings');
      // router.navigateTo('settings');
    });

    this.element.querySelector('.logout-btn').addEventListener('click', () => {
      console.log('Logout');
      // userStore.logout();
    });
  }

  renderGames() {
    const grid = this.element.querySelector('#gameGrid');
    grid.innerHTML = '';

    const filteredGames = this.currentFilter === 'all'
      ? this.games
      : this.games.filter(game => game.category === this.currentFilter);

    filteredGames.forEach(game => {
      const card = document.createElement('div');
      card.className = `
        group relative h-56 rounded-2xl overflow-hidden
        border border-white/10 shadow-2xl
        cursor-pointer transform-gpu
        transition-all duration-500
        hover:scale-105 hover:shadow-white/5 hover:border-white/15
      `;

      card.style.backgroundImage = `url('${game.thumbnail}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';

      card.innerHTML = `
        <div class="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent transition-all duration-500"></div>

        <div class="relative h-full flex flex-col justify-between p-4 text-white z-10">
          <div class="w-full flex justify-end text-sm">
            <span class="bg-black/80 bg-blur-sm py-1 px-2 rounded-full flex items-center gap-2">
              <span class="user-icon"></span>
              <span class="text-xs font-semibold">${game.players.toLocaleString()} Playing</span>
            </span>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between bg-white/20 backdrop-blur-sm p-2 rounded-[15px] ">
              <div class="flex items-center gap-2">
                <span class="bg-black/50 p-2 flex items-center justify-center rounded-[5px]">
                  ${game.icon}
                </span>
                <div>
                  <h3 class="text-xs font-semi-bold drop-shadow-lg">
                    ${game.title}
                  </h3>
                  <span class="text-xs font-semibold">
                    ${game.category.toUpperCase()}
                  </span>
                </div>
              </div>

              <button class="play-btn px-4 py-2 rounded-full text-xs font-bold text-black
                bg-white hover:bg-white/70 active:scale-98
                transition-all duration-300 transform hover:-translate-y-1">
                Play Now
              </button>
            </div>
          </div>
        </div>
      `;

      const userIcon = createElement(User, {
        size: 5,
        class: 'text-[10rem] font-semibold transition-transform'
      });

      card.querySelector('.user-icon').appendChild(userIcon);

      const navigate = async () => {
        console.log(`Launching game: ${game.title} (ID: ${game.id})`);
        router.navigate('/game/' + game.id);
      };

      card.addEventListener('click', navigate);
      card.querySelector('.play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        navigate();
      });

      grid.appendChild(card);
    });
  }

  insertIcon(selector, iconElement) {
    const container = this.element.querySelector(selector);
    if (container) container.appendChild(iconElement);
  }

  cleanup() {
    this.element = null;
  }
}