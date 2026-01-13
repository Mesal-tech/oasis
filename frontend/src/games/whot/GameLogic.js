import { Deck } from './Deck.js';
import { Player } from './Player.js';
import { GAME_CONFIG, AI_DIFFICULTY } from './constants.js';

export class GameLogic {
  constructor(playerName, aiDifficulty = AI_DIFFICULTY.MEDIUM) {
    this.deck = new Deck();
    this.players = [];
    this.currentPlayerIndex = 0;
    this.requestedShape = null;
    this.turnDirection = 1; // 1 for clockwise, -1 for counter-clockwise
    this.gameOver = false;
    this.winner = null;
    this.skipNextPlayer = false;

    // Initialize players
    this.players.push(new Player(playerName, false));
    for (let i = 0; i < GAME_CONFIG.NUM_AI_PLAYERS; i++) {
      this.players.push(new Player(`AI ${i + 1}`, true, aiDifficulty));
    }

    this.dealInitialCards();
  }

  dealInitialCards() {
    // Deal starting cards to each player
    this.players.forEach(player => {
      const cards = this.deck.drawMultiple(GAME_CONFIG.STARTING_CARDS);
      player.addCards(cards);
    });

    // Place first card on discard pile
    let firstCard = this.deck.draw();
    // Make sure first card is not a special card
    while (firstCard && firstCard.isSpecial()) {
      this.deck.cards.unshift(firstCard); // Put it back at the bottom
      this.deck.shuffle();
      firstCard = this.deck.draw();
    }
    if (firstCard) {
      this.deck.discard(firstCard);
    }
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getTopCard() {
    return this.deck.getTopCard();
  }

  nextTurn() {
    if (this.skipNextPlayer) {
      this.skipNextPlayer = false;
      // Skip one player
      this.currentPlayerIndex = (this.currentPlayerIndex + this.turnDirection + this.players.length) % this.players.length;
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + this.turnDirection + this.players.length) % this.players.length;
  }

  playCard(player, card, chosenShape = null) {
    const topCard = this.getTopCard();

    // Validate card can be played
    if (!card.canPlayOn(topCard, this.requestedShape)) {
      return { success: false, message: 'Invalid card' };
    }

    // Remove card from player's hand
    player.removeCard(card);

    // Place card on discard pile
    this.deck.discard(card);

    // Clear requested shape
    this.requestedShape = null;

    // Handle special card effects
    const effect = this.handleSpecialCard(card, chosenShape);

    // Check for winner
    if (player.hasWon()) {
      this.gameOver = true;
      this.winner = player;
      return { success: true, effect, gameOver: true, winner: player };
    }

    // Move to next turn (unless Hold On was played)
    if (!card.isHoldOn()) {
      this.nextTurn();
    }

    return { success: true, effect };
  }

  handleSpecialCard(card, chosenShape = null) {
    const effect = {
      type: null,
      message: '',
      affectedPlayers: []
    };

    if (card.isWhot()) {
      this.requestedShape = chosenShape;
      effect.type = 'whot';
      effect.message = `Shape changed to ${chosenShape}!`;
    } else if (card.isPickTwo()) {
      const nextPlayer = this.getNextPlayer();
      const drawnCards = this.deck.drawMultiple(2);
      nextPlayer.addCards(drawnCards);
      effect.type = 'pick_two';
      effect.message = `${nextPlayer.name} picks 2 cards!`;
      effect.affectedPlayers = [nextPlayer];
      this.skipNextPlayer = true;
    } else if (card.isPickThree()) {
      const nextPlayer = this.getNextPlayer();
      const drawnCards = this.deck.drawMultiple(3);
      nextPlayer.addCards(drawnCards);
      effect.type = 'pick_three';
      effect.message = `${nextPlayer.name} picks 3 cards!`;
      effect.affectedPlayers = [nextPlayer];
      this.skipNextPlayer = true;
    } else if (card.isGeneralMarket()) {
      this.players.forEach(player => {
        const drawnCard = this.deck.draw();
        if (drawnCard) {
          player.addCard(drawnCard);
        }
      });
      effect.type = 'general_market';
      effect.message = 'General Market! Everyone picks 1 card!';
      effect.affectedPlayers = [...this.players];
    } else if (card.isHoldOn()) {
      effect.type = 'hold_on';
      effect.message = 'Hold On! Play again!';
    } else if (card.isSuspension()) {
      const nextPlayer = this.getNextPlayer();
      effect.type = 'suspension';
      effect.message = `${nextPlayer.name} is suspended!`;
      effect.affectedPlayers = [nextPlayer];
      this.skipNextPlayer = true;
    }

    return effect;
  }

  getNextPlayer() {
    const nextIndex = (this.currentPlayerIndex + this.turnDirection + this.players.length) % this.players.length;
    return this.players[nextIndex];
  }

  drawCard(player) {
    const card = this.deck.draw();
    if (card) {
      player.addCard(card);
      return card;
    }
    return null;
  }

  drawUntilPlayable(player) {
    const drawnCards = [];
    let attempts = 0;
    const topCard = this.getTopCard();

    while (attempts < GAME_CONFIG.MAX_DRAW_ATTEMPTS) {
      if (player.hasPlayableCard(topCard, this.requestedShape)) {
        break;
      }

      const card = this.drawCard(player);
      if (!card) break; // No more cards in deck

      drawnCards.push(card);
      attempts++;
    }

    // If still no playable card after drawing, skip turn
    if (!player.hasPlayableCard(topCard, this.requestedShape)) {
      this.nextTurn();
      return { drawnCards, skipped: true };
    }

    return { drawnCards, skipped: false };
  }

  getGameState() {
    return {
      players: this.players.map(p => ({
        name: p.name,
        cardCount: p.getCardCount(),
        isAI: p.isAI
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      topCard: this.getTopCard(),
      requestedShape: this.requestedShape,
      deckCount: this.deck.getRemainingCount(),
      gameOver: this.gameOver,
      winner: this.winner
    };
  }
}
