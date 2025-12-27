import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Shield, Hexagon } from 'lucide-react';
import { usePlayer } from '../../state/PlayerContext';
import apiClient from '../../api/client';

export const LeaderboardScreen = () => {
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
      const response = await apiClient.getGames();
      if (response.success) {
        setGames(response.games);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getGlobalLeaderboard({ limit: 100 });
      if (response.success) {
        // Normalize global data: Backend returns flat Player objects, 
        // frontend expects { player: { ... }, score: ... } structure.
        // For global leaderboard, Score = XP.
        const normalizedData = response.leaderboard.map(p => ({
          player: p,
          xp: p.xp,
          score: p.xp, // Map XP to score for consistent display
          rank: p.rank
        }));
        setGlobalLeaderboard(normalizedData);
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
      const response = await apiClient.getGameLeaderboard(gameId);
      if (response.success) {
        // Game leaderboard returns { player: {...}, score: ..., rank: ... } which matches our needs
        setGameLeaderboard(response.leaderboard);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch game leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankBadgeStyle = (rank) => {
    switch (rank) {
      case 1: return 'bg-[#FF5D2E] text-white border-[#FF5D2E]';
      case 2: return 'bg-[#52525B] text-white border-[#52525B] shadow-lg';
      case 3: return 'bg-[#27272A] text-white border-[#27272A]';
      default: return 'bg-[#18181B] text-[#71717A] border-[#27272A]';
    }
  };

  const displayData = activeTab === 'global' ? globalLeaderboard : gameLeaderboard;
  const topThree = displayData.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-[#A1A1AA]">Compete for glory and exclusive rewards.</p>
        </div>

        {/* Toggle / Filters */}
        <div className="flex bg-[#121215] p-1 rounded-xl border border-[#27272A]">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'global' ? 'bg-[#FF5D2E] text-black shadow-lg' : 'text-[#71717A] hover:text-white'
              }`}
          >
            Global Ranking
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'game' ? 'bg-[#FF5D2E] text-black shadow-lg' : 'text-[#71717A] hover:text-white'
              }`}
          >
            Game Specific
          </button>
        </div>
      </div>

      {/* Game Selector */}
      {activeTab === 'game' && (
        <div className="max-w-5xl mx-auto mb-8 flex gap-4 overflow-x-auto pb-4">
          {[{ id: 'all', name: 'All Games' }, ...games].map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-4 py-2 border rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedGame === game.id
                ? 'bg-white text-black border-white'
                : 'bg-[#121215] text-[#71717A] border-[#27272A] hover:border-[#52525B]'
                }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      )}

      {/* Podium Section */}
      {!loading && topThree.length > 0 && (
        <div className="max-w-3xl mx-auto mb-16 flex items-end justify-center gap-6">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="mb-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-[#18181B] border-2 border-[#52525B] flex items-center justify-center text-2xl font-bold text-[#A1A1AA] mb-2 shadow-[0_0_20px_rgba(82,82,91,0.2)]">
                  {topThree[1].player.username[0]}
                </div>
                <div className="px-3 py-1 bg-[#52525B] rounded text-[10px] font-bold tracking-wider">#2</div>
              </div>

              <div className="text-center mb-4">
                <div className="font-bold">{topThree[1].player.username}</div>
                <div className="text-[#FF5D2E] font-mono text-sm">{topThree[1].score.toLocaleString()}</div>
              </div>

              <div className="w-24 h-32 bg-gradient-to-b from-[#52525B]/20 to-transparent rounded-t-xl border-x border-t border-[#52525B]/30 relative">
                <div className="absolute bottom-0 w-full h-1 bg-[#52525B]"></div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center -mx-4 z-10">
              <div className="mb-6 flex flex-col items-center relative">
                <div className="absolute -top-8 text-[#FFCE31] drop-shadow-[0_0_10px_rgba(255,206,49,0.5)]">
                  <Crown size={32} fill="currentColor" />
                </div>
                <div className="w-28 h-28 rounded-3xl bg-[#18181B] border-4 border-[#FF5D2E] flex items-center justify-center text-4xl font-bold text-white mb-2 shadow-[0_0_40px_rgba(255,93,46,0.3)]">
                  {topThree[0].player.username[0]}
                </div>
                <div className="px-4 py-1.5 bg-[#FF5D2E] text-black rounded text-xs font-bold tracking-wider">#1 CHAMPION</div>
              </div>

              <div className="text-center mb-6">
                <div className="text-xl font-bold">{topThree[0].player.username}</div>
                <div className="text-[#FF5D2E] font-mono font-bold text-lg">{topThree[0].score.toLocaleString()}</div>
              </div>

              <div className="w-32 h-44 bg-gradient-to-b from-[#FF5D2E]/20 to-transparent rounded-t-2xl border-x border-t border-[#FF5D2E]/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/pattern.png')] opacity-10"></div>
                <div className="absolute bottom-0 w-full h-1 bg-[#FF5D2E]"></div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="mb-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-[#18181B] border-2 border-[#71717A] flex items-center justify-center text-2xl font-bold text-[#71717A] mb-2">
                  {topThree[2].player.username[0]}
                </div>
                <div className="px-3 py-1 bg-[#27272A] border border-[#71717A] rounded text-[10px] font-bold tracking-wider text-[#A1A1AA]">#3</div>
              </div>

              <div className="text-center mb-4">
                <div className="font-bold text-[#A1A1AA]">{topThree[2].player.username}</div>
                <div className="text-[#71717A] font-mono text-sm">{topThree[2].score.toLocaleString()}</div>
              </div>

              <div className="w-24 h-24 bg-gradient-to-b from-[#27272A]/50 to-transparent rounded-t-xl border-x border-t border-[#27272A] relative">
                <div className="absolute bottom-0 w-full h-1 bg-[#27272A]"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List Section */}
      <div className="max-w-4xl mx-auto bg-[#121215] border border-[#27272A] rounded-2xl overflow-hidden">
        {/* Header Row */}
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
              const isCurrentUser = player?.id === entry.player.id;
              return (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors group ${isCurrentUser
                    ? 'bg-[#FF5D2E]/10 border-l-2 border-l-[#FF5D2E]'
                    : 'hover:bg-[#18181B] border-l-2 border-l-transparent'
                    }`}
                >
                  <div className={`col-span-1 text-center font-mono font-bold ${idx < 3 ? 'text-[#FF5D2E]' : 'text-[#52525B] group-hover:text-white'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-[#FF5D2E] text-white' : 'bg-[#18181B] text-[#A1A1AA]'
                      }`}>
                      {entry.player.username[0]}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isCurrentUser ? 'text-[#FF5D2E]' : 'text-[#E4E4E7] group-hover:text-white'}`}>
                        {entry.player.username} {isCurrentUser && '(You)'}
                      </div>
                      <div className="text-[10px] text-[#52525B]">{entry.player.rank}</div>
                    </div>
                  </div>
                  <div className={`col-span-3 text-right font-mono ${isCurrentUser ? 'text-[#FF5D2E]' : 'text-[#A1A1AA] group-hover:text-[#FF5D2E]'}`}>
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="col-span-3 text-right text-sm text-[#52525B]">
                    —
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
