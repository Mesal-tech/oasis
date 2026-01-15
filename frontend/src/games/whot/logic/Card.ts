export type WhotShape = 'Circle' | 'Triangle' | 'Cross' | 'Square' | 'Star' | 'Whot';

export interface CardData {
  shape: WhotShape;
  number: number;
}

export class WhotCard {
  public readonly id: string;
  public readonly shape: WhotShape;
  public readonly number: number;

  constructor(shape: WhotShape, number: number) {
    this.shape = shape;
    this.number = number;
    this.id = `${shape}_${number}`;
  }

  isWhot(): boolean {
    return this.number === 20;
  }

  isSpecial(): boolean {
    // Special numbers from cards.json: 1, 2, 5, 8, 14, 20
    return [1, 2, 5, 8, 14, 20].includes(this.number);
  }

  canPlayOn(topCard: WhotCard, requestedShape: WhotShape | null): boolean {
    // Whot (20) can be played on anything
    if (this.isWhot()) return true;

    // If a shape was requested via Whot card
    if (requestedShape) {
      return this.shape === requestedShape;
    }

    // Standard matching: same shape or same number
    return this.shape === topCard.shape || this.number === topCard.number;
  }

  getEffectDescription(): string {
    switch (this.number) {
      case 1: return "Hold On - Next player misses a turn";
      case 2: return "Pick Two - Next player draws 2 cards";
      case 5: return "Pick Three - Next player draws 3 cards";
      case 8: return "Suspension - Skip next player";
      case 14: return "General Market - All players draw 1 card";
      case 20: return "Whot - Choose a new shape";
      default: return "";
    }
  }
}
