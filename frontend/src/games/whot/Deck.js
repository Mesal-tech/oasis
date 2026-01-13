import { Card } from './Card.js';
import { DECK_COMPOSITION } from './constants.js';

export class Deck {
  constructor() {
    this.cards = [];
    this.discardPile = [];
    this.initialize();
  }

  initialize() {
    // Create all cards from deck composition
    this.cards = DECK_COMPOSITION.map(cardData =>
      new Card(cardData.shape, cardData.number)
    );
    this.shuffle();
  }

  shuffle() {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    // If deck is empty, reshuffle discard pile (except top card)
    if (this.cards.length === 0) {
      if (this.discardPile.length > 1) {
        const topCard = this.discardPile.pop();
        this.cards = [...this.discardPile];
        this.discardPile = [topCard];
        this.shuffle();
      } else {
        return null; // No cards left at all
      }
    }
    return this.cards.pop();
  }

  drawMultiple(count) {
    const drawnCards = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) {
        drawnCards.push(card);
      }
    }
    return drawnCards;
  }

  discard(card) {
    this.discardPile.push(card);
  }

  getTopCard() {
    return this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null;
  }

  getRemainingCount() {
    return this.cards.length;
  }

  getDiscardCount() {
    return this.discardPile.length;
  }
}
