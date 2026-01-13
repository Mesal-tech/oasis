import { AI_DIFFICULTY } from './constants.js';

export class Player {
  constructor(name, isAI = false, difficulty = AI_DIFFICULTY.MEDIUM) {
    this.name = name;
    this.isAI = isAI;
    this.difficulty = difficulty;
    this.hand = [];
  }

  addCard(card) {
    this.hand.push(card);
  }

  addCards(cards) {
    this.hand.push(...cards);
  }

  removeCard(card) {
    const index = this.hand.findIndex(c => c.id === card.id);
    if (index !== -1) {
      return this.hand.splice(index, 1)[0];
    }
    return null;
  }

  getPlayableCards(topCard, requestedShape = null) {
    return this.hand.filter(card => card.canPlayOn(topCard, requestedShape));
  }

  hasPlayableCard(topCard, requestedShape = null) {
    return this.getPlayableCards(topCard, requestedShape).length > 0;
  }

  getCardCount() {
    return this.hand.length;
  }

  hasWon() {
    return this.hand.length === 0;
  }

  // AI Decision Making
  chooseCardToPlay(topCard, requestedShape = null) {
    if (!this.isAI) return null;

    const playableCards = this.getPlayableCards(topCard, requestedShape);
    if (playableCards.length === 0) return null;

    switch (this.difficulty) {
      case AI_DIFFICULTY.EASY:
        return this.chooseCardEasy(playableCards);
      case AI_DIFFICULTY.MEDIUM:
        return this.chooseCardMedium(playableCards);
      case AI_DIFFICULTY.HARD:
        return this.chooseCardHard(playableCards, topCard);
      default:
        return playableCards[0];
    }
  }

  chooseCardEasy(playableCards) {
    // Easy: Random selection
    return playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  chooseCardMedium(playableCards) {
    // Medium: Prioritize special cards, then highest number
    const specialCards = playableCards.filter(c => c.isSpecial());
    if (specialCards.length > 0) {
      return specialCards[0];
    }

    // Play highest number card
    return playableCards.reduce((highest, card) =>
      card.number > highest.number ? card : highest
    );
  }

  chooseCardHard(playableCards, topCard) {
    // Hard: Advanced strategy
    // 1. If last card, play it
    if (this.hand.length === 1) {
      return playableCards[0];
    }

    // 2. Prioritize Whot cards when beneficial
    const whotCards = playableCards.filter(c => c.isWhot());
    if (whotCards.length > 0 && this.hand.length <= 3) {
      return whotCards[0];
    }

    // 3. Play offensive special cards
    const pickCards = playableCards.filter(c => c.isPickTwo() || c.isPickThree());
    if (pickCards.length > 0) {
      return pickCards[0];
    }

    // 4. Play General Market or Suspension
    const disruptiveCards = playableCards.filter(c => c.isGeneralMarket() || c.isSuspension());
    if (disruptiveCards.length > 0) {
      return disruptiveCards[0];
    }

    // 5. Play cards that match number (to keep shape options open)
    const numberMatches = playableCards.filter(c => c.number === topCard.number && !c.isWhot());
    if (numberMatches.length > 0) {
      return numberMatches[0];
    }

    // 6. Play highest number
    return playableCards.reduce((highest, card) =>
      card.number > highest.number ? card : highest
    );
  }

  chooseShapeForWhot() {
    if (!this.isAI) return null;

    // Count cards by shape
    const shapeCounts = {};
    this.hand.forEach(card => {
      if (!card.isWhot()) {
        shapeCounts[card.shape] = (shapeCounts[card.shape] || 0) + 1;
      }
    });

    // Choose shape with most cards
    let maxShape = null;
    let maxCount = 0;
    for (const [shape, count] of Object.entries(shapeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxShape = shape;
      }
    }

    return maxShape;
  }
}
