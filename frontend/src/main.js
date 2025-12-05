import { router } from './router.js';
import { Sidebar } from './ui/components/Sidebar.js';
import { MainLobby } from './ui/screens/MainLobby/MainLobby.js';
import { GameScreen } from './ui/screens/GameLobby/GameLobby.js';
import { DashboardScreen } from './ui/screens/Dashboard.js';
import { LeaderboardScreen } from './ui/screens/Leaderboard.js';
import { MarketplaceScreen } from './ui/screens/Marketplace.js';
import { RewardsScreen } from './ui/screens/Rewards.js';

const app = document.getElementById('app');


// ---- Sidebar ----
const sidebar = new Sidebar();
app.appendChild(sidebar.render()); 

const screensContainer = document.createElement('div');
screensContainer.id = 'screensContainer';
screensContainer.style.cssText = `
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
app.appendChild(screensContainer);

let currentScreen = null;

// Define routes
router
  .on('/leaderboard', () => {
    if (currentScreen?.cleanup) currentScreen.cleanup();
    currentScreen = new LeaderboardScreen();
    screensContainer.innerHTML = '';
    screensContainer.appendChild(currentScreen.render());
  })
  .on('/marketplace', () => {
    if (currentScreen?.cleanup) currentScreen.cleanup();
    currentScreen = new MarketplaceScreen();
    screensContainer.innerHTML = '';
    screensContainer.appendChild(currentScreen.render());
  })
  .on('/rewards', () => {
    if (currentScreen?.cleanup) currentScreen.cleanup();
    currentScreen = new RewardsScreen();
    screensContainer.innerHTML = '';
    screensContainer.appendChild(currentScreen.render());
  })
  .on('/', () => {
    if (currentScreen?.cleanup) currentScreen.cleanup();

    currentScreen = new MainLobby();
    screensContainer.innerHTML = '';
    screensContainer.appendChild(currentScreen.render());
  })
  .on('/game/:gameName', ({ data }) => {
    if (currentScreen?.cleanup) currentScreen.cleanup();

    currentScreen = new GameScreen(data.gameName);
    screensContainer.innerHTML = '';
    screensContainer.appendChild(currentScreen.render());
  })
  .on('/game/:gameName/level/:level', ({ data }) => {
    if (currentScreen?.cleanup) currentScreen.cleanup();

    currentScreen = new GameScreen(data.gameName, { level: data.level });
    screensContainer.innerHTML = '';
    screensContainer.appendChild(currentScreen.render());
  })
  .notFound(() => {
    router.navigate('/');
  });

// Start router
router.resolve();