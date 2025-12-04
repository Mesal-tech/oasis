// ===== frontend/src/main.js =====
import { router } from './router.js';
import { Sidebar } from './ui/components/Sidebar.js';
import "./styles/main.css"

const app = document.getElementById('app');

// ---- Sidebar ----
const sidebar = new Sidebar();
app.appendChild(sidebar.render());

// ---- MAIN SCREEN CONTAINER ----
const screensContainer = document.createElement('div');
screensContainer.id = 'screensContainer';
screensContainer.style.cssText = `
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
app.appendChild(screensContainer);

// ---- ROUTER INIT ----
router.init(screensContainer);

// ---- LOAD MAIN LOBBY ----
await router.navigateTo('lobby');