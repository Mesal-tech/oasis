// frontend/src/ui/components/Sidebar.js
// Pure AI, to stop the Compression it initially did to the Components
import { userStore } from '../../state/userStore.js';
import { createElement, Home, Trophy, ShoppingBag, Gift, Settings, LogOut, Wallet, Sparkles } from 'lucide';
import { router } from '../../router.js';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, href: '/', active: true },
  { label: 'Leaderboard', icon: Trophy, href: 'leaderboard' },
  { label: 'Marketplace', icon: ShoppingBag, href: 'marketplace' },
  { label: 'Rewards', icon: Gift, href: 'rewards' },
];

export class Sidebar {
  constructor() {
    this.element = null;
    this.unsubscribe = userStore.subscribe(() => this.updateDisplay());
  }

  render() {
    const player = userStore.player;

    // Create container that holds both sidebar and bottom bar
    this.element = document.createElement('div');
    this.element.className = 'nav-wrapper';

    this.element.innerHTML = `
      <!-- Desktop Sidebar -->
      <aside class="
        hidden md:flex
        sticky top-0 left-0 z-50 w-72 h-screen bg-gradient-to-b from-[#1d1d1d] to-black text-white
        flex-col shadow-2xl border-r border-white/5 overflow-y-auto p-4
      ">
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

        <div class="mb-5 flex-1 flex flex-col">
          <!-- Navigation Menu -->
          <nav class="desktop-nav-container flex-1 space-y-1 mb-6"></nav>

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
      </aside>

      <!-- Mobile Floating Bottom Bar -->
      <nav class="
        md:hidden
        fixed bottom-0 left-1/2 -translate-x-1/2 z-50 
        w-[90%] max-w-md
      ">
        <div class="
          mobile-nav-container 
          flex items-center justify-around 
          px-4 py-3
          bg-white/10 backdrop-blur-xl
          border border-white/20
          rounded-[20vh]
          shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
        ">
          <!-- Nav items will be inserted here -->
        </div>
      </nav>
    `;

    // Render Desktop Navigation
    const desktopNavContainer = this.element.querySelector('.desktop-nav-container');
    NAV_ITEMS.forEach(item => {
      const isActive = item.active || false;

      const navItem = document.createElement('div');
      navItem.className = `
        nav-item flex items-center gap-4 py-2.5 rounded-xl transition-all group cursor-pointer
        ${isActive ? 'active-nav text-white bg-white/5' : 'text-white/50 hover:text-white'}
        hover:pl-6
      `;
      navItem.dataset.href = item.href;

      navItem.innerHTML = `
        <div class="icon-placeholder"></div>
        <span class="font-medium">${item.label}</span>
      `;

      const iconEl = createElement(item.icon, {
        size: 22,
        class: 'text-current group-hover:scale-110 transition-transform'
      });
      navItem.querySelector('.icon-placeholder').appendChild(iconEl);

      navItem.addEventListener('click', () => {
        this.setActiveNav(item.href);
        router.navigate('/' + item.href);
      });


      desktopNavContainer.appendChild(navItem);
    });

    // Render Mobile Navigation (Icon Only)
    const mobileNavContainer = this.element.querySelector('.mobile-nav-container');
    NAV_ITEMS.forEach(item => {
      const isActive = item.active || false;

      const navItem = document.createElement('button');
      navItem.className = `
        mobile-nav-item 
        relative
        flex items-center justify-center 
        w-10 h-10
        rounded-2xl
        transition-all duration-300
        ${isActive
          ? 'bg-white/20 text-white scale-110'
          : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
        }
      `;
      navItem.dataset.href = item.href;

      navItem.innerHTML = `
        <div class="mobile-icon-placeholder"></div>
      `;

      const iconEl = createElement(item.icon, {
        size: 22,
        class: 'transition-transform',
        strokeWidth: isActive ? 2.5 : 2
      });
      navItem.querySelector('.mobile-icon-placeholder').appendChild(iconEl);

      navItem.addEventListener('click', () => {
        this.setActiveNav(item.href);
        router.navigate('/' + item.href);
      });

      mobileNavContainer.appendChild(navItem);
    });

    // Insert static icons for desktop
    this.insertIcon('.sparkles-icon', createElement(Sparkles, { size: 28, class: 'text-white' }));
    this.insertIcon('.wallet-icon', createElement(Wallet, { size: 20, class: 'text-yellow-400' }));
    this.insertIcon('.logout-icon', createElement(LogOut, { size: 20, class: 'group-hover:rotate-12 transition-transform' }));

    // Logout handler
    const logoutBtn = this.element.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        userStore.logout();
      });
    }

    return this.element;
  }

  setActiveNav(href) {
    // Update desktop navigation
    this.element.querySelectorAll('.nav-item').forEach(item => {
      const isMatch = item.dataset.href === href;
      item.classList.toggle('active-nav', isMatch);
      item.classList.toggle('text-white', isMatch);
      item.classList.toggle('bg-white/5', isMatch);
      item.classList.toggle('text-white/50', !isMatch);

      const dot = item.querySelector('.ml-auto');
      if (dot) dot.remove();
      if (isMatch) {
        const activeDot = document.createElement('div');
        activeDot.className = 'ml-auto w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full';
        item.appendChild(activeDot);
      }
    });

    // Update mobile navigation
    this.element.querySelectorAll('.mobile-nav-item').forEach(item => {
      const isMatch = item.dataset.href === href;

      // Update classes
      if (isMatch) {
        item.classList.add('bg-white/20', 'text-white', 'scale-110');
        item.classList.remove('text-white/60');
      } else {
        item.classList.remove('bg-white/20', 'text-white', 'scale-110');
        item.classList.add('text-white/60');
      }

      // Update icon stroke
      const icon = item.querySelector('svg');
      if (icon) {
        icon.style.strokeWidth = isMatch ? '2.5' : '2';
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