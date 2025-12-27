import React, { useState } from 'react';
import { Gift, Trophy, Star, Calendar, Zap, Target, Award, Check, Lock, ChevronRight, Crown } from 'lucide-react';
import { usePlayer } from '../../state/PlayerContext';

export const RewardsScreen = () => {
  const { player } = usePlayer();
  const [activeTab, setActiveTab] = useState('daily');

  // Theme Constants
  const THEME = {
    accent: '#FF5D2E', // Specific orange from mockup
    bg: '#09090B',
    card: '#18181B',
    textSecondary: '#A1A1AA'
  };

  const TABS = [
    { id: 'daily', label: 'DAILY REWARDS' },
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'season', label: 'SEASON PASS' }
  ];

  // Daily Rewards Data
  const dailyRewards = [
    { day: 1, reward: '50 Gold', status: 'claimed' },
    { day: 2, reward: '100 Gold', status: 'claimed' },
    { day: 3, reward: 'Rare Item', status: 'claimed' },
    { day: 4, reward: '100 Gold', status: 'ready', isToday: true }, // Active
    { day: 5, reward: '50 XP', status: 'locked' },
    { day: 6, reward: 'Rare Item', status: 'locked' },
    { day: 7, reward: 'Mystery Box', status: 'locked', isBig: true },
  ];

  // Achievements Data
  const achievements = [
    {
      id: 1,
      title: 'First Blood',
      desc: 'Get your first elimination in a ranked match.',
      progress: 1,
      total: 1,
      reward: '+500 XP',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Sharpshooter',
      desc: 'Land 50 headshots in a single season.',
      progress: 45,
      total: 50,
      reward: '+1000 Gold',
      status: 'in_progress'
    },
    {
      id: 3,
      title: 'Marathon Runner',
      desc: 'Travel 100km on foot across all game modes.',
      progress: 5,
      total: 100,
      reward: 'Epic Skin',
      status: 'in_progress'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-start mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[#27272A]" style={{ backgroundColor: 'rgba(255, 93, 46, 0.1)' }}>
            <Gift size={32} color={THEME.accent} />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-1">Rewards</h1>
            <p className="text-[#A1A1AA]">Track progress, claim gifts, and level up.</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mb-1">Balance</div>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <div className="w-6 h-6 rounded-full bg-[#FF5D2E] flex items-center justify-center text-xs font-black text-black">$</div>
            {(player?.balance || 4250).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto border-b border-[#27272A] mb-12 flex gap-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-xs font-bold tracking-widest transition-all relative ${activeTab === tab.id ? 'text-[#FF5D2E]' : 'text-[#71717A] hover:text-white'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF5D2E] shadow-[0_0_10px_rgba(255,93,46,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pb-20">

        {/* Daily Login Section */}
        {activeTab === 'daily' && (
          <div className="mb-16">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold">Daily Login</h2>
              <div className="text-[#A1A1AA] text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-600"></div> Resets in 14:22:05
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {dailyRewards.map((day, idx) => {
                const isToday = day.isToday;
                const cardBg = isToday ? '#18181B' : '#121215'; // Slightly lighter for active
                const borderColor = isToday ? THEME.accent : (day.status === 'claimed' ? '#27272A' : '#18181B');

                return (
                  <div key={idx} className={`
                              relative rounded-xl p-4 flex flex-col items-center justify-between min-h-[160px] border transition-all
                              ${isToday ? 'scale-105 shadow-xl z-10' : 'opacity-80 hover:opacity-100'}
                          `}
                    style={{
                      backgroundColor: cardBg,
                      borderColor: borderColor,
                      boxShadow: isToday ? `0 0 0 1px ${THEME.accent}` : 'none'
                    }}>
                    {isToday && (
                      <div className="absolute -top-3 bg-[#FF5D2E] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm">
                        TODAY
                      </div>
                    )}

                    <div className="text-[#71717A] text-[10px] font-bold uppercase mb-2">Day {day.day}</div>

                    <div className="flex-1 flex flex-col items-center justify-center mb-2">
                      {/* Icon Placeholder */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${day.status === 'claimed' ? 'bg-[#27272A] text-[#10B981]'
                          : (isToday ? 'bg-[#FF5D2E]/20 text-[#FF5D2E]' : 'bg-[#27272A] text-[#52525B]')
                        }`}>
                        {day.status === 'claimed' ? <Check size={20} /> : <Gift size={20} />}
                      </div>
                      <div className={`text-sm font-bold ${isToday ? 'text-white' : 'text-[#71717A]'}`}>
                        {day.status === 'claimed' ? 'Claimed' : day.reward}
                      </div>
                    </div>

                    {day.status === 'ready' && (
                      <button className="w-full py-1.5 rounded bg-[#FF5D2E] text-black text-xs font-bold hover:bg-[#ff7a52] transition-colors">
                        CLAIM
                      </button>
                    )}
                    {day.status === 'claimed' && (
                      <div className="text-[#10B981] text-xs font-medium">Completed</div>
                    )}
                    {day.status === 'locked' && (
                      <div className="text-[#52525B] text-xs font-medium flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {activeTab === 'achievements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Achievements</h2>
              <button className="text-[#FF5D2E] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {achievements.map((ach) => (
                <div key={ach.id} className="bg-[#121215] border border-[#27272A] rounded-xl p-6 hover:border-[#3F3F46] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ach.status === 'completed' ? 'bg-[#FF5D2E] text-black' : 'bg-[#27272A] text-[#71717A]'
                      }`}>
                      <Trophy size={20} />
                    </div>
                    {ach.status === 'completed' && (
                      <span className="bg-[#2a1b15] text-[#FF5D2E] text-[10px] font-bold px-2 py-1 rounded border border-[#FF5D2E]/20">
                        COMPLETED
                      </span>
                    )}
                    {ach.status === 'in_progress' && (
                      <span className="bg-[#18181B] text-[#71717A] text-[10px] font-bold px-2 py-1 rounded border border-[#27272A]">
                        IN PROGRESS
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-1">{ach.title}</h3>
                  <p className="text-[#71717A] text-sm mb-6 h-10">{ach.desc}</p>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-white">Progress</span>
                      <span className={ach.progress === ach.total ? 'text-[#FF5D2E]' : 'text-[#71717A]'}>
                        {ach.progress}/{ach.total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF5D2E] rounded-full transition-all duration-500"
                        style={{ width: `${(ach.progress / ach.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#27272A]">
                    <div className="text-[#FF5D2E] font-bold text-sm">{ach.reward}</div>
                    {ach.status === 'completed' ? (
                      <button className="px-4 py-1.5 bg-[#FF5D2E] text-black text-xs font-bold rounded hover:bg-[#ff7a52] transition-colors">
                        CLAIM
                      </button>
                    ) : (
                      <button className="px-4 py-1.5 bg-[#27272A] text-[#71717A] text-xs font-bold rounded cursor-not-allowed border border-white/5">
                        CLAIM
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Season Pass Section */}
        {activeTab === 'season' && (
          <div className="mt-16 bg-[#121215] border border-[#27272A] rounded-2xl p-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  Season 4 Pass
                  <span className="bg-[#FF5D2E] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm">ACTIVE</span>
                </h2>
                <p className="text-[#A1A1AA] text-sm mt-1">Season ends in 24 days</p>
              </div>
              <button className="px-6 py-2.5 border border-[#FF5D2E] text-[#FF5D2E] font-bold text-sm rounded-lg hover:bg-[#FF5D2E]/10 transition-colors flex items-center gap-2">
                <Crown size={16} /> UPGRADE TO PREMIUM
              </button>
            </div>

            {/* Timeline */}
            <div className="relative pt-10 pb-4 px-10">
              {/* Line */}
              <div className="absolute top-[55px] left-0 w-full h-1 bg-[#27272A] rounded-full"></div>
              {/* Active Progress Line */}
              <div className="absolute top-[55px] left-0 w-[35%] h-1 bg-[#FF5D2E] rounded-full"></div>

              <div className="flex justify-between relative z-10">
                {/* Node 1 - Completed */}
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[#71717A] text-xs mb-2">Free</span>
                  <div className="w-8 h-8 rounded-full bg-[#FF5D2E] flex items-center justify-center text-black">
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <div className="w-12 h-12 bg-[#18181B] border border-[#27272A] rounded-lg mt-2 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#A1A1AA]">Lvl 10</span>
                  </div>
                </div>

                {/* Node 2 - Completed */}
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[#71717A] text-xs mb-2 hidden">Premium</span>
                  <div className="w-8 h-8 rounded-full bg-[#FF5D2E] flex items-center justify-center text-black border-4 border-[#09090B]">
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <div className="text-[#A1A1AA] text-xs font-bold mt-2">Lvl 11</div>
                </div>

                {/* Node 3 - Current */}
                <div className="flex flex-col items-center gap-4 -mt-10">
                  <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded relative mb-1 shadow-lg">
                    CURRENT
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                  </div>
                  <div className="text-[#FF5D2E] text-xs font-bold mb-1">Premium</div>
                  <div className="w-12 h-12 rounded-full bg-[#121215] border-2 border-[#FF5D2E] flex items-center justify-center text-white font-bold relative shadow-[0_0_20px_rgba(255,93,46,0.3)]">
                    12
                  </div>
                  <div className="w-20 h-24 bg-[#18181B] border border-[#FF5D2E] rounded-xl mt-2 flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:bg-[#202025]">
                    <div className="text-[#FF5D2E] mb-1"><Target size={24} /></div>
                    <span className="text-[10px] font-bold text-white leading-tight">LEGENDARY</span>
                  </div>
                </div>

                {/* Node 4 - Locked */}
                <div className="flex flex-col items-center gap-4 opacity-50">
                  <span className="text-[#71717A] text-xs mb-2">Free</span>
                  <div className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#52525B]">
                    <div className="w-2 h-2 rounded-full bg-[#52525B]"></div>
                  </div>
                  <div className="text-[#A1A1AA] text-xs font-bold mt-2">Lvl 13</div>
                </div>

                {/* Node 5 - Locked */}
                <div className="flex flex-col items-center gap-4 opacity-50">
                  <span className="text-[#71717A] text-xs mb-2 hidden">Premium</span>
                  <div className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#52525B]">
                    <Lock size={14} />
                  </div>
                  <div className="w-12 h-12 bg-[#18181B] border border-[#27272A] rounded-lg mt-2 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#A1A1AA]">Lvl 15</span>
                  </div>
                </div>

                {/* Node 6 - Locked */}
                <div className="flex flex-col items-center gap-4 opacity-50">
                  <div className="text-[#FF5D2E] text-xs font-bold mb-2">Premium</div>
                  <div className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#52525B]">
                    <Lock size={14} />
                  </div>
                  <div className="w-16 h-16 bg-[#18181B] border border-[#27272A] rounded-xl mt-2 flex items-center justify-center">
                    <div className="text-[#52525B]"><Award size={24} /></div>
                  </div>
                  <div className="text-[#A1A1AA] text-[10px] font-bold">Lvl 20</div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
