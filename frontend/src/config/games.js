// ===== frontend/src / config / games.js =====
const GAMES = [
  {
    id: 'slither',
    title: 'Slither.io',
    icon: '🐍',
    description: 'Grow your snake and compete online',
    category: 'multiplayer',
    players: 1542,
    earnRate: '2x',
    thumbnail: '/assets/slither-thumb.jpg'
  },
  {
    id: 'flappy',
    title: 'Flappy Bird',
    icon: '🦅',
    description: 'Navigate through pipes and earn rewards',
    category: 'arcade',
    players: 3284,
    earnRate: '1.5x',
    thumbnail: '/assets/flappy-thumb.jpg'
  },
  {
    id: 'racing',
    title: 'Speed Racer',
    icon: '🏎️',
    description: 'Race against opponents in real-time',
    category: 'racing',
    players: 892,
    earnRate: '3x',
    thumbnail: '/assets/racing-thumb.jpg'
  },
];

export default GAMES;