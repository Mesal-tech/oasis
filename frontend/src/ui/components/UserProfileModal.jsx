import React from 'react';
import { LoginButton } from '../../components/LoginButton';

export const UserProfileModal = ({ isOpen, onClose, player }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop for click-outside closing */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Positioned Popup (top-right, below header) */}
      <div className="fixed top-20 right-4 z-50 w-72 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-4">
          
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#27272A]">
            <div className="w-12 h-12 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white font-bold text-lg">
              {player?.username ? player.username[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{player?.username || 'Guest'}</div>
              <div className="text-xs text-[#71717A]">Level {player?.level || 1}</div>
            </div>
          </div>

          {/* Stats (only show if logged in / player data exists) */}
          {player && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#27272A]/50 p-2.5 rounded-xl border border-[#27272A]">
                <div className="text-[10px] text-[#71717A] uppercase font-bold mb-1">Balance</div>
                <div className="font-mono text-sm font-bold text-white">${player.balance?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="bg-[#27272A]/50 p-2.5 rounded-xl border border-[#27272A]">
                <div className="text-[10px] text-[#71717A] uppercase font-bold mb-1">Tokens</div>
                <div className="font-mono text-sm font-bold text-white">{player.tokens?.toLocaleString() || 0}</div>
              </div>
            </div>
          )}

          {/* Action Button (Login/Logout) */}
          <LoginButton />
        </div>
      </div>
    </>
  );
};
