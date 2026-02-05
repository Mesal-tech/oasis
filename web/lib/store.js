import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slices/gamesSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import arenasReducer from './slices/arenasSlice';

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    leaderboard: leaderboardReducer,
    arenas: arenasReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
