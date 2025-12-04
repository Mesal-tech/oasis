// ===== frontend/src/router.js =====
export const router = {
  container: null,
  currentScreen: null,
  screens: {},

  init(container) {
    this.container = container;
  },

  async navigateTo(screenName) {
    if (this.currentScreen) {
      this.currentScreen.cleanup?.();
    }

    let screen;
    try {
      if (screenName == 'lobby') {
        const { MainLobby } = await import('./ui/screens/MainLobby/MainLobby.js');
        screen = new MainLobby();
      } else if (screenName.startsWith('game-')) {
        const gameName = screenName.split('-')[1];
        const { GameScreen } = await import('./ui/screens/GameLobby/GameLobby.js');
        screen = new GameScreen(gameName);
      }

      if (screen) {
        this.container.innerHTML = '';
        const element = screen.render();
        this.container.appendChild(element);
        this.currentScreen = screen;
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }
};