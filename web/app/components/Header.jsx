'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlayer } from '../providers/PlayerProvider';
import { UserProfileModal } from './UserProfileModal';
import { LoginButton } from './LoginButton';

export const Header = () => {
  const { player } = usePlayer();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {/* Sticky Header Container */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-4 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between">
          
          {/* Logo (Centered Absolute) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <img 
              src="/assets/images/logo.png" 
              alt="OASIS" 
              className="h-22 object-contain brightness-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse"
            />
          </div>

          {/* Left Side: Empty for spacing or back button if needed */}
          <div className="w-10"></div>

          {/* Right Side: Profile Circle */}
          <div className="relative z-10">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white font-bold transition-transform active:scale-95 shadow-lg overflow-hidden"
            >
              {player?.username ? (
                <span>{player.username[0].toUpperCase()}</span>
              ) : (
                 <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Popup */}
      <UserProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        player={player} 
      />
    </>
  );
};
