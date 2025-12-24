import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Trophy, ShoppingBag, Gift, LogOut, Wallet, Sparkles } from 'lucide-react';
import { userStore } from '../../state/userStore';
import { LoginButton } from '../../components/LoginButton';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
  { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
  { label: 'Rewards', icon: Gift, href: '/rewards' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(userStore.player);

  useEffect(() => {
    // Initial state
    setPlayer(userStore.player);

    const unsubscribe = userStore.subscribe((updatedPlayer) => {
      setPlayer({ ...updatedPlayer });
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    // userStore.logout(); // If logout exists
    console.log('Logging out...');
  };

  return (
    <>
      <div className="nav-wrapper">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex sticky top-0 left-0 z-50 w-72 h-screen bg-gradient-to-b from-[#1d1d1d] to-black text-white flex-col shadow-2xl border-r border-white/5 overflow-y-auto p-4">
          {/* Header */}
          <div className="pb-8">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold bg-gradient-to-r from-transparent via-white/80 to-white bg-clip-text text-transparent">
                Oasis
              </div>
            </div>
          </div>

          {/* Player Card/Wallet Placeholder */}
          <div className="mb-4">
            <div className="min-h-[10rem] flex items-center gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              {/* Logic for card goes here if needed, keeping it minimal as per original */}
            </div>
          </div>

          <div className="mb-5 flex-1 flex flex-col">
            {/* Navigation Menu */}
            <nav className="desktop-nav-container flex-1 space-y-1 mb-6">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <div
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={`
                        nav-item flex items-center gap-4 py-2.5 rounded-xl transition-all group cursor-pointer
                        ${isActive ? 'active-nav text-white bg-white/5' : 'text-white/50 hover:text-white'}
                        hover:pl-6
                      `}
                  >
                    <div className="icon-placeholder">
                      <Icon size={22} className="text-current group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full" />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="space-y-4">
              <button onClick={handleLogout} className="logout-btn w-full flex items-center gap-4 py-2 rounded-xl text-red-400 hover:text-red-300 transition-all group">
                <div className="logout-icon">
                  <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                </div>
                <span className="font-medium">Logout</span>
              </button>

              <div className="pt-4 border-t border-white/5">
                <LoginButton />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5">
            <p className="text-xs text-white/40 text-center">
              <a href="#" className="hover:text-white/60 transition">Terms</a> &
              <a href="#" className="hover:text-white/60 transition"> Privacy</a>
            </p>
          </div>
        </aside>

        {/* Mobile Floating Bottom Bar */}
        <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className="mobile-nav-container flex items-center justify-around px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[20vh] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`
                      mobile-nav-item relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300
                      ${isActive ? 'bg-white/20 text-white scale-110' : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'}
                    `}
                >
                  <div className="mobile-icon-placeholder">
                    <Icon size={22} className="transition-transform" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};
