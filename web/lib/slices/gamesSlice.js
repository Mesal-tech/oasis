import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch all games
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch games');
      }
      return data.games;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch trending games
export const fetchTrending = createAsyncThunk(
  'games/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/games/trending');
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch trending games');
      }
      return data.trending;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gamesSlice = createSlice({
  name: 'games',
  initialState: {
    games: [],
    trending: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch games
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch trending
      .addCase(fetchTrending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = gamesSlice.actions;
export default gamesSlice.reducer;
