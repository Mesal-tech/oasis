'use client';

import React from 'react';
import { usePlayer } from '../../providers/PlayerProvider';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function ProfileInformation() {
  const { player } = usePlayer();

  if (!player) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-[#71717A]">
        Please login to view your profile information.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full">
      <div className="max-w-4xl mx-auto pt-20 md:pt-6">
        <h1 className="text-3xl font-bold mb-8">Profile Information</h1>
        
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 md:p-8 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-[#27272A]">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF5D2E] to-[#FF8C5D] rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl">
              {player.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{player.username}</h2>
              <div className="text-[#A1A1AA] flex items-center gap-2 mt-1">
                <Shield size={14} className="text-[#FF5D2E]" />
                Level {player.level || 1}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Username</label>
              <div className="flex items-center gap-3 p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
                <User size={18} className="text-[#A1A1AA]" />
                <span className="text-[#E4E4E7] font-medium">{player.username}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Email / ID</label>
              <div className="flex items-center gap-3 p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
                <Mail size={18} className="text-[#A1A1AA]" />
                <span className="text-[#E4E4E7] font-medium truncate">{player.email || player.walletAddress || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Member Since</label>
              <div className="flex items-center gap-3 p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
                <Calendar size={18} className="text-[#A1A1AA]" />
                <span className="text-[#E4E4E7] font-medium">
                  {player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
