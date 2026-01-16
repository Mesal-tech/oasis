import { WhotCard, type WhotShape } from './Card';

export class WhotPlayer {
  public hand: WhotCard[] = [];
  public cardsToDraw: number = 0;
  public readonly name: string;
  public readonly isAI: boolean;

  constructor(name: string, isAI: boolean = false) {
    this.name = name;
    this.isAI = isAI;
  }

  addCard(card: WhotCard) {
    this.hand.push(card);
  }

  addCards(cards: WhotCard[]) {
    this.hand.push(...cards);
  }

  removeCard(card: WhotCard) {
    const index = this.hand.findIndex(c => c.id === card.id);
    if (index !== -1) {
      this.hand.splice(index, 1);
    }
  }

  hasPlayableCard(topCard: WhotCard, requestedShape: WhotShape | null): boolean {
    return this.hand.some(card => card.canPlayOn(topCard, requestedShape));
  }

  getPlayableCards(topCard: WhotCard, requestedShape: WhotShape | null): WhotCard[] {
    return this.hand.filter(card => card.canPlayOn(topCard, requestedShape));
  }

  getScore(): number {
    // Total sum of card numbers in hand
    return this.hand.reduce((sum, card) => sum + card.number, 0);
  }

  hasWon(): boolean {
    return this.hand.length === 0;
  }
}
