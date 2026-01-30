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
    id: 'cards',
    title: 'Cards',
    icon: '🃏',
    description: 'Play classic card games online',
    category: 'multiplayer',
    players: 1240,
    earnRate: '1.2x',
    thumbnail: '/assets/cards-thumb.png'
  },
  {
    id: 'checkers',
    title: 'Checkers',
    icon: '🔴',
    description: 'Classic strategy board game',
    category: 'board',
    players: 100,
    earnRate: '1x',
    thumbnail: '/assets/checkers-thumb.jpg'
  },
  {
    id: 'whot',
    title: 'Naija Whot',
    icon: '🃏',
    description: 'Play the classic Nigerian card game',
    category: 'cards',
    players: 0,
    earnRate: '1.5x',
    thumbnail: '/assets/whot-thumb.png'
  },
];

export default GAMES;