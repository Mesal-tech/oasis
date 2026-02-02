'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

// Define Context
const PlayerContext = createContext(null);

export const usePlayer = () => useContext(PlayerContext);

// Internal component to use Privy hooks
const PlayerStateProvider = ({ children }) => {
  const { user, authenticated, ready, login, logout } = usePrivy();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create player when authenticated
  useEffect(() => {
    const fetchPlayer = async () => {
      if (!ready) return;
      
      if (!authenticated || !user) {
        setPlayer(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const walletAddress = user.wallet?.address;
        const email = user.email?.address;
        // Use wallet address or email as username fallback if needed, but we ask for username usually?
        // For migration simplicity, we'll auto-generate or use existing.
        // In original app, how was registration handled? 
        // Original PlayerContext likely handled it. Let's assume auto-registration for now.
        
        const username = user.google?.name || user.email?.address?.split('@')[0] || `User_${walletAddress?.slice(0,6)}`;

        const response = await fetch('/api/players/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            email,
            username: username || 'Unknown',
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setPlayer(data.player);
        }
      } catch (error) {
        console.error('Error fetching player:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [ready, authenticated, user]);

  const refreshPlayer = async () => {
    if (player?.id) {
       try {
        const response = await fetch(`/api/players/${player.id}`);
        if (response.ok) {
            const data = await response.json();
            setPlayer(data.player);
        }
       } catch (err) {
           console.error("Failed to refresh player", err);
       }
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        loading: loading || !ready,
        isAuthenticated: authenticated,
        login,
        logout,
        refreshPlayer
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default function PlayerProvider({ children }) {
  // You need your App ID here. Ideally from env var.
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID; 

  // Basic solana connectors if needed
  const solanaConnectors = toSolanaWalletConnectors({
      shouldAutoConnect: false,
  });

  return (
    <PrivyProvider
      appId={appId || 'cm6m7l5h501a313e618k745y9'} // Fallback for dev/migration if env missing
      config={{
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: '/assets/images/logo.png',
        },
        externalWallets: {
            solana: {
                connectors: solanaConnectors,
            }
        }
      }}
    >
      <PlayerStateProvider>{children}</PlayerStateProvider>
    </PrivyProvider>
  );
}
