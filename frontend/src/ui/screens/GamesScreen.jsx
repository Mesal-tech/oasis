import React, { useState, useEffect } from 'react';
import { Search, Filter, Gamepad2, Play, Users, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export const GamesScreen = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ["All", "Action", "Strategy", "Puzzle", "Racing", "Arcade", "Shooter", "Sports"];

  useEffect(() => {
    // Reuse fetch logic or implement dedicated endpoint
    const fetchGamesData = async () => {
      try {
        const response = await apiClient.getGames();
        // Add extended library of games for the dedicated page to look full
        if (response.success && response.games.length > 0) {
          setGames(response.games);
        } else {
          // Fallback
          setGames([
            { id: 'slither', name: 'Slither.io', category: 'Action', activePlayers: 1240, thumbnail: 'https://images.unsplash.com/photo-1628277613967-6abc2926b568?w=800&auto=format&fit=crop' },
            { id: 'flappy', name: 'Flappy Bird', category: 'Arcade', activePlayers: 850, thumbnail: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&auto=format&fit=crop' },
            { id: 'chess', name: 'Cyber Chess', category: 'Strategy', activePlayers: 540, thumbnail: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop' },
            { id: 'racer', name: 'Neon Racer', category: 'Racing', activePlayers: 3200, thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop' },
            { id: 'space', name: 'Space Invaders', category: 'Arcade', activePlayers: 2500, thumbnail: 'https://images.unsplash.com/photo-1614726365723-498aa59ef5de?w=800&auto=format&fit=crop' },
            { id: 'pong', name: 'Neon Pong', category: 'Arcade', activePlayers: 1100, thumbnail: 'https://images.unsplash.com/photo-1616499370260-485b3e5ed6fb?w=800&auto=format&fit=crop' },
            { id: 'tetris', name: 'Block Master', category: 'Puzzle', activePlayers: 4500, thumbnail: 'https://images.unsplash.com/photo-1605389445173-678096312a02?w=800&auto=format&fit=crop' },
            { id: 'sudoku', name: 'Sudoku Pro', category: 'Puzzle', activePlayers: 800, thumbnail: 'https://images.unsplash.com/photo-1640537063189-509f7a77b846?w=800&auto=format&fit=crop' }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch games", error);
      }
    };
    fetchGamesData();
  }, []);

  const filteredGames = games.filter(game => {
    if (!game || !game.name) return false;
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Gamepad2 size={32} className="text-[#FF5D2E]" /> Games Library
        </h1>
        <p className="text-[#A1A1AA]">Browse our complete collection of arcade and strategy games.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 sticky top-0 bg-[#09090B]/95 backdrop-blur z-30 py-4 border-b border-[#27272A]">
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
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat
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
            <div key={game?.id || idx} onClick={() => navigate(`/game/${game.id}`)} className="bg-[#121215] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#3F3F46] hover:-translate-y-1 transition-all duration-300 group cursor-pointer shadow-none hover:shadow-2xl hover:shadow-[#FF5D2E]/5">
              <div className="relative h-48 bg-[#18181B] overflow-hidden">
                <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button className="px-6 py-2 bg-[#FF5D2E] text-black font-bold text-xs rounded-lg transform scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-[#FF5D2E]/50">
                    Play Now
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-base group-hover:text-[#FF5D2E] transition-colors">{game?.name}</h4>
                  <div className="text-[10px] bg-[#27272A] text-[#A1A1AA] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    {game?.category}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#27272A]">
                  <div>
                    <div className="text-[10px] text-[#52525B] font-bold uppercase mb-0.5">Active Players</div>
                    <div className="text-sm font-mono font-bold text-[#E4E4E7] flex items-center gap-1.5">
                      <Users size={12} className="text-[#A1A1AA]" />
                      {(game?.activePlayers || 0).toLocaleString()}
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
  );
};
