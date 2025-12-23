import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sparkles, LogOut, Settings, Wallet } from 'lucide-react';
import GAMES from '../../config/games.js';

export const MainLobby = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => setDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Simple check if clicking outside logic handled largely by the event propagation, 
      // but adding global listener is safer for "click outside" behavior
      if (dropdownOpen && !e.target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const filteredGames = currentFilter === 'all'
    ? GAMES
    : GAMES.filter(game => game.category === currentFilter);

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-end">
          {/* User Profile Button */}
          <div className="relative user-dropdown-container">
            <button
              onClick={toggleDropdown}
              className="user-profile-btn flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full p-1 md:pl-2 md:pr-4 md:py-1 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
              <div className="hidden md:block text-left">
                <p className="text-white font-semibold text-sm">Sal</p>
                <p className="text-white/60 text-xs">Level 42 • 92K XP</p>
              </div>
            </button>

            {/* Mobile Dropdown Menu */}
            <div className={`
                                user-dropdown absolute right-0 top-full mt-2 w-72 
                                transition-all duration-300 transform origin-top-right
                                ${dropdownOpen ? 'opacity-100 visible pointer-events-auto scale-100' : 'opacity-0 invisible pointer-events-none scale-95'}
                            `}>
              <div className="bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                {/* User Info */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        S
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Sal</h3>
                      <p className="text-white/60 text-sm">0xabcd...sal</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Level</span>
                      <span className="text-white font-semibold">42</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">XP</span>
                      <span className="text-white font-semibold">92,000</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Rank</span>
                      <span className="bg-gradient-to-r from-amber-700 to-yellow-500 text-black px-2 py-0.5 rounded-full font-bold text-xs">Bronze</span>
                    </div>
                  </div>
                </div>

                {/* Balance */}
                <div className="p-4 border-b border-white/10 bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={16} className="text-yellow-400" />
                    <span className="text-white/70 text-sm">Balance</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-xs">10 USDC</span>
                    <span className="bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-xs">9,234 EXP</span>
                    <span className="bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-xs">599 stch</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button className="settings-btn w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    <Settings size={18} />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button className="logout-btn w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PLAYER DETAILS SECTION */}
      <section className="relative min-h-[55vh] px-6 flex flex-col items-center justify-end">
        {/* Background decorative */}
        <div className="absolute top-0 w-full p-4">
          <div className="h-[15rem] rounded-[20px] bg-white overflow-hidden">
            <img src="/assets/stitch-bg.png" alt="bg" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Player Info Card */}
          <div className="md:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-18 h-18 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  S
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Sal</h3>
                <p className="text-white/60 text-sm">0xabcd...sal</p>
              </div>
            </div>

            {/* Rank Badge */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex flex-col items-center gap-1">
                <span className="">42/100</span>
              </div>
              <span className="bg-gradient-to-r from-amber-700 to-yellow-500 text-black px-2 py-1 rounded-full font-bold text-sm">
                Bronze
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="bg-white/30 border-white/10 truncate text-white px-2 py-1 rounded-full font-bold text-sm">
                10 USDC
              </span>
              <span className="bg-white/30 border-white/10 truncate text-white px-2 py-1 rounded-full font-bold text-sm">
                9,234 EXP
              </span>
              <span className="bg-white/30 border-white/10 truncate text-white px-2 py-1 rounded-full font-bold text-sm">
                599 stch
              </span>
            </div>
          </div>

          {/* Player Journey / Progress Card */}
          <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Your Journey</h3>
              </div>
              <Sparkles className="text-cyan-400 w-8 h-8" />
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Next reward:</span>
                <span className="text-cyan-400 font-bold">87/100</span>
              </div>

              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 blur-xl"></div>
                <div className="relative h-full w-[87%] bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-end pr-4 transition-all duration-1000 ease-out">
                </div>
              </div>
            </div>

            {/* Next Milestone */}
            <button className="btn-primary mt-6">
              Buy Premium pass to get extra rewards
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto py-12 px-5">
        {/* Spotlight Games Section */}
        <div className="bg-[#1d1d1d] p-6 rounded-[30px]">
          <div className="w-full flex items-start md:items-center justify-between mb-12 gap-8">
            <div>
              <h2 className="text-lg md:text-3xl font-semi-bold tracking-tighter text-white">
                Spotlight Games
              </h2>
              <p className="text-white/70 text-sm md:text-lg">Enjoy these highly curated Games.</p>
            </div>

            <button className="bg-white text-black text-xs font-bold py-2 px-4 cursor-pointer hover:bg-white/70 rounded-full active:scale-98 transition-all duration-300 transform hover:-translate-y-1">
              Explore
            </button>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="gameGrid">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => navigate(`/game/${game.id}`)}
                className="
                                    group relative h-56 rounded-2xl overflow-hidden
                                    border border-white/10 shadow-2xl
                                    cursor-pointer transform-gpu
                                    transition-all duration-500
                                    hover:scale-105 hover:shadow-white/5 hover:border-white/15
                                "
                style={{
                  backgroundImage: `url('${game.thumbnail}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent transition-all duration-500"></div>

                <div className="relative h-full flex flex-col justify-between p-4 text-white z-10">
                  <div className="w-full flex justify-end text-sm">
                    <span className="bg-black/80 backdrop-blur-sm py-1 px-2 rounded-full flex items-center gap-2">
                      <User size={12} />
                      <span className="text-xs font-semibold">{game.players.toLocaleString()} Playing</span>
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm p-2 rounded-[15px] ">
                      <div className="flex items-center gap-2">
                        <span className="bg-black/50 p-2 flex items-center justify-center rounded-[5px]">
                          <span className="text-xl">{game.icon}</span>
                        </span>
                        <div>
                          <h3 className="text-xs font-semi-bold drop-shadow-lg">
                            {game.title}
                          </h3>
                          <span className="text-xs font-semibold">
                            {game.category.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <button className="play-btn px-4 py-2 rounded-full text-xs font-bold text-black
                                                bg-white hover:bg-white/70 active:scale-98
                                                transition-all duration-300 transform hover:-translate-y-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/game/${game.id}`);
                        }}
                      >
                        Play Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
