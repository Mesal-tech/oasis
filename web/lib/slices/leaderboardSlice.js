import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch global leaderboard
export const fetchGlobalLeaderboard = createAsyncThunk(
  'leaderboard/fetchGlobal',
  async (limit = 100, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/leaderboard/global?limit=${limit}`);
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch leaderboard');
      }
      return data.leaderboard;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch game-specific leaderboard
export const fetchGameLeaderboard = createAsyncThunk(
  'leaderboard/fetchGame',
  async ({ gameId, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/leaderboard/${gameId}?limit=${limit}`);
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch game leaderboard');
      }
      return { gameId, leaderboard: data.leaderboard };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    global: [],
    gameLeaderboards: {}, // { gameId: [...players] }
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch global leaderboard
      .addCase(fetchGlobalLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.global = action.payload;
      })
      .addCase(fetchGlobalLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch game leaderboard
      .addCase(fetchGameLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        const { gameId, leaderboard } = action.payload;
        state.gameLeaderboards[gameId] = leaderboard;
      })
      .addCase(fetchGameLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
