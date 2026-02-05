'use client';

import React, { useState } from 'react';
import { usePlayer } from '../../providers/PlayerProvider';
import { User, Mail, Calendar, Shield, Edit2, Check, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchGames, fetchTrending } from '@/lib/slices/gamesSlice';
import { fetchGlobalLeaderboard } from '@/lib/slices/leaderboardSlice';

export default function ProfileInformation() {
  const { player, refreshPlayer } = usePlayer();
  const dispatch = useDispatch();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!player) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-[#71717A]">
        Please login to view your profile information.
      </div>
    );
  }

  const handleEditClick = () => {
    setNewUsername(player.username);
    setIsEditingUsername(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setNewUsername('');
    setError('');
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername.trim() === player.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch(`/api/players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update username');
      }

      // Refresh player data
      await refreshPlayer();

      // Refresh all Redux data to update leaderboards and game stats
      console.log('[Profile] Username updated, refreshing all data...');
      dispatch(fetchGames());
      dispatch(fetchTrending());
      dispatch(fetchGlobalLeaderboard(100));

      setIsEditingUsername(false);
      setNewUsername('');
    } catch (err) {
      console.error('Failed to update username:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
            {/* Editable Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Username</label>
              {isEditingUsername ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="flex-1 p-4 bg-[#18181B] rounded-xl border border-[#FF5D2E] text-[#E4E4E7] font-medium focus:outline-none focus:border-[#FF5D2E] focus:ring-1 focus:ring-[#FF5D2E]"
                      placeholder="Enter new username"
                      autoFocus
                      disabled={saving}
                    />
                    <button
                      onClick={handleSaveUsername}
                      disabled={saving}
                      className="p-4 bg-[#FF5D2E] hover:bg-[#FF6D3E] disabled:bg-[#52525B] rounded-xl transition-colors"
                      title="Save"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="p-4 bg-[#27272A] hover:bg-[#3F3F46] disabled:bg-[#18181B] rounded-xl transition-colors"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                  {saving && (
                    <p className="text-xs text-[#A1A1AA]">Saving...</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-[#18181B] rounded-xl border border-[#27272A] group cursor-pointer hover:border-[#3F3F46] transition-colors" onClick={handleEditClick}>
                  <User size={18} className="text-[#A1A1AA]" />
                  <span className="flex-1 text-[#E4E4E7] font-medium">{player.username}</span>
                  <Edit2 size={16} className="text-[#52525B] group-hover:text-[#FF5D2E] transition-colors" />
                </div>
              )}
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
