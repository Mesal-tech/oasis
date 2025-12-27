const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Player endpoints
  async registerPlayer(playerData) {
    return this.request('/api/players/register', {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async getPlayer(playerId) {
    return this.request(`/api/players/${playerId}`);
  }

  async getPlayerStats(playerId) {
    return this.request(`/api/players/${playerId}/stats`);
  }

  async updatePlayer(playerId, updates) {
    return this.request(`/api/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Game endpoints
  async getGames() {
    return this.request('/api/games');
  }

  async getGame(gameId) {
    return this.request(`/api/games/${gameId}`);
  }

  async recordMatch(gameId, matchData) {
    return this.request(`/api/games/${gameId}/match`, {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  // Leaderboard endpoints
  async getGlobalLeaderboard(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/leaderboard/global${query ? `?${query}` : ''}`);
  }

  async getGameLeaderboard(gameId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/leaderboard/${gameId}${query ? `?${query}` : ''}`);
  }

  async getPlayerRank(gameId, playerId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/leaderboard/${gameId}/player/${playerId}${query ? `?${query}` : ''}`);
  }

  // Arena endpoints
  async createArena(arenaData) {
    return this.request('/api/arenas', {
      method: 'POST',
      body: JSON.stringify(arenaData),
    });
  }

  async getArenas(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/arenas${query ? `?${query}` : ''}`);
  }

  async getArena(arenaId) {
    return this.request(`/api/arenas/${arenaId}`);
  }

  async joinArena(arenaId, playerId) {
    return this.request(`/api/arenas/${arenaId}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async completeArena(arenaId, results) {
    return this.request(`/api/arenas/${arenaId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ results }),
    });
  }
}

export default new ApiClient();
