'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../providers/PlayerProvider';

// Dynamic imports for game logic would normally go here, 
// but since we need to instantiate classes, we might need a mapping.
// However, since we are in a client component, we can import them if they don't use window/document at top level.
// Most Phaser games use 'phaser' which might access window. So we might need to lazy load the classes.

export default function GameWrapper({ gameId }) {
  const containerRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const { player } = usePlayer();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let gameModule = null;

    const loadGame = async () => {
      if (!containerRef.current) return;
      if (gameInstanceRef.current) return; // Already running

      try {
        setLoading(true);
        console.log(`Loading game: ${gameId}`);

        // Dynamically import the specific game module based on ID
        // Note: We need to ensure the paths match where we copied the files.
        // Adjust paths based on 'web/games' location relative to this file 'web/app/components/GameWrapper.jsx'
        // Path: ../../games/[gameId]/index.js
        
        switch (gameId) {
          case 'slither':
            gameModule = await import('@/games/slither');
            if (mounted) {
               const { SlitherGame } = gameModule;
               gameInstanceRef.current = new SlitherGame(containerRef.current.id);
            }
            break;
          case 'flappy':
             gameModule = await import('@/games/flappy-bird');
             if (mounted) {
                const { FlappyBirdGame } = gameModule;
                gameInstanceRef.current = new FlappyBirdGame(containerRef.current.id);
             }
             break;
          // Add other games here
          default:
            throw new Error(`Game ${gameId} not found or not supported yet.`);
        }

        if (gameInstanceRef.current && mounted) {
           // Create a unique config for the player
           const gameOptions = {
              nickname: player?.username || 'Guest',
              // Add other player specific options here
           };
           
           console.log('Launching game instance...');
           gameInstanceRef.current.launch(gameOptions);
        }

      } catch (err) {
        console.error("Failed to load game:", err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadGame();

    return () => {
      mounted = false;
      if (gameInstanceRef.current) {
        console.log('Destroying game instance...');
        try {
            gameInstanceRef.current.stop();
        } catch (e) {
            console.error("Error stopping game:", e);
        }
        gameInstanceRef.current = null;
      }
    };
  }, [gameId, player]); 

  // If player changes (e.g. login), we might want to reload? 
  // For now, let's just let it be. If they login mid-game, they might need to refresh.

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-[600px] bg-[#09090B] text-red-500 border border-[#27272A] rounded-xl">
        <p>Error loading game: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#FF5D2E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#A1A1AA] font-mono text-sm animate-pulse">Initializing Ecosystem...</p>
          </div>
        </div>
      )}
      <div 
        id="game-container" 
        ref={containerRef} 
        className="w-full h-full absolute inset-0"
      />
    </div>
  );
}
