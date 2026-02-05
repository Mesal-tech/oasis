'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGames, fetchTrending } from '@/lib/slices/gamesSlice';
import { fetchGlobalLeaderboard } from '@/lib/slices/leaderboardSlice';
import { fetchArenas } from '@/lib/slices/arenasSlice';

export default function DataPreloader() {
  const dispatch = useDispatch();
  const { loading: gamesLoading, lastFetched: gamesLastFetched } = useSelector((state) => state.games);
  const { loading: leaderboardLoading } = useSelector((state) => state.leaderboard);
  const { loading: arenasLoading } = useSelector((state) => state.arenas);

  useEffect(() => {
    // Only fetch if data hasn't been loaded yet (lastFetched is null)
    if (!gamesLastFetched) {
      console.log('[DataPreloader] Fetching all app data...');
      
      // Fetch all critical data on mount
      dispatch(fetchGames());
      dispatch(fetchTrending());
      dispatch(fetchGlobalLeaderboard(100));
      dispatch(fetchArenas());
    } else {
      console.log('[DataPreloader] Data already loaded, skipping fetch');
    }
  }, [dispatch, gamesLastFetched]);

  const isLoading = gamesLoading || leaderboardLoading || arenasLoading;

  // Optional: Show a loading indicator
  if (isLoading && !gamesLastFetched) {
    return (
      <div className="fixed top-20 right-4 bg-[#121215] border border-[#27272A] rounded-lg px-4 py-2 text-xs text-[#A1A1AA] z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-[#FF5D2E] border-t-transparent rounded-full animate-spin"></div>
          Loading data...
        </div>
      </div>
    );
  }

  return null; // No UI needed once loaded
}
