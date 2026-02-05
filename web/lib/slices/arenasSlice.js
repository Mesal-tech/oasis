import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch all arenas
export const fetchArenas = createAsyncThunk(
  'arenas/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/arenas');
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch arenas');
      }
      return data.arenas;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const arenasSlice = createSlice({
  name: 'arenas',
  initialState: {
    arenas: [],
    activeArena: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveArena: (state, action) => {
      state.activeArena = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArenas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArenas.fulfilled, (state, action) => {
        state.loading = false;
        state.arenas = action.payload;
      })
      .addCase(fetchArenas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveArena, clearError } = arenasSlice.actions;

export default arenasSlice.reducer;
