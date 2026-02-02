'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Trophy, Gamepad2, MoreHorizontal, Info, CreditCard, Wallet, Gift, HelpCircle } from 'lucide-react';
import gsap from 'gsap';
import { usePlayer } from '../providers/PlayerProvider';
import { LoginButton } from './LoginButton';
import { UserProfileModal } from './UserProfileModal';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Games', icon: Gamepad2, href: '/games' },
  { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { player } = usePlayer();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Ref for closing clicking outside
  const moreButtonRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Refs for sliding indicator
  const desktopNavRefs = useRef([]);
  const mobileNavRefs = useRef([]);
  const desktopIndicatorRef = useRef(null);
  const mobileIndicatorRef = useRef(null);

  // Update indicator position when route changes
  useLayoutEffect(() => {
    const activeIndex = NAV_ITEMS.findIndex(item => 
      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
    );

    // Check if we're on a "More" sub-route
    const isOnMoreRoute = pathname.startsWith('/profile') || 
                          pathname === '/support' || 
                          pathname === '/rewards';

    if (activeIndex !== -1 && !isOnMoreRoute) {
      // Desktop indicator animation
      if (desktopNavRefs.current[activeIndex] && desktopIndicatorRef.current) {
        const activeElement = desktopNavRefs.current[activeIndex];
        const { offsetTop, offsetHeight } = activeElement;
        
        gsap.to(desktopIndicatorRef.current, {
          top: offsetTop,
          height: offsetHeight,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      // Mobile indicator animation
      if (mobileNavRefs.current[activeIndex] && mobileIndicatorRef.current) {
        const activeElement = mobileNavRefs.current[activeIndex];
        const { offsetLeft, offsetWidth } = activeElement;
        
        gsap.to(mobileIndicatorRef.current, {
          left: offsetLeft,
          width: offsetWidth,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    } else if (isOnMoreRoute) {
      // Hide indicators when on More sub-routes
      if (desktopIndicatorRef.current) {
        gsap.to(desktopIndicatorRef.current, { opacity: 0, duration: 0.2 });
      }
      if (mobileIndicatorRef.current) {
        gsap.to(mobileIndicatorRef.current, { opacity: 0, duration: 0.2 });
      }
    }
  }, [pathname]);

  // Animate menu appearance
  useLayoutEffect(() => {
    if (showMoreMenu) {
      // Desktop menu animation (fade + slide down)
      if (desktopMenuRef.current) {
        gsap.fromTo(
          desktopMenuRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
      }
      
      // Mobile menu animation (slide up from bottom)
      if (mobileMenuRef.current) {
        gsap.fromTo(
          mobileMenuRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        );
      }
    }
  }, [showMoreMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        // If clicking on the button, don't close immediately (handled by button click)
        if (moreButtonRef.current && moreButtonRef.current.contains(event.target)) {
            return;
        }
        
        // Check if click is inside either menu
        const clickedInsideDesktop = desktopMenuRef.current && desktopMenuRef.current.contains(event.target);
        const clickedInsideMobile = mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
        
        // Only close if clicked outside BOTH menus (i.e., not inside either)
        if (!clickedInsideDesktop && !clickedInsideMobile) {
            setShowMoreMenu(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleNavigation = (path) => {
    router.push(path);
    setShowMoreMenu(false);
  };

  const handleAnimatedNavigation = (path, element) => {
    // Animate the clicked element
    if (element) {
      gsap.to(element, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
    
    // Navigate after a brief delay
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  const MoreMenuContent = () => {
    const menuItemsRef = useRef([]);
    
    useLayoutEffect(() => {
      if (menuItemsRef.current.length > 0) {
        gsap.fromTo(
          menuItemsRef.current,
          { opacity: 0, x: -10 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.out'
          }
        );
      }
    }, []);

    return (
      <div className="flex flex-col p-2 space-y-1">
          {/* Profile Section */}
          <div className="px-3 py-2 text-xs font-bold text-[#52525B] uppercase tracking-wider">Profile</div>
          
          <button 
            ref={el => menuItemsRef.current[0] = el}
            onClick={() => handleNavigation('/profile/information')} 
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full text-left relative"
          >
              <Info size={16} />
              <span className={pathname === '/profile/information' ? 'text-white' : ''}>Information</span>
              {pathname === '/profile/information' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5D2E]"></div>
              )}
          </button>
          <button 
            ref={el => menuItemsRef.current[1] = el}
            onClick={() => handleNavigation('/profile/deposit')} 
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full text-left relative"
          >
              <CreditCard size={16} />
              <span className={pathname === '/profile/deposit' ? 'text-white' : ''}>Deposit / Withdraw</span>
              {pathname === '/profile/deposit' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5D2E]"></div>
              )}
          </button>
          <button 
            ref={el => menuItemsRef.current[2] = el}
            onClick={() => handleNavigation('/profile/wallet')} 
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full text-left relative"
          >
              <Wallet size={16} />
              <span className={pathname === '/profile/wallet' ? 'text-white' : ''}>Wallet</span>
              {pathname === '/profile/wallet' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5D2E]"></div>
              )}
          </button>

          <div className="h-px bg-[#27272A] my-1 mx-2"></div>

          {/* Other Links */}
          <button 
            ref={el => menuItemsRef.current[3] = el}
            onClick={() => handleNavigation('/rewards')} 
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full text-left relative"
          >
              <Gift size={16} />
              <span className={pathname === '/rewards' ? 'text-white' : ''}>Awards</span>
              {pathname === '/rewards' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5D2E]"></div>
              )}
          </button>
          <button 
            ref={el => menuItemsRef.current[4] = el}
            onClick={() => handleNavigation('/support')} 
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full text-left relative"
          >
              <HelpCircle size={16} />
              <span className={pathname === '/support' ? 'text-white' : ''}>Support</span>
              {pathname === '/support' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5D2E]"></div>
              )}
          </button>
      </div>
    );
  };

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

          {/* User Profile Card */}
          <div
            className="p-4 bg-[#18181B] border border-[#27272A] rounded-2xl mb-2 cursor-pointer hover:bg-[#1F1F23] transition-all hover:border-[#FF5D2E]/30"
            onClick={() => setShowProfileModal(true)}
          >
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
          <nav className="flex-1 space-y-2 mb-8 relative">
            {/* Animated Indicator */}
            <div 
              ref={desktopIndicatorRef}
              className="absolute left-0 w-full h-12 bg-gradient-to-r from-[#FF5D2E]/10 to-[#FF8C5D]/10 rounded-xl pointer-events-none transition-opacity"
              style={{ top: 0 }}
            />
            
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div
                  key={item.href}
                  ref={el => desktopNavRefs.current[index] = el}
                  onClick={(e) => handleAnimatedNavigation(item.href, e.currentTarget)}
                  className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-bold text-sm relative z-10
                        ${isActive
                      ? 'text-[#FFFFFF]'
                      : 'text-[#71717A] hover:text-white hover:bg-[#18181B]'
                    }
                      `}
                >
                  <Icon size={20} className={isActive ? 'text-[#FFFFFF]' : 'text-[#71717A] group-hover:text-white transition-colors'} />
                  <span>{item.label}</span>
                </div>
              );
            })}

             {/* Desktop 'More' Button */}
             <div className="relative">
                {/* Check if we're on any "More" sub-route */}
                {(() => {
                  const isMoreActive = pathname.startsWith('/profile') || 
                                       pathname === '/support' || 
                                       pathname === '/rewards';
                  
                  return (
                    <div
                        ref={moreButtonRef}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className={`
                                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-bold text-sm relative z-10
                                ${showMoreMenu || isMoreActive
                            ? 'text-[#FFFFFF]'
                            : 'text-[#71717A] hover:text-white hover:bg-[#18181B]'
                            }
                            `}
                    >
                        <MoreHorizontal size={20} className={(showMoreMenu || isMoreActive) ? 'text-[#FFFFFF]' : 'text-[#71717A] group-hover:text-white transition-colors'} />
                        <span>More</span>
                    </div>
                  );
                })()}

                {/* Desktop Popover */}
                 {showMoreMenu && (
                    <div ref={desktopMenuRef} className="absolute left-0 top-full mt-2 w-64 bg-[#18181B] border border-[#27272A] rounded-xl shadow-xl z-50 overflow-hidden">
                       <MoreMenuContent />
                    </div>
                )}
             </div>

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
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[70%] max-w-sm">
          <div className="flex items-center justify-around px-2 py-2 bg-[#18181B]/90 backdrop-blur-xl border border-[#27272A] rounded-4xl shadow-2xl relative">
            {/* Animated Indicator */}
            <div 
              ref={mobileIndicatorRef}
              className="absolute top-2 h-12 bg-[#FF5D2E] rounded-2xl pointer-events-none shadow-lg shadow-[#FF5D2E]/20 transition-opacity"
              style={{ left: 0, width: 48 }}
            />
            
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <button
                  key={item.href}
                  ref={el => mobileNavRefs.current[index] = el}
                  onClick={(e) => handleAnimatedNavigation(item.href, e.currentTarget)}
                  className={`
                      relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                      ${isActive ? 'text-black' : 'text-[#71717A] hover:text-white hover:bg-white/5'}
                    `}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
             {/* Mobile 'More' Button */}
             {(() => {
               const isMoreActive = pathname.startsWith('/profile') || 
                                    pathname === '/support' || 
                                    pathname === '/rewards';
               
               return (
                 <button
                    ref={moreButtonRef}
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className={`
                        relative z-10 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                        ${(showMoreMenu || isMoreActive) ? 'bg-[#FF5D2E] text-black shadow-lg shadow-[#FF5D2E]/20' : 'text-[#71717A] hover:text-white hover:bg-white/5'}
                    `}
                 >
                    <MoreHorizontal size={20} strokeWidth={(showMoreMenu || isMoreActive) ? 2.5 : 2} />
                 </button>
               );
             })()}
            
            {/* Mobile Bottom Sheet/Popup */}
             {showMoreMenu && (
                <div ref={mobileMenuRef} className="absolute bottom-full left-0 w-full mb-4 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <MoreMenuContent />
                </div>
            )}
          </div>
        </nav>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        player={player}
      />
    </>
  );
};
