import { WhotCard, type WhotShape } from './Card';
import cardsConfig from '../cards.json';

export class WhotDeck {
  private cards: WhotCard[] = [];
  private discardPile: WhotCard[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.cards = [];
    this.discardPile = [];

    // 1. Generate standard shapes from cards.json
    cardsConfig.shapes.forEach(shapeConfig => {
      const shape = shapeConfig.name as WhotShape;
      shapeConfig.cards.forEach(num => {
        this.cards.push(new WhotCard(shape, num));
      });
    });

    // 2. Generate Whot cards (20s)
    // Whot cards in cards.json are just "whotCards" with a count
    // They are usually considered as having no specific shape or a wildcard shape
    // But for matching logic, we can treat them as "Whot" shape
    for (let i = 0; i < cardsConfig.whotCards.count; i++) {
        // Use 'Whot' as the shape for the 20 cards
        this.cards.push(new WhotCard('Whot', 20));
    }

    this.shuffle();
  }

  public shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public draw(): WhotCard | null {
    if (this.cards.length === 0) {
      this.reshuffleDiscard();
    }
    return this.cards.pop() || null;
  }

  private reshuffleDiscard() {
    if (this.discardPile.length <= 1) return;
    
    const topCard = this.discardPile.pop()!;
    this.cards = [...this.discardPile];
    this.discardPile = [topCard];
    this.shuffle();
  }

  public discard(card: WhotCard) {
    this.discardPile.push(card);
  }

  public getTopCard(): WhotCard | null {
    return this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null;
  }

  public getRemainingCount(): number {
    return this.cards.length;
  }
  
  public getDiscardPile(): WhotCard[] {
      return this.discardPile;
  }
}
