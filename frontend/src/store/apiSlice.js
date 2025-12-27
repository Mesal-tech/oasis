import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Player', 'Games', 'Leaderboard', 'Arenas'],
  endpoints: (builder) => ({
    // Player endpoints
    registerPlayer: builder.mutation({
      query: (playerData) => ({
        url: '/api/players/register',
        method: 'POST',
        body: playerData,
      }),
      invalidatesTags: ['Player'],
    }),
    getPlayer: builder.query({
      query: (playerId) => `/api/players/${playerId}`,
      providesTags: ['Player'],
    }),
    getPlayerStats: builder.query({
      query: (playerId) => `/api/players/${playerId}/stats`,
      providesTags: ['Player'],
    }),
    updatePlayer: builder.mutation({
      query: ({ playerId, ...updates }) => ({
        url: `/api/players/${playerId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Player'],
    }),

    // Game endpoints
    getGames: builder.query({
      query: () => '/api/games',
      providesTags: ['Games'],
    }),
    getGame: builder.query({
      query: (gameId) => `/api/games/${gameId}`,
      providesTags: ['Games'],
    }),
    recordMatch: builder.mutation({
      query: ({ gameId, ...matchData }) => ({
        url: `/api/games/${gameId}/match`,
        method: 'POST',
        body: matchData,
      }),
      invalidatesTags: ['Player', 'Leaderboard'],
    }),

    // Leaderboard endpoints
    getGlobalLeaderboard: builder.query({
      query: (params = {}) => ({
        url: '/api/leaderboard/global',
        params,
      }),
      providesTags: ['Leaderboard'],
    }),
    getGameLeaderboard: builder.query({
      query: ({ gameId, ...params }) => ({
        url: `/api/leaderboard/${gameId}`,
        params,
      }),
      providesTags: ['Leaderboard'],
    }),
    getPlayerRank: builder.query({
      query: ({ gameId, playerId, ...params }) => ({
        url: `/api/leaderboard/${gameId}/player/${playerId}`,
        params,
      }),
      providesTags: ['Leaderboard'],
    }),

    // Arena endpoints
    createArena: builder.mutation({
      query: (arenaData) => ({
        url: '/api/arenas',
        method: 'POST',
        body: arenaData,
      }),
      invalidatesTags: ['Arenas'],
    }),
    getArenas: builder.query({
      query: (params = {}) => ({
        url: '/api/arenas',
        params,
      }),
      providesTags: ['Arenas'],
    }),
    getArena: builder.query({
      query: (arenaId) => `/api/arenas/${arenaId}`,
      providesTags: ['Arenas'],
    }),
    joinArena: builder.mutation({
      query: ({ arenaId, playerId }) => ({
        url: `/api/arenas/${arenaId}/join`,
        method: 'POST',
        body: { playerId },
      }),
      invalidatesTags: ['Arenas'],
    }),
    completeArena: builder.mutation({
      query: ({ arenaId, results }) => ({
        url: `/api/arenas/${arenaId}/complete`,
        method: 'POST',
        body: { results },
      }),
      invalidatesTags: ['Arenas', 'Player', 'Leaderboard'],
    }),
  }),
});

export const {
  useRegisterPlayerMutation,
  useGetPlayerQuery,
  useGetPlayerStatsQuery,
  useUpdatePlayerMutation,
  useGetGamesQuery,
  useGetGameQuery,
  useRecordMatchMutation,
  useGetGlobalLeaderboardQuery,
  useGetGameLeaderboardQuery,
  useGetPlayerRankQuery,
  useCreateArenaMutation,
  useGetArenasQuery,
  useGetArenaQuery,
  useJoinArenaMutation,
  useCompleteArenaMutation,
} = apiSlice;
