// frontend/src/ui/components/Sidebar.js
import { userStore } from '../../state/userStore.js';
import { createElement, createIcons, Home, Trophy, ShoppingBag, Gift, Settings, LogOut, Wallet, Sparkles } from 'lucide';


const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, href: 'dashboard', active: true },
  { label: 'Leaderboard', icon: Trophy, href: 'leaderboard' },
  { label: 'Marketplace', icon: ShoppingBag, href: 'marketplace' },
  { label: 'Rewards', icon: Gift, href: 'rewards' },
  { label: 'Settings', icon: Settings, href: 'settings' },
];

export class Sidebar {
  constructor() {
    this.element = null;
    this.unsubscribe = userStore.subscribe(() => this.updateDisplay());
  }

  render() {
    const player = userStore.player;

    this.element = document.createElement('aside');
    this.element.className = `
      sticky top-0 left-0 z-50 w-72 h-screen bg-gradient-to-b from-[#1d1d1d] to-black text-white
      flex flex-col shadow-2xl border-r border-white/5 overflow-y-auto p-4
    `;

    this.element.innerHTML = `
      <!-- Header -->
      <div class="pb-8">
        <div class="flex items-center gap-3">
          <div class="text-3xl font-bold bg-gradient-to-r from-transparent via-white/80 to-white bg-clip-text text-transparent">
            Oasis
          </div>
        </div>
      </div>

      <!-- Player Card/Wallet -->
      <div class="mb-4">
        <div class="min-h-[10rem] flex items-center gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">

        </div>
      </div>

      <div class="mb-5">
        <!-- Navigation Menu -->
        <nav class="nav-container flex-1 space-y-1"></nav>

        <!-- Logout -->
        <div class="">
          <button class="logout-btn w-full flex items-center gap-4 py-2 rounded-xl text-red-400 hover:text-red-300 transition-all group">
            <div class="logout-icon"></div>
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-white/5">
        <p class="text-xs text-white/40 text-center">
          <a href="#" class="hover:text-white/60 transition">Terms</a> & 
          <a href="#" class="hover:text-white/60 transition"> Privacy</a>
        </p>
      </div>
    `;

    // Render dynamic navigation
    const navContainer = this.element.querySelector('.nav-container');
    NAV_ITEMS.forEach(item => {
      const isActive = item.active || false;

      const navItem = document.createElement('div');
      navItem.className = `
        nav-item flex items-center gap-4 py-2.5 rounded-xl transition-all group cursor-pointer
        ${isActive
          ? 'active-nav text-white'
          : 'text-white/50 hover:text-white'
        }
        hover:pl-6
      `;
      navItem.dataset.href = item.href;

      navItem.innerHTML = `
        <div class="icon-placeholder"></div>
        <span class="font-medium">${item.label}</span>
      `;

      // Insert icon
      const iconEl = createElement(item.icon, {
        size: 22,
        class: 'text-current group-hover:scale-110 transition-transform'
      });
      navItem.querySelector('.icon-placeholder').appendChild(iconEl);

      // Click handler
      navItem.addEventListener('click', () => {
        this.setActiveNav(item.href);
        console.log(`Navigate to: ${item.href}`); // Replace with your router
      });

      navContainer.appendChild(navItem);
    });

    // Insert static icons
    this.insertIcon('.sparkles-icon', createElement(Sparkles, { size: 28, class: 'text-white' }));
    this.insertIcon('.wallet-icon', createElement(Wallet, { size: 20, class: 'text-yellow-400' }));
    this.insertIcon('.logout-icon', createElement(LogOut, { size: 20, class: 'group-hover:rotate-12 transition-transform' }));

    // Logout handler
    this.element.querySelector('.logout-btn').addEventListener('click', () => {
      userStore.logout();
    });

    return this.element;
  }

  // Helper to set active nav item
  setActiveNav(href) {
    this.element.querySelectorAll('.nav-item').forEach(item => {
      const isMatch = item.dataset.href === href;
      item.classList.toggle('active-nav', isMatch);
      item.classList.toggle('text-white', isMatch);
      item.classList.toggle('bg-white/5', isMatch);
      item.classList.toggle('text-white/50', !isMatch);

      // Update active dot
      const dot = item.querySelector('.ml-auto');
      if (dot) dot.remove();
      if (isMatch) {
        const activeDot = document.createElement('div');
        activeDot.className = 'ml-auto w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full';
        item.appendChild(activeDot);
      }
    });
  }

  insertIcon(selector, iconElement) {
    const container = this.element.querySelector(selector);
    if (container) container.appendChild(iconElement);
  }

  updateDisplay() {
    if (!this.element) return;

    const player = userStore.player;
    const tokenEl = this.element.querySelector('.token-amount');
    const usernameEl = this.element.querySelector('.username-truncate');
    const avatarEl = this.element.querySelector('.player-avatar');

    if (tokenEl) tokenEl.textContent = (player?.tokens || 0).toFixed(2);
    if (usernameEl && player?.username) usernameEl.textContent = player.username;
    if (avatarEl && player?.username) avatarEl.textContent = player.username[0].toUpperCase();
  }

  cleanup() {
    this.unsubscribe();
  }
}