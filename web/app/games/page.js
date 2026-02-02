'use client';

import React, { useState, useEffect } from 'react';
import { Search, Gamepad2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Games() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ["All", "Action", "Strategy", "Puzzle", "Racing", "Arcade", "Shooter", "Sports"];

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await fetch('/api/games');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.games.length > 0) {
                setGames(data.games);
            } else {
                 setGames([]); // If API returns empty, UI will show "No games found". Could fallback if preferred.
            }
        }
      } catch (error) {
        console.error("Failed to fetch games", error);
      }
    };
    fetchGamesData();
  }, []);

  const filteredGames = games.filter(game => {
    // Game title might be in 'title' (from API) or 'name' (if using fallback from original)
    // The API route currently returns 'title'. But the original GamesScreen used 'name' if falling back.
    // Let's support both for robustness during migration.
    const gameName = game.title || game.name;
    if (!gameName) return false;
    
    // Check Category
    // API returns 'category' in lowercase usually? Original had capitalized.
    // Let's normalize.
    const gameCat = (game.category || '').toLowerCase();
    const activeCat = activeCategory.toLowerCase();
    
    const matchesCategory = activeCategory === 'All' || gameCat === activeCat;
    const matchesSearch = gameName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 lg:mb-10 pt-20 md:pt-6">
          <div className="flex items-center gap-2 text-[#FF5D2E] text-sm font-bold mb-2">
            <Gamepad2 size={16} /> / Games
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Games Library</h1>
          <p className="text-[#A1A1AA] text-sm lg:text-base">Browse our complete collection of arcade and strategy games.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-10 sticky top-16 md:top-0 bg-[#09090B]/95 backdrop-blur z-30 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-[#27272A]">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={18} />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121215] border border-[#27272A] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#FF5D2E]/50 text-sm placeholder-[#52525B]"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border min-w-fit ${activeCategory === cat
                  ? 'bg-white text-black border-white'
                  : 'bg-[#121215] text-[#71717A] border-[#27272A] hover:bg-[#18181B] hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredGames.length > 0 ? (
            filteredGames.map((game, idx) => (
              <div
                key={game?.id || idx}
                onClick={() => router.push(`/game/${game.id}`)}
                className="bg-[#121215] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#3F3F46] hover:-translate-y-1 transition-all duration-300 group cursor-pointer shadow-none hover:shadow-2xl hover:shadow-[#FF5D2E]/5"
              >
                <div className="relative h-48 bg-[#18181B] overflow-hidden">
                  <img
                    src={game.thumbnail || '/assets/slither-thumb.jpg'} // Fallback img
                    alt={game.title || game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button className="px-6 py-2 bg-[#FF5D2E] text-black font-bold text-xs rounded-lg transform scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-[#FF5D2E]/50">
                      Play Now
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-base group-hover:text-[#FF5D2E] transition-colors line-clamp-1">
                      {game?.title || game?.name}
                    </h4>
                    <div className="text-[10px] bg-[#27272A] text-[#A1A1AA] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0">
                      {game?.category}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#27272A]">
                    <div>
                      <div className="text-[10px] text-[#52525B] font-bold uppercase mb-0.5">Active Players</div>
                      <div className="text-sm font-mono font-bold text-[#E4E4E7] flex items-center gap-1.5">
                        <Users size={12} className="text-[#A1A1AA]" />
                        {(game?.activePlayers || game?.players || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-[#71717A]">
              <Gamepad2 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold">No games found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
