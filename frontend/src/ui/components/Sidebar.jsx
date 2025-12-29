import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, ShoppingBag, Gift, LogOut, Wallet, Sparkles, Swords, Gamepad2 } from 'lucide-react';
import { usePlayer } from '../../state/PlayerContext';
import { LoginButton } from '../../components/LoginButton';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Games', icon: Gamepad2, href: '/games' },
  { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
  { label: 'Arena', icon: Swords, href: '/arena' },
  { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
  { label: 'Rewards', icon: Gift, href: '/rewards' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { player } = usePlayer(); // Use PlayerContext instead of userStore

  return (
    <>
      <div className="nav-wrapper">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex sticky top-0 left-0 z-50 w-72 h-screen bg-[#121215] border-r border-[#27272A] text-white flex-col shadow-none overflow-y-auto p-6">
          {/* Header */}
          <div className="pb-8 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF5D2E] rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm rotate-45"></div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-white">
                OASIS
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-2xl mb-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF5D2E] to-[#FF8C5D] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {player?.username?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{player?.username || 'Guest'}</div>
                <div className="text-xs text-[#71717A] font-mono">Level {player?.level || 1}</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#FF5D2E] to-[#FF8C5D] transition-all duration-500"
                style={{
                  width: `${player?.xp ? ((player.xp % 1000) / 1000) * 100 : 0}%`
                }}
              ></div>
            </div>

            <div className="text-[10px] text-[#A1A1AA] flex justify-between mb-3">
              <span>XP Progress</span>
              <span>{player?.xp ? `${player.xp % 1000}/1000` : '0/1000'}</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2 mb-8">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-bold text-sm
                        ${isActive
                      ? 'bg-white/5 text-[#FFFFFF]'
                      : 'text-[#71717A] hover:text-white hover:bg-[#18181B]'
                    }
                      `}
                >
                  <Icon size={20} className={isActive ? 'text-[#FFFFFF]' : 'text-[#71717A] group-hover:text-white transition-colors'} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto">
            <LoginButton />

            <div className="mt-4 pt-4 border-t border-[#27272A] text-center">
              <p className="text-[10px] text-[#52525B]">© 2025-2026 Oasis Gaming</p>
            </div>
          </div>
        </aside>

        {/* Mobile Floating Bottom Bar */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
          <div className="flex items-center justify-around px-2 py-2 bg-[#18181B]/90 backdrop-blur-xl border border-[#27272A] rounded-2xl shadow-2xl">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`
                      relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                      ${isActive ? 'bg-[#FF5D2E] text-black shadow-lg shadow-[#FF5D2E]/20' : 'text-[#71717A] hover:text-white hover:bg-white/5'}
                    `}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};
