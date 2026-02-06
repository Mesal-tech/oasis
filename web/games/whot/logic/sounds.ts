// Sound utility for Whot game
// Sound files should be placed in /public/assets/whot/sounds/

const SOUND_PATHS = {
  // Card actions
  cardPick: '/assets/whot/sounds/card_pick.wav',      // When drawing a card from deck
  cardPlay: '/assets/whot/sounds/card_play.wav',      // When playing a card to discard pile
  cardDeal: '/assets/whot/sounds/card_deal.wav',      // During initial deal

  // Special card sounds (consolidated)
  // Pick Two, Pick Three, and General Market use the same sound as card pick
  pickTwo: '/assets/whot/sounds/card_pick.wav',
  pickThree: '/assets/whot/sounds/card_pick.wav',
  generalMarket: '/assets/whot/sounds/card_pick.wav',

  // Hold On and Suspension use the same sound
  holdOn: '/assets/whot/sounds/hold_on.wav',
  suspension: '/assets/whot/sounds/hold_on.wav',

  // Whot card
  whot: '/assets/whot/sounds/whot.wav',               // When Whot (20) is played

  // Game events
  yourTurn: '/assets/whot/sounds/your_turn.wav',      // When it becomes player's turn
  victory: '/assets/whot/sounds/victory.wav',         // When player wins
  defeat: '/assets/whot/sounds/defeat.wav',           // When player loses
} as const;

export type SoundName = keyof typeof SOUND_PATHS;

class WhotSoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
      Object.values(SOUND_PATHS).forEach(path => {
        this.preload(path);
      });
    }
  }

  private preload(path: string) {
    if (this.audioCache.has(path)) return;

    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = this.volume;
    this.audioCache.set(path, audio);
  }

  play(soundName: SoundName) {
    if (!this.enabled || typeof window === 'undefined') return;

    const path = SOUND_PATHS[soundName];
    let audio = this.audioCache.get(path);

    if (!audio) {
      audio = new Audio(path);
      audio.volume = this.volume;
      this.audioCache.set(path, audio);
    }

    // Clone and play to allow overlapping sounds
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = this.volume;
    clone.play().catch(() => {
      // Ignore autoplay errors - user interaction required
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }
}

// Singleton instance
export const whotSounds = new WhotSoundManager();

// Helper to get sound name for a card number
export function getSoundForCard(cardNumber: number): SoundName | null {
  switch (cardNumber) {
    case 1: return 'holdOn';
    case 2: return 'pickTwo';
    case 5: return 'pickThree';
    case 8: return 'suspension';
    case 14: return 'generalMarket';
    case 20: return 'whot';
    default: return null;
  }
}
