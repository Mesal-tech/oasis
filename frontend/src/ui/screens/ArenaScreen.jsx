import React, { useState } from 'react';
import { Trophy, Users, Clock, Plus, Zap, Target, Lock, Crosshair, ChevronRight } from 'lucide-react';
import { usePlayer } from '../../state/PlayerContext';

export const ArenaScreen = () => {
  const { player } = usePlayer();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Arenas' },
    { id: 'open', label: 'Open' },
    { id: 'live', label: 'Live Now' },
    { id: 'my', label: 'My Arenas' },
  ];

  const tournaments = [
    {
      id: 1,
      title: 'Weekly Snake Championship',
      type: 'STRATEGY • 1V1',
      status: 'LIVE',
      prizePool: '500 USDC',
      entryFee: '50 USDC',
      players: 24,
      maxPlayers: 50,
      timeRemaining: '02:15:44',
      filled: 48,
    },
    {
      id: 2,
      title: 'Midnight Blackout',
      type: 'FPS • TEAM',
      status: 'OPEN',
      prizePool: '1,200 USDC',
      entryFee: '100 USDC',
      players: 8,
      maxPlayers: 20, // Teams * players
      timeRemaining: 'Starts in 12h',
      filled: 40,
    },
    {
      id: 3,
      title: 'Grid Master 3000',
      type: 'PUZZLE • SOLO',
      status: 'FILLING FAST',
      prizePool: '250 USDC',
      entryFee: '10 USDC',
      players: 92,
      maxPlayers: 100,
      timeRemaining: 'Starts in 45m',
      filled: 92,
    },
    {
      id: 4,
      title: 'Iron Gauntlet V',
      type: 'STRATEGY • FFA',
      status: 'LOCKED',
      prizePool: '5,000 USDC',
      entryFee: '500 USDC',
      players: 16,
      maxPlayers: 16,
      timeRemaining: 'Locked',
      filled: 100,
      locked: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8 overflow-y-auto font-sans flex gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[#FF5D2E] text-sm font-bold mb-2">
            <Users size={16} /> / Competitive
          </div>
          <h1 className="text-4xl font-bold mb-3">Competitive Arenas</h1>
          <p className="text-[#A1A1AA] max-w-xl">
            Join high-stakes battles. Compete for USDC prizes in real-time strategy arenas.
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedFilter === filter.id
                    ? 'bg-[#FF5D2E] text-black'
                    : 'bg-[#18181B] text-[#71717A] border border-[#27272A] hover:border-[#3F3F46]'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#18181B] border border-[#FF5D2E] text-[#FF5D2E] text-xs font-bold rounded-lg hover:bg-[#FF5D2E]/10 transition-colors">
            <Plus size={16} /> Create Tournament
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {tournaments.map((tourney) => (
            <div key={tourney.id} className="bg-[#121215] border border-[#27272A] rounded-xl p-6 group hover:border-[#3F3F46] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                  {tourney.type}
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded bg-[#18181B] border border-[#27272A] ${tourney.status === 'LIVE' ? 'text-white bg-[#FF5D2E]' : 'text-[#71717A]'
                  }`}>
                  {tourney.status}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-6">{tourney.title}</h3>

              <div className="flex justify-between mb-6 pb-6 border-b border-[#27272A]">
                <div>
                  <p className="text-[#71717A] text-xs font-bold mb-1">Prize Pool</p>
                  <p className="text-white text-lg font-bold">{tourney.prizePool}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#71717A] text-xs font-bold mb-1">Entry Fee</p>
                  <p className="text-white text-lg font-bold">{tourney.entryFee}</p>
                </div>
              </div>

              <div className="flex justify-between items-end mb-2 text-xs font-bold">
                <span className="text-[#A1A1AA]">{tourney.players}/{tourney.maxPlayers} Players</span>
                <span className="text-[#52525B]">{tourney.filled}% Full</span>
              </div>
              <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-[#FF5D2E] rounded-full"
                  style={{ width: `${tourney.filled}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[#71717A] text-xs font-bold flex items-center gap-2">
                  {tourney.status === 'LIVE' ? <Clock size={14} className="animate-pulse text-[#FF5D2E]" /> : <Clock size={14} />}
                  {tourney.timeRemaining}
                </div>
                {tourney.locked ? (
                  <div className="flex items-center gap-2 text-[#52525B] text-xs font-bold px-4 py-2 bg-[#18181B] rounded-lg">
                    <Lock size={14} /> Locked
                  </div>
                ) : (
                  <button className="px-6 py-2 border border-[#27272A] bg-[#18181B] text-white text-xs font-bold rounded-lg hover:border-[#FF5D2E] hover:text-[#FF5D2E] transition-all">
                    Join Arena
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar - Featured Tournament */}
      <div className="w-[360px] hidden lg:block">
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 sticky top-8">
          <div className="w-12 h-12 bg-[#27272A] rounded-xl flex items-center justify-center text-[#FF5D2E] mb-6 mx-auto">
            <Trophy size={24} />
          </div>

          <div className="text-center mb-6">
            <div className="bg-[#FF5D2E] text-black text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-3">FEATURED</div>
            <h2 className="text-2xl font-bold mb-2">Weekly Snake Championship</h2>
            <p className="text-[#71717A] text-xs">Hosted by <span className="text-[#FF5D2E]">@ArenaMaster</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 text-center">
              <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-wider mb-1">Entry</p>
              <p className="text-white font-bold text-lg">5 USDC</p>
            </div>
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 text-center bg-[#FF5D2E]/5 border-[#FF5D2E]/20">
              <p className="text-[#FF5D2E] text-[10px] font-bold uppercase tracking-wider mb-1">Pool</p>
              <p className="text-[#FF5D2E] font-bold text-lg">500 USDC</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider mb-4">Prize Distribution</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF5D2E] text-black flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-white font-medium">1st Place (50%)</span>
                </div>
                <span className="text-white font-bold">250 USDC</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#27272A] text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-[#A1A1AA] font-medium">2nd Place (30%)</span>
                </div>
                <span className="text-[#A1A1AA] font-bold">150 USDC</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#27272A] text-white flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-[#A1A1AA] font-medium">3rd Place (20%)</span>
                </div>
                <span className="text-[#A1A1AA] font-bold">100 USDC</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider">Participants</p>
              <p className="text-[#A1A1AA] text-xs">24/50 Joined</p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#27272A] border-2 border-[#121215]"></div>
              ))}
              <div className="w-8 h-8 rounded-full bg-[#18181B] border-2 border-[#121215] flex items-center justify-center text-[10px] font-bold text-[#A1A1AA]">
                +19
              </div>
            </div>
          </div>

          <div className="bg-[#18181B] rounded-xl p-4 mb-6">
            <p className="text-[#71717A] text-xs leading-relaxed">
              Single elimination bracket. Each match is 5 minutes. Top 3 players advance to Grand Finals. Standard ruleset applied. No items allowed.
            </p>
          </div>

          <button className="w-full py-4 bg-[#FF5D2E] text-black font-bold rounded-xl hover:bg-[#ff7a52] transition-colors shadow-lg shadow-[#FF5D2E]/20">
            Join Tournament
          </button>
        </div>
      </div>
    </div>
  );
};
