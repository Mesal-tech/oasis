'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Crown } from 'lucide-react';
import { usePlayer } from '../providers/PlayerProvider';

export default function Leaderboard() {
  const { player } = usePlayer();
  const [activeTab, setActiveTab] = useState('global');
  const [selectedGame, setSelectedGame] = useState('all');
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [gameLeaderboard, setGameLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
    fetchLeaderboards();
  }, []);

  useEffect(() => {
    if (activeTab === 'game' && selectedGame !== 'all') {
      fetchGameLeaderboard(selectedGame);
    }
  }, [selectedGame, activeTab]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
            // Filter games that actually support leaderboards if necessary, or just use all
           setGames(data.games);
        }
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard/global?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
            // Adapt format if necessary. The API likely returns { entries: [...] }
            // Let's assume API returns array in 'leaderboard' or 'entries'
             const entries = data.leaderboard || data.entries || [];
             const normalizedData = entries.map(p => ({
              player: p.player || p, // Handle structure variations
              xp: p.xp || p.totalXp, // Use correct field
              score: p.xp || p.totalXp, // Normalize score
              rank: p.rank
            }));
            setGlobalLeaderboard(normalizedData);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leaderboards:', error);
      setLoading(false);
    }
  };

  const fetchGameLeaderboard = async (gameId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard/${gameId}`);
      if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const entries = data.leaderboard || data.entries || [];
             // Normalize based on what the API actually returns (ArenaPlayer?)
             // Assuming API /api/leaderboard/[gameId] returns leaderboard entries
             setGameLeaderboard(entries);
          }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch game leaderboard:', error);
      setLoading(false);
    }
  };

  const displayData = activeTab === 'global' ? globalLeaderboard : gameLeaderboard;
  const topThree = displayData.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#09090B] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-12 overflow-y-auto w-full pt-20 md:pt-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#FF5D2E] text-sm font-bold mb-2">
              <ShoppingBag size={16} /> / Store
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-[#A1A1AA] text-sm sm:text-base">Compete for glory and exclusive rewards.</p>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-[#121215] p-1 rounded-xl border border-[#27272A] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'global'
                ? 'bg-[#FF5D2E] text-black shadow-lg'
                : 'text-[#71717A] hover:text-white'
                }`}
            >
              Global Ranking
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'game'
                ? 'bg-[#FF5D2E] text-black shadow-lg'
                : 'text-[#71717A] hover:text-white'
                }`}
            >
              Game Specific
            </button>
          </div>
        </div>

        {/* Game Selector - Only on Game tab */}
        {activeTab === 'game' && (
          <div className="mb-8 flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {[{ id: 'all', title: 'All Games' }, ...games].map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-5 py-2.5 border rounded-full text-xs font-bold whitespace-nowrap transition-all min-w-fit ${selectedGame === game.id
                  ? 'bg-white text-black border-white'
                  : 'bg-[#121215] text-[#71717A] border-[#27272A] hover:border-[#52525B]'
                  }`}
              >
                {game.title || game.name}
              </button>
            ))}
          </div>
        )}

        {/* Podium Section */}
        {!loading && topThree.length > 0 && (
          <div className="mb-12 sm:mb-16">
            {/* Desktop: Horizontal podium */}
            <div className="hidden sm:flex sm:max-w-3xl mx-auto items-end justify-center gap-6">
              {/* 2nd */}
              {topThree[1] && (
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#18181B] border-2 border-[#52525B] flex items-center justify-center text-2xl font-bold text-[#A1A1AA] mb-2 shadow-[0_0_20px_rgba(82,82,91,0.2)]">
                      {topThree[1].player?.username?.[0] || '?'}
                    </div>
                    <div className="px-3 py-1 bg-[#52525B] rounded text-[10px] font-bold tracking-wider">#2</div>
                  </div>
                  <div className="text-center mb-4">
                    <div className="font-bold">{topThree[1].player?.username || 'Unknown'}</div>
                    <div className="text-[#FF5D2E] font-mono text-sm">{topThree[1].score?.toLocaleString()}</div>
                  </div>
                  <div className="w-24 h-32 bg-gradient-to-b from-[#52525B]/20 to-transparent rounded-t-xl border-x border-t border-[#52525B]/30"></div>
                </div>
              )}

              {/* 1st */}
              {topThree[0] && (
                <div className="flex flex-col items-center z-10">
                  <div className="mb-6 flex flex-col items-center relative">
                    <Crown className="absolute -top-8 text-[#FFCE31] drop-shadow-[0_0_10px_rgba(255,206,49,0.5)]" size={32} fill="currentColor" />
                    <div className="w-28 h-28 rounded-3xl bg-[#18181B] border-4 border-[#FF5D2E] flex items-center justify-center text-4xl font-bold text-white mb-2 shadow-[0_0_40px_rgba(255,93,46,0.3)]">
                      {topThree[0].player?.username?.[0] || '?'}
                    </div>
                    <div className="px-4 py-1.5 bg-[#FF5D2E] text-black rounded text-xs font-bold tracking-wider">#1 CHAMPION</div>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-xl font-bold">{topThree[0].player?.username || 'Unknown'}</div>
                    <div className="text-[#FF5D2E] font-mono font-bold text-lg">{topThree[0].score?.toLocaleString()}</div>
                  </div>
                  <div className="w-32 h-44 bg-gradient-to-b from-[#FF5D2E]/20 to-transparent rounded-t-2xl border-x border-t border-[#FF5D2E]/30 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full h-1 bg-[#FF5D2E]"></div>
                  </div>
                </div>
              )}

              {/* 3rd */}
              {topThree[2] && (
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#18181B] border-2 border-[#71717A] flex items-center justify-center text-2xl font-bold text-[#71717A] mb-2">
                     {topThree[2].player?.username?.[0] || '?'}
                    </div>
                    <div className="px-3 py-1 bg-[#27272A] border border-[#71717A] rounded text-[10px] font-bold tracking-wider text-[#A1A1AA]">#3</div>
                  </div>
                  <div className="text-center mb-4">
                    <div className="font-bold text-[#A1A1AA]">{topThree[2].player?.username || 'Unknown'}</div>
                    <div className="text-[#71717A] font-mono text-sm">{topThree[2].score?.toLocaleString()}</div>
                  </div>
                  <div className="w-24 h-24 bg-gradient-to-b from-[#27272A]/50 to-transparent rounded-t-xl border-x border-t border-[#27272A]"></div>
                </div>
              )}
            </div>

            {/* Mobile: Vertical podium cards */}
            <div className="sm:hidden grid grid-cols-1 gap-6 max-w-md mx-auto">
              {topThree.map((entry, idx) => (
                <div key={idx} className={`relative bg-[#121215] border rounded-2xl p-6 text-center ${idx === 0 ? 'border-[#FF5D2E] shadow-lg shadow-[#FF5D2E]/20' : 'border-[#27272A]'}`}>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    {idx === 0 && <Crown className="text-[#FFCE31] drop-shadow-lg" size={28} fill="currentColor" />}
                    <div className={`px-4 py-1 rounded-full text-xs font-bold ${idx === 0 ? 'bg-[#FF5D2E] text-black' : idx === 1 ? 'bg-[#52525B] text-white' : 'bg-[#27272A] text-[#A1A1AA]'}`}>
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="w-20 h-20 mx-auto mt-6 mb-4 rounded-2xl bg-[#18181B] border-4 flex items-center justify-center text-3xl font-bold"
                    style={{ borderColor: idx === 0 ? '#FF5D2E' : idx === 1 ? '#52525B' : '#71717A' }}>
                    {entry.player?.username?.[0] || '?'}
                  </div>
                  <div className="font-bold text-lg">{entry.player?.username || 'Unknown'}</div>
                  <div className="text-[#FF5D2E] font-mono text-xl font-bold mt-2">{entry.score?.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="max-w-4xl mx-auto">
          {/* Desktop Table */}
          <div className="hidden md:block bg-[#121215] border border-[#27272A] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#27272A] text-[#71717A] text-xs font-bold uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-3 text-right">Score</div>
              <div className="col-span-3 text-right">Win Rate</div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[#52525B]">Loading leaderboard...</div>
            ) : (
              <div className="divide-y divide-[#18181B]">
                {displayData.map((entry, idx) => {
                  const isCurrentUser = player?.id === entry.player?.id;
                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors group ${isCurrentUser
                        ? 'bg-[#FF5D2E]/10 border-l-4 border-l-[#FF5D2E]'
                        : 'hover:bg-[#18181B]'
                        }`}
                    >
                      <div className={`col-span-1 text-center font-mono font-bold ${idx < 3 ? 'text-[#FF5D2E]' : 'text-[#52525B] group-hover:text-white'}`}>
                        {idx + 1}
                      </div>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-[#FF5D2E] text-white' : 'bg-[#18181B] text-[#A1A1AA]'}`}>
                          {entry.player?.username?.[0] || '?'}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${isCurrentUser ? 'text-[#FF5D2E]' : 'text-[#E4E4E7] group-hover:text-white'}`}>
                            {entry.player?.username || 'Unknown'} {isCurrentUser && '(You)'}
                          </div>
                          <div className="text-[10px] text-[#52525B]">{activeTab === 'global' ? 'Global Rank' : 'Game Rank'}</div>
                        </div>
                      </div>
                      <div className={`col-span-3 text-right font-mono ${isCurrentUser ? 'text-[#FF5D2E]' : 'text-[#A1A1AA] group-hover:text-[#FF5D2E]'}`}>
                        {entry.score?.toLocaleString()}
                      </div>
                      <div className="col-span-3 text-right text-sm text-[#52525B]">—</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-8 text-center text-[#52525B]">Loading leaderboard...</div>
            ) : (
              displayData.map((entry, idx) => {
                const isCurrentUser = player?.id === entry.player?.id;
                return (
                  <div
                    key={idx}
                    className={`bg-[#121215] border rounded-2xl p-5 transition-all ${isCurrentUser
                      ? 'border-[#FF5D2E] shadow-lg shadow-[#FF5D2E]/10'
                      : 'border-[#27272A] hover:border-[#3F3F46]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl font-bold ${idx < 3 ? 'text-[#FF5D2E]' : 'text-[#71717A]'}`}>
                          #{idx + 1}
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${idx < 3 ? 'bg-[#FF5D2E] text-black' : 'bg-[#18181B] text-[#A1A1AA]'}`}>
                          {entry.player?.username?.[0] || '?'}
                        </div>
                        <div>
                          <div className={`font-bold ${isCurrentUser ? 'text-[#FF5D2E]' : 'text-white'}`}>
                            {entry.player?.username || 'Unknown'} {isCurrentUser && '(You)'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-[#71717A]">Score</div>
                      <div className={`font-mono font-bold text-lg ${isCurrentUser ? 'text-[#FF5D2E]' : 'text-white'}`}>
                        {entry.score?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
