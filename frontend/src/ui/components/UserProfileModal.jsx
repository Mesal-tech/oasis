import React, { useState } from 'react';
import { Modal } from './Modal';
import { Trophy, Zap, Coins, Calendar, Mail, Wallet, DollarSign, Package, Sparkles, TrendingUp } from 'lucide-react';

export const UserProfileModal = ({ isOpen, onClose, player }) => {
  if (!player) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const xpProgress = player.xp ? ((player.xp % 1000) / 1000) * 100 : 0;
  const xpCurrent = player.xp ? player.xp % 1000 : 0;

  // Mock NFT/Skins data - replace with actual data from backend
  const mockNFTs = [
    { id: 1, name: 'Golden Snake', type: 'Skin', rarity: 'Legendary', image: '/assets/slither/skins/skin_galaxy.png' },
    { id: 2, name: 'Neon Bird', type: 'Skin', rarity: 'Epic', image: '/assets/slither/skins/skin_neon.png' },
    { id: 3, name: 'Fire Trail', type: 'Effect', rarity: 'Rare', image: '/assets/slither/skins/skin_fire.png' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN: Wallet & Game Assets */}
        <div className="space-y-4">
          {/* Wallet Balance */}
          <div className="p-4 bg-gradient-to-br from-[#FF5D2E]/10 to-[#FF8C5D]/10 border border-[#FF5D2E]/20 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#FF5D2E]/20 rounded-xl flex items-center justify-center">
                <Wallet size={24} className="text-[#FF5D2E]" />
              </div>
              <div>
                <div className="text-xs text-[#71717A] uppercase font-bold">Wallet Balance</div>
                <div className="text-sm text-[#A1A1AA] font-mono">
                  {player.walletAddress ? `${player.walletAddress.slice(0, 6)}...${player.walletAddress.slice(-4)}` : 'Not Connected'}
                </div>
              </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={16} className="text-[#FFCE31]" />
                  <span className="text-xs text-[#71717A] uppercase font-bold">Tokens</span>
                </div>
                <div className="text-2xl font-black text-white">{player.tokens?.toLocaleString() || 0}</div>
                <div className="text-xs text-[#A1A1AA] mt-1">Game Currency</div>
              </div>

              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-green-500" />
                  <span className="text-xs text-[#71717A] uppercase font-bold">Balance</span>
                </div>
                <div className="text-2xl font-black text-white">${player.balance?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-[#A1A1AA] mt-1">USD Value</div>
              </div>
            </div>
          </div>

          {/* NFTs & Skins */}
          

          
        </div>

        {/* RIGHT COLUMN: Profile Details */}
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#FF5D2E]/10 to-[#FF8C5D]/10 border border-[#FF5D2E]/20 rounded-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF5D2E] to-[#FF8C5D] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-[#FF5D2E]/30">
              {player.username?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-black text-white mb-2">{player.username || 'Guest'}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-lg">
                  <Trophy size={16} className="text-[#FFCE31]" />
                  <span className="text-white font-bold">Level {player.level || 1}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-lg">
                  <span className="text-[#71717A] font-medium">{player.rank || 'Bronze'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-[#FF5D2E]" />
                <span className="text-white font-bold">Experience Progress</span>
              </div>
              <span className="text-sm text-[#71717A] font-mono">{xpCurrent}/1000 XP</span>
            </div>
            <div className="w-full h-3 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF5D2E] to-[#FF8C5D] transition-all duration-500 rounded-full"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-[#A1A1AA]">
              {1000 - xpCurrent} XP until Level {(player.level || 1) + 1}
            </div>
          </div>

          {/* Total XP Stat */}
          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Zap size={24} className="text-green-500" />
              </div>
              <div>
                <div className="text-xs text-[#71717A] uppercase font-bold">Total Experience</div>
                <div className="text-3xl font-black text-white">{player.xp?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-white uppercase mb-2">Account Information</h4>

            {player.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-[#71717A]" />
                <span className="text-[#71717A]">Email:</span>
                <span className="text-white font-medium">{player.email}</span>
              </div>
            )}

            {player.walletAddress && (
              <div className="flex items-center gap-3 text-sm">
                <Wallet size={16} className="text-[#71717A]" />
                <span className="text-[#71717A]">Wallet:</span>
                <span className="text-white font-mono text-xs">
                  {player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-4)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-[#71717A]" />
              <span className="text-[#71717A]">Member Since:</span>
              <span className="text-white font-medium">{formatDate(player.createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
            >
              Close
            </button>
            <button
              className="flex-1 py-3 bg-gradient-to-r from-[#FF5D2E] to-[#FF8C5D] hover:from-[#FF4500] hover:to-[#FF5D2E] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#FF5D2E]/20"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
