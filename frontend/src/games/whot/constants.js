// Whot Game Constants

export const SHAPES = {
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  CROSS: 'cross',
  SQUARE: 'square',
  STAR: 'star'
};

export const SHAPE_COLORS = {
  [SHAPES.CIRCLE]: 0xdc143c,      // Crimson Red
  [SHAPES.TRIANGLE]: 0x228b22,    // Forest Green
  [SHAPES.CROSS]: 0x1e90ff,       // Dodger Blue
  [SHAPES.SQUARE]: 0xffa500,      // Orange
  [SHAPES.STAR]: 0x9370db         // Medium Purple
};

// UI Color Palette
export const UI_COLORS = {
  TABLE_GREEN: 0x0a5d2e,
  TABLE_PATTERN: 0x0d6b3f,
  CARD_WHITE: 0xffffff,
  CARD_BORDER: 0x2c2c2c,
  CARD_SHADOW: 0x000000,
  GOLD: 0xffd700,
  HIGHLIGHT: 0x00ff88,
  ERROR: 0xff4444,
  SUCCESS: 0x44ff44,
  INFO: 0x4444ff
};

// Animation Configuration
export const ANIMATIONS = {
  CARD_PLAY_DURATION: 400,
  CARD_DRAW_DURATION: 300,
  CARD_HOVER_DURATION: 150,
  CARD_FLIP_DURATION: 300,
  TURN_TRANSITION: 500,
  PARTICLE_LIFETIME: 1000,
  GLOW_PULSE_DURATION: 1500
};

// Visual Effects Configuration
export const EFFECTS = {
  CARD_SHADOW_BLUR: 10,
  CARD_SHADOW_OFFSET_X: 2,
  CARD_SHADOW_OFFSET_Y: 4,
  CARD_HOVER_LIFT: 25,
  CARD_HOVER_SCALE: 1.15,
  CARD_FAN_ROTATION: 0.08,
  GLOW_INTENSITY: 0.6,
  PARTICLE_COUNT: 15
};

export const SPECIAL_CARDS = {
  WHOT: 20,
  PICK_TWO: 2,
  PICK_THREE: 5,
  GENERAL_MARKET: 14,
  HOLD_ON: 1,
  SUSPENSION: 8
};

export const CARD_NUMBERS = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 20];

export const GAME_CONFIG = {
  STARTING_CARDS: 4,
  NUM_AI_PLAYERS: 3,
  MAX_DRAW_ATTEMPTS: 3,
  CARD_WIDTH: 100,
  CARD_HEIGHT: 140,
  CARD_SPACING: 15
};

export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Standard Whot deck composition
export const DECK_COMPOSITION = [
  // Circles (12 cards)
  { shape: SHAPES.CIRCLE, number: 1 },
  { shape: SHAPES.CIRCLE, number: 2 },
  { shape: SHAPES.CIRCLE, number: 3 },
  { shape: SHAPES.CIRCLE, number: 4 },
  { shape: SHAPES.CIRCLE, number: 5 },
  { shape: SHAPES.CIRCLE, number: 7 },
  { shape: SHAPES.CIRCLE, number: 8 },
  { shape: SHAPES.CIRCLE, number: 10 },
  { shape: SHAPES.CIRCLE, number: 11 },
  { shape: SHAPES.CIRCLE, number: 12 },
  { shape: SHAPES.CIRCLE, number: 13 },
  { shape: SHAPES.CIRCLE, number: 14 },

  // Triangles (12 cards)
  { shape: SHAPES.TRIANGLE, number: 1 },
  { shape: SHAPES.TRIANGLE, number: 2 },
  { shape: SHAPES.TRIANGLE, number: 3 },
  { shape: SHAPES.TRIANGLE, number: 4 },
  { shape: SHAPES.TRIANGLE, number: 5 },
  { shape: SHAPES.TRIANGLE, number: 7 },
  { shape: SHAPES.TRIANGLE, number: 8 },
  { shape: SHAPES.TRIANGLE, number: 10 },
  { shape: SHAPES.TRIANGLE, number: 11 },
  { shape: SHAPES.TRIANGLE, number: 12 },
  { shape: SHAPES.TRIANGLE, number: 13 },
  { shape: SHAPES.TRIANGLE, number: 14 },

  // Crosses (12 cards)
  { shape: SHAPES.CROSS, number: 1 },
  { shape: SHAPES.CROSS, number: 2 },
  { shape: SHAPES.CROSS, number: 3 },
  { shape: SHAPES.CROSS, number: 4 },
  { shape: SHAPES.CROSS, number: 5 },
  { shape: SHAPES.CROSS, number: 7 },
  { shape: SHAPES.CROSS, number: 8 },
  { shape: SHAPES.CROSS, number: 10 },
  { shape: SHAPES.CROSS, number: 11 },
  { shape: SHAPES.CROSS, number: 12 },
  { shape: SHAPES.CROSS, number: 13 },
  { shape: SHAPES.CROSS, number: 14 },

  // Squares (12 cards)
  { shape: SHAPES.SQUARE, number: 1 },
  { shape: SHAPES.SQUARE, number: 2 },
  { shape: SHAPES.SQUARE, number: 3 },
  { shape: SHAPES.SQUARE, number: 4 },
  { shape: SHAPES.SQUARE, number: 5 },
  { shape: SHAPES.SQUARE, number: 7 },
  { shape: SHAPES.SQUARE, number: 8 },
  { shape: SHAPES.SQUARE, number: 10 },
  { shape: SHAPES.SQUARE, number: 11 },
  { shape: SHAPES.SQUARE, number: 12 },
  { shape: SHAPES.SQUARE, number: 13 },
  { shape: SHAPES.SQUARE, number: 14 },

  // Stars (8 cards)
  { shape: SHAPES.STAR, number: 1 },
  { shape: SHAPES.STAR, number: 2 },
  { shape: SHAPES.STAR, number: 3 },
  { shape: SHAPES.STAR, number: 4 },
  { shape: SHAPES.STAR, number: 5 },
  { shape: SHAPES.STAR, number: 7 },
  { shape: SHAPES.STAR, number: 8 },
  { shape: SHAPES.STAR, number: 14 },

  // Whot cards (5 cards - can be played on anything)
  { shape: SHAPES.CIRCLE, number: 20 },
  { shape: SHAPES.TRIANGLE, number: 20 },
  { shape: SHAPES.CROSS, number: 20 },
  { shape: SHAPES.SQUARE, number: 20 },
  { shape: SHAPES.STAR, number: 20 }
];
