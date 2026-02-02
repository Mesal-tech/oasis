export const GAMES = [
  {
    id: 'slither',
    title: 'Slither.io',
    icon: '🐍',
    description: 'Grow your snake and compete online',
    category: 'multiplayer',
    earnRate: '2x',
    thumbnail: '/assets/slither-thumb.jpg',
  },
  {
    id: 'flappy',
    title: 'Flappy Bird',
    icon: '🦅',
    description: 'Navigate through pipes and earn rewards',
    category: 'arcade',
    earnRate: '1.5x',
    thumbnail: '/assets/flappy-thumb.jpg',
  },
  {
    id: 'cards',
    title: 'Cards',
    icon: '🃏',
    description: 'Play classic card games online',
    category: 'multiplayer',
    earnRate: '1.2x',
    thumbnail: '/assets/cards-thumb.png',
  },
  {
    id: 'checkers',
    title: 'Checkers',
    icon: '🔴',
    description: 'Classic strategy board game',
    category: 'board',
    earnRate: '1x',
    thumbnail: '/assets/checkers-thumb.jpg',
  },
  {
    id: 'whot',
    title: 'Naija Whot',
    icon: '🃏',
    description: 'Play the classic Nigerian card game',
    category: 'cards',
    earnRate: '1.5x',
    thumbnail: '/assets/whot-thumb.jpg',
  },
];

export const SKILLS = [
  { id: 'speed', name: 'Boost', icon: '⚡', color: 'from-yellow-500 to-orange-500', desc: '+50% speed for 6s' },
  { id: 'shield', name: 'Shield', icon: '🛡️', color: 'from-blue-500 to-primary-500', desc: 'Block one hit' },
  { id: 'ghost', name: 'Ghost', icon: '👻', color: 'from-purple-500 to-pink-500', desc: 'Pass through snakes 5s' },
  { id: 'magnet', name: 'Magnet', icon: '🧲', color: 'from-green-500 to-teal-500', desc: 'Pull food toward you' },
  { id: 'cut', name: 'Cut', icon: '✂️', color: 'from-red-500 to-rose-500', desc: 'Sever enemy tails' },
  { id: 'freeze', name: 'Freeze', icon: '❄️', color: 'from-primary-400 to-blue-600', desc: 'Slow all enemies 4s' }
];

export const SLITHER_SKINS = [
  { id: 'default', name: 'Classic Green', color: '#00ff88', img: '/assets/slither/skins/skin_green.png' },
  { id: 'neon-blue', name: 'Neon Blue', color: '#00d4ff', img: '/assets/slither/skins/skin_neon.png' },
  { id: 'fire', name: 'Magma Red', color: '#ff4444', img: '/assets/slither/skins/skin_fire.png' },
  { id: 'galaxy', name: 'Cosmic Purple', color: '#aa00ff', img: '/assets/slither/skins/skin_galaxy.png' },
  { id: 'gold', name: 'Golden Luck', color: '#ffd700', img: '/assets/slither/skins/skin_galaxy.png' }
];
