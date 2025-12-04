// ===== frontend/src/state/userStore.js =====
export const userStore = {
  player: {
    id: 'player_001',
    name: 'Sal',
    tokens: 1250.50,
    avatar: 'P',
    stats: {
      wins: 24,
      losses: 12,
      totalGames: 36
    }
  },

  updateTokens(amount) {
    this.player.tokens += amount;
    this.notifyListeners();
  },

  listeners: [],
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },
  notifyListeners() {
    this.listeners.forEach(fn => fn(this.player));
  }
};