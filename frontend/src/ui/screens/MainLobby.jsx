import React, { useState, useEffect } from 'react';
import { Play, Users, Trophy, Star, TrendingUp, Search, Filter, ChevronRight, ChevronLeft, ArrowUpRight } from 'lucide-react';
import { usePlayer } from '../../state/PlayerContext';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

// Main Landing Page Component
export const MainLobby = () => {
  const { player } = usePlayer();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock data for "Trending" list (Right side of Hero)
  const TRENDING_GAMES = [
    { rank: 1, name: "Slither.io Arena", players: "12.5K", change: "+14%" },
    { rank: 2, name: "Flappy Royale", players: "8.2K", change: "+5%" },
    { rank: 3, name: "Cyber Chess", players: "5.1K", change: "-2%" },
    { rank: 4, name: "Neon Racer", players: "3.9K", change: "+22%" },
    { rank: 5, name: "Space Invaders", players: "2.5K", change: "+8%" }
  ];

  const FEATURED_SLIDES = [
    {
      id: 1,
      title: "Slither.io Arena",
      subtitle: "Multiplayer Snake Battle",
      image: "/assets/slither-thumb.jpg",
      tag: "Live Now",
      pool: "Play & Earn XP",
      gameId: "slither"
    },
    {
      id: 2,
      title: "Flappy Bird",
      subtitle: "Classic Arcade Challenge",
      image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2665&auto=format&fit=crop",
      tag: "Arcade",
      pool: "High Score Competition",
      gameId: "flappy"
    },
    {
      id: 3,
      title: "More Games Coming Soon",
      subtitle: "Stay Tuned for Updates",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2665&auto=format&fit=crop",
      tag: "Coming Soon",
      pool: "New Releases"
    }
  ];

  const FEATURED_COLLECTIONS = [
    { id: 1, name: "Merry Pixelmas", status: "MINTING NOW", price: "0.0007 ETH", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" },
    { id: 2, name: "AVALANCHE BATTLE PASS", status: "MINTING NOW", price: "0.00 AVX", image: "https://images.unsplash.com/photo-1635322966219-b75ed3a90164?w=800&auto=format&fit=crop" },
    { id: 3, name: "Puffy Icons", status: "MINTING NOW", price: "0.009 ETH", image: "https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=800&auto=format&fit=crop" }
  ];

  const CATEGORIES = ["All", "Action", "Strategy", "Puzzle", "Racing", "Shooter", "Sports"];

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await apiClient.getGames();
        if (response.success && response.games.length > 0) {
          setGames(response.games);
        } else {
          // Fallback if API fails/is empty
          setGames([
            { id: 'slither', title: 'Slither.io', category: 'Action', activePlayers: 1240, thumbnail: '/assets/slither-thumb.jpg' },
            { id: 'flappy', title: 'Flappy Bird', category: 'Arcade', activePlayers: 850, thumbnail: '/assets/flappy-thumb.jpg' },
            { id: 'whot', title: 'Naija Whot', category: 'Strategy', activePlayers: 540, thumbnail: '/assets/cards-thumb.jpg' },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      }
    };
    fetchGamesData();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);

  const filteredGames = activeCategory === 'All'
    ? games
    : games.filter(g => g.category === activeCategory);

  return (
    <div className="h-screen bg-[#09090B] text-white font-sans overflow-x-hidden px-6 pb-6">

      {/* Top Navigation / Search Bar */}
      <div className="sticky top-0 z-40 bg-[#09090B]/80 backdrop-blur-xl border-b border-[#27272A] -mx-6 px-8 py-4 flex items-center justify-between mb-8">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={18} />
          <input
            type="text"
            placeholder="Search games, tournaments, or players..."
            className="w-full bg-[#121215] border border-[#27272A] rounded-full pl-12 pr-4 py-3 focus:outline-none focus:border-[#FF5D2E]/50 text-sm placeholder-[#52525B] transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#52525B] text-[10px] font-mono border border-[#27272A] px-1.5 py-0.5 rounded">
            <span>CTRL</span><span>K</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-8">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121215] border border-[#27272A] rounded-lg">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-[#A1A1AA]">24,892 Online</span>
          </div>
          <button className="p-2 text-[#A1A1AA] hover:text-white bg-[#121215] border border-[#27272A] rounded-xl hover:bg-[#27272A] transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-12">

        {/* HERO SECTION: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
          {/* LEFT: Featured Carousel */}
          <div className="lg:col-span-8 relative group rounded-3xl overflow-hidden border border-[#27272A]">
            <div className="absolute inset-0">
              <img
                src={FEATURED_SLIDES[currentSlide].image}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/40 to-transparent"></div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-10 z-10 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#FF5D2E] text-black text-xs font-bold rounded uppercase tracking-wider">
                  {FEATURED_SLIDES[currentSlide].tag}
                </span>
                <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold rounded flex items-center gap-2">
                  <Trophy size={12} className="text-[#FFCE31]" />
                  {FEATURED_SLIDES[currentSlide].pool}
                </span>
              </div>
              <h2 className="text-5xl font-black mb-2 text-white drop-shadow-lg tracking-tight">
                {FEATURED_SLIDES[currentSlide].title}
              </h2>
              <p className="text-xl text-[#E4E4E7] mb-8 font-medium drop-shadow-md">
                {FEATURED_SLIDES[currentSlide].subtitle}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const slide = FEATURED_SLIDES[currentSlide];
                    if (slide.gameId) {
                      navigate(`/game/${slide.gameId}`);
                    }
                  }}
                  disabled={!FEATURED_SLIDES[currentSlide].gameId}
                  className="btn-primary"
                >
                  <Play size={20} fill="currentColor" /> {FEATURED_SLIDES[currentSlide].gameId ? 'Play Now' : 'Coming Soon'}
                </button>
                <button className="btn">
                  View Details
                </button>
              </div>
            </div>

            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 cursor-pointer z-20">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 cursor-pointer z-20">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* RIGHT: Trending List */}
          <div className="lg:col-span-4 bg-[#121215] border border-[#27272A] rounded-3xl p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Trending <TrendingUp size={18} className="text-[#FF5D2E]" />
              </h3>
              <button className="text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors">View All</button>
            </div>
            <div className="grid grid-cols-12 text-[10px] font-bold text-[#52525B] uppercase tracking-wider mb-4 px-2">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Game</div>
              <div className="col-span-3 text-right">Players</div>
              <div className="col-span-2 text-right">24h</div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
              {TRENDING_GAMES.map((game) => (
                <div key={game.rank} className="grid grid-cols-12 items-center p-3 rounded-xl hover:bg-[#18181B] transition-colors cursor-pointer group border border-transparent hover:border-[#27272A]">
                  <div className="col-span-1 font-mono text-[#A1A1AA] font-bold">{game.rank}</div>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#27272A] border border-[#3F3F46] flex flex-shrink-0 items-center justify-center overflow-hidden">
                      <span className="text-xs">🎮</span>
                    </div>
                    <span className="font-bold text-sm text-[#E4E4E7] group-hover:text-white truncate">{game.name}</span>
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-[#A1A1AA]">{game.players}</div>
                  <div className={`col-span-2 text-right font-mono text-xs font-bold ${game.change.startsWith('+') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {game.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SPOTLIGHT GAMES SECTION (New Request) */}
        <div className="rounded-[30px] p-6 bg-[#121215] border border-[#27272A]">
          <h3 className="text-xl font-bold mb-4">Spotlight Games</h3>
          <p className="text-[#A1A1AA] text-sm mb-6">Enjoy these highly curated experiences.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.slice(0, 3).map((game, index) => (
              <div
                key={game.id}
                onClick={() => navigate(`/game/${game.id}`)}
                className="relative overflow-hidden rounded-3xl border border-[#27272A] group cursor-pointer hover:border-[#FF5D2E]/50 h-[15rem] transition-all"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="/assets/slither-thumb.jpg"
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                </div>

                {/* Header Badges */}
                <div className="relative z-10 flex justify-between items-start p-6 mb-12">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFCE31] text-black rounded-full text-xs font-bold shadow-lg">
                    <Star size={12} fill="currentColor" /> Spotlight
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-full text-xs font-bold shadow-lg">
                    <TrendingUp size={12} /> {game.activePlayers || '0'}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/10">
                      {index === 0 ? '🐍' : index === 1 ? '🦅' : '🎮'}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white drop-shadow-lg">{game.title}</h4>
                      <p className="text-xs text-white/80 drop-shadow-md">{game.category}</p>
                    </div>
                  </div>
                  <button className="btn">
                    <Play size={14} fill="currentColor" /> Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURED COLLECTIONS SECTION (Highest Weekly Sales Style) */}
        <div>
          <h3 className="text-xl font-bold mb-4">Featured Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_COLLECTIONS.map((item) => (
              <div key={item.id} className="group relative h-64 rounded-2xl overflow-hidden border border-[#27272A] cursor-pointer">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#10B981] text-black text-[10px] font-bold rounded mb-2">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
                    {item.status}
                  </div>
                  <h4 className="text-xl font-bold mb-1 group-hover:text-[#FF5D2E] transition-colors">{item.name}</h4>
                  <div className="text-sm font-mono text-[#A1A1AA]">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
