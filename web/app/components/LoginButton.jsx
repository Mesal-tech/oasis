'use client';

import React from 'react';
import { usePlayer } from '../providers/PlayerProvider';

export const LoginButton = () => {
  const { login, logout, isAuthenticated, player } = usePlayer();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        {/* We can show address/email if we want, or rely on Header doing it. */}
        {/* For this migration, keeping it simple as per earlier UserProfileModal simplification */}
        <button
          onClick={logout}
          className="w-full px-4 py-3 text-sm font-bold text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      title="Login With Privy"
      onClick={login}
      className="w-full cursor-pointer flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
    >
      <img src="/assets/misc/privy.svg" className="w-5 h-5" alt="Privy" />
      <span>Login</span>
    </button>
  );
};
