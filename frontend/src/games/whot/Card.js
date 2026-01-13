import { SPECIAL_CARDS } from './constants.js';

export class Card {
  constructor(shape, number) {
    this.shape = shape;
    this.number = number;
    this.id = `${shape}_${number}`;
  }

  isWhot() {
    return this.number === SPECIAL_CARDS.WHOT;
  }

  isPickTwo() {
    return this.number === SPECIAL_CARDS.PICK_TWO;
  }

  isPickThree() {
    return this.number === SPECIAL_CARDS.PICK_THREE;
  }

  isGeneralMarket() {
    return this.number === SPECIAL_CARDS.GENERAL_MARKET;
  }

  isHoldOn() {
    return this.number === SPECIAL_CARDS.HOLD_ON;
  }

  isSuspension() {
    return this.number === SPECIAL_CARDS.SUSPENSION;
  }

  isSpecial() {
    return this.isWhot() || this.isPickTwo() || this.isPickThree() ||
      this.isGeneralMarket() || this.isHoldOn() || this.isSuspension();
  }

  canPlayOn(topCard, requestedShape = null) {
    // Whot can be played on anything
    if (this.isWhot()) {
      return true;
    }

    // If a shape was requested (after a Whot card), must match that shape
    if (requestedShape) {
      return this.shape === requestedShape;
    }

    // Otherwise, must match either shape or number
    return this.shape === topCard.shape || this.number === topCard.number;
  }

  getSpecialCardName() {
    if (this.isWhot()) return 'Whot!';
    if (this.isPickTwo()) return 'Pick Two';
    if (this.isPickThree()) return 'Pick Three';
    if (this.isGeneralMarket()) return 'General Market';
    if (this.isHoldOn()) return 'Hold On';
    if (this.isSuspension()) return 'Suspension';
    return null;
  }

  toString() {
    return `${this.shape} ${this.number}`;
  }
}
