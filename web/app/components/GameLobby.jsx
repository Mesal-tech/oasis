'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Play, Settings, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SkinPreviewCanvas from './SkinPreviewCanvas';

export default function GameLobby({ gameData, onPlay, nickname, setNickname, selectedSkin, setSelectedSkin, skins = [], player }) {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkinPreview, setShowSkinPreview] = useState(false);

  // Available skills (mock data - typically from constants or API)
  const AVAILABLE_SKILLS = [
    { id: 'speed', name: 'Speed Boost', icon: '⚡', description: '+20% movement speed', cost: 100 },
    { id: 'shield', name: 'Shield', icon: '🛡️', description: 'Absorb 1 hit', cost: 150 },
    { id: 'magnet', name: 'Magnet', icon: '🧲', description: 'Attract nearby items', cost: 120 },
  ];

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else if (selectedSkills.length < 2) {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!gameData?.id) return;
      try {
        // Use the new API route
        const res = await fetch(`/api/leaderboard/${gameData.id}?limit=5`);
        if (res.ok) {
           const data = await res.json();
           if (data.success) {
               // Adapt data if necessary
              setLeaderboard(data.leaderboard || []);
           }
        }
      } catch (err) {
        console.error("Failed to fetch lobby leaderboard", err);
      } finally {
        setLoadingLb(false);
      }
    };
    fetchLeaderboard();
  }, [gameData]);

  // Fetch user's personal stats for this game
  const [userStats, setUserStats] = useState({ highScore: 0, lastScore: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!gameData?.id || !player?.id) {
          setLoadingStats(false);
          return;
      }
      try {
        const res = await fetch(`/api/games/${gameData.id}/my-stats?playerId=${player.id}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.stats) {
                setUserStats({
                    highScore: data.stats.highScore || 0,
                    lastScore: data.stats.lastScore || 0
                });
            }
        }
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchUserStats();
  }, [gameData, player]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#09090B]">

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img src={gameData.thumbnail} className="w-full h-full object-cover opacity-30 blur-2xl scale-110" alt="Backdrop" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-[#09090B]/40"></div>
        {/* Grid Pattern would function here if available */}
      </div>

      {/* Top Navigation */}
      <div className="relative z-20 flex justify-between items-center p-6 pt-20 md:pt-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 hover:text-white transition-all backdrop-blur-md"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-4">
          <Settings className="text-[#52525B] hover:text-white cursor-pointer transition-colors" size={20} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 flex-1 p-6 pt-0 flex flex-col md:flex-row justify-between items-start gap-6">
        {/* LEFT: Game Info & Leaderboard */}
        <div className="h-full flex flex-col justify-between space-y-8 w-full md:w-auto">
          {/* User Stats */}
          <div className="flex flex-col w-fit gap-3 mb-6">
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-1 pr-4 flex items-center gap-3">
              <div className="relative h-[4rem] aspect-square">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[5rem] aspect-square bg-[#18181B] border-4 border-[#FF5D2E] rounded-xl flex items-center justify-center">
                    <Trophy size={32} className="text-[#FF5D2E]" />
                </div>
              </div>
              <div className="pl-4">
                <div className="text-[10px] text-[#71717A] uppercase mb-1 flex items-center gap-1">
                  High Score
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {loadingStats ? '...' : userStats.highScore.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-t from-[#121215] to-transparent relative overflow-hidden group w-full md:w-[400px]">
            {/* Skills Selector */}
            <div className="mb-2">
              <div className="flex justify-between gap-3">
                {AVAILABLE_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id);
                  const isDisabled = !isSelected && selectedSkills.length >= 2;

                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      disabled={isDisabled}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex-1 ${isSelected
                        ? 'border-[#FFCE31] bg-[#FFCE31]/10'
                        : isDisabled
                          ? 'border-[#27272A] opacity-30 cursor-not-allowed'
                          : 'border-[#27272A] hover:border-white/20 hover:bg-white/5'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2 mb-1">
                        <span className="text-xl">{skill.icon}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#FFCE31]' : 'text-white'}`}>
                          {skill.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => onPlay()}
              className="w-full py-4 bg-[#FF5D2E] hover:bg-[#FF8C5D] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#FF5D2E]/20"
            >
              <Play fill="currentColor" /> Play Now
            </button>
          </div>
        </div>

        {/* RIGHT: Player Setup "Machine" */}
        <div className="h-full w-full md:w-auto flex flex-col justify-between items-end gap-6">
          <div className="flex flex-col gap-4 items-end w-full">
            {/* Mini Leaderboard Widget */}
            <div className="bg-[#121215]/80 backdrop-blur-xl border border-[#27272A] rounded-2xl p-6 w-full max-w-[20rem] shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Trophy size={16} className="text-[#FFCE31]" /> Top Players
                </h3>
                <button onClick={() => router.push('/leaderboard')} className="text-xs text-[#FF5D2E] hover:text-white transition-colors flex items-center gap-1">
                  View All <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="space-y-3">
                {loadingLb ? (
                  <div className="text-center py-4 text-[#52525B] text-xs">Loading data...</div>
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-[#FFCE31] text-black' : 'bg-[#27272A] text-[#71717A]'}`}>
                          {idx + 1}
                        </div>
                        <span className="text-[#E4E4E7] font-medium">{entry.player?.username || entry.username || 'Anon'}</span>
                      </div>
                      <span className="font-mono text-[#71717A] text-xs">{(entry.score || entry.totalXp || 0).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[#52525B] text-xs italic">Be the first to claim a spot.</div>
                )}
              </div>
            </div>

            {/* Skin Selector */}
            {skins.length > 0 && (
                <button
                onClick={() => setShowSkinPreview(true)}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:text-white text-xs font-bold transition-colors backdrop-blur-md"
                >
                Change Skin
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Skin Change Preview Modal */}
      {showSkinPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setShowSkinPreview(false)}>
          <div
            className="bg-[#121215] border border-[#27272A] rounded-3xl p-8 max-w-2xl w-full flex flex-col items-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6 z-10">
              <button
                onClick={() => setShowSkinPreview(false)}
                className="text-[#71717A] hover:text-white transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>

            {/* Canvas Container */}
            <div className="relative w-full aspect-video bg-[#09090B] rounded-2xl border-2 border-[#27272A] overflow-hidden group shadow-2xl mb-8">
              {skins.length > 0 && (() => {
                const currentIndex = skins.findIndex(s => s.id === selectedSkin);
                const currentSkin = skins[currentIndex !== -1 ? currentIndex : 0];
                const gameType = gameData.id.includes('flappy') ? 'flappy-bird' : 'slither'; // Simple detection

                return (
                  <SkinPreviewCanvas
                    gameType={gameType}
                    skin={currentSkin}
                    width={800}
                    height={450}
                  />
                );
              })()}

              {/* Navigation Arrows */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-[#FF5D2E] border border-white/10 hover:border-[#FF5D2E] text-white flex items-center justify-center transition-all backdrop-blur-sm z-20 hover:scale-110 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = skins.findIndex(s => s.id === selectedSkin);
                  const prevIndex = (currentIndex - 1 + skins.length) % skins.length;
                  setSelectedSkin(skins[prevIndex].id);
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-[#FF5D2E] border border-white/10 hover:border-[#FF5D2E] text-white flex items-center justify-center transition-all backdrop-blur-sm z-20 hover:scale-110 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = skins.findIndex(s => s.id === selectedSkin);
                  const nextIndex = (currentIndex + 1) % skins.length;
                  setSelectedSkin(skins[nextIndex].id);
                }}
              >
                <ChevronLeft size={24} className="rotate-180" />
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowSkinPreview(false)}
              className="mt-8 w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-[#FF5D2E] hover:text-white transition-all"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
