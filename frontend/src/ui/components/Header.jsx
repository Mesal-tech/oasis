import React, { useState } from 'react';
import { usePlayer } from '../../state/PlayerContext';
import { UserProfileModal } from './UserProfileModal';

export const Header = () => {
  const { player } = usePlayer();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#09090B]/95 backdrop-blur-xl border-b border-[#27272A] px-4 py-4 md:hidden">
        <div className="flex items-center justify-between">
          {/* Left Spacer (for centering) */}
          <div className="w-10"></div>

          {/* Logo/Brand - Centered */}
          <div className="flex items-center absolute left-1/2 -translate-x-1/2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              OASIS
            </h1>
          </div>

          {/* Profile Circle */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] transition-all"
          >
            {player?.username ? (
              <span className="text-white font-bold text-sm">
                {player.username[0].toUpperCase()}
              </span>
            ) : (
              <span className="text-[#71717A] font-bold text-sm">?</span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
          player={player} 
        />
      )}
    </>
  );
};
