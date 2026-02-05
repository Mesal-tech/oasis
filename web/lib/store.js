import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slices/gamesSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import arenasReducer from './slices/arenasSlice';
import socketMiddleware from './middleware/socketMiddleware';

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    leaderboard: leaderboardReducer,
    arenas: arenasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['socket/connect', 'socket/disconnect'],
      },
    }).concat(socketMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
