import { WhotDeck } from './Deck';
import { WhotPlayer } from './Player';
import { WhotCard, type WhotShape } from './Card';

export class WhotGameLogic {
  public deck: WhotDeck;
  public players: WhotPlayer[] = [];
  public currentPlayerIndex: number = 0;
  public requestedShape: WhotShape | null = null;
  public gameOver: boolean = false;
  public winner: WhotPlayer | null = null;
  private turnDirection: number = 1;
  private nextTurnAction: 'normal' | 'skip' | 'repeat' = 'normal';

  constructor(playerNames: string[], autoDeal: boolean = true) {
    this.deck = new WhotDeck();
    this.players = playerNames.map((name, i) => new WhotPlayer(name, i > 0)); 
    if (autoDeal) {
      this.dealInitialCards();
    }
  }

  public dealInitialCards() {
    // Deal 5 cards to each player
    this.players.forEach(player => {
      for (let i = 0; i < 5; i++) {
        const card = this.deck.draw();
        if (card) player.addCard(card);
      }
    });

    this.flipFirstCard();
  }

  public flipFirstCard() {
    // Initial discard
    let firstCard = this.deck.draw();
    // Cannot start with a special card
    while (firstCard && firstCard.isSpecial()) {
      this.deck.discard(firstCard); 
      firstCard = this.deck.draw();
    }
    if (firstCard) {
      this.deck.discard(firstCard);
    }
  }

  public getCurrentPlayer(): WhotPlayer {
    return this.players[this.currentPlayerIndex];
  }

  public playCard(card: WhotCard, chosenShape: WhotShape | null = null): boolean {
    const player = this.getCurrentPlayer();
    const topCard = this.deck.getTopCard();

    if (!topCard || !card.canPlayOn(topCard, this.requestedShape)) {
        return false;
    }

    player.removeCard(card);
    this.deck.discard(card);
    this.requestedShape = null;

    // Handle effects
    this.handleCardEffect(card, chosenShape);

    if (player.hasWon()) {
      this.gameOver = true;
      this.winner = player;
    } else {
      this.advanceTurn();
    }

    return true;
  }

  private handleCardEffect(card: WhotCard, chosenShape: WhotShape | null) {
    this.nextTurnAction = 'normal';

    if (card.isWhot()) {
      this.requestedShape = chosenShape;
    } else {
      switch (card.number) {
        case 1: // Hold on
          this.nextTurnAction = 'repeat';
          break;
        case 2: // Pick Two
          this.drawForNextPlayer(2);
          this.nextTurnAction = 'skip';
          break;
        case 5: // Pick Three
          this.drawForNextPlayer(3);
          this.nextTurnAction = 'skip';
          break;
        case 8: // Suspension
          this.nextTurnAction = 'skip';
          break;
        case 14: // General Market
          this.players.forEach(p => {
            if (p !== this.getCurrentPlayer()) {
              p.cardsToDraw += 1;
            }
          });
          break;
      }
    }
  }

  private drawForNextPlayer(count: number) {
    const nextIndex = (this.currentPlayerIndex + this.turnDirection + this.players.length) % this.players.length;
    const nextPlayer = this.players[nextIndex];
    nextPlayer.cardsToDraw += count;
  }

  public drawCard(skipAdvance: boolean = false): WhotCard | null {
    const player = this.getCurrentPlayer();
    const card = this.deck.draw();
    if (card) {
      player.addCard(card);
      if (!skipAdvance) {
        this.advanceTurn();
      }
      return card;
    }
    return null;
  }

  private advanceTurn() {
    if (this.nextTurnAction === 'repeat') {
        // Current player goes again, index doesn't change
        this.nextTurnAction = 'normal';
        return;
    }

    let steps = this.nextTurnAction === 'skip' ? 2 : 1;
    this.currentPlayerIndex = (this.currentPlayerIndex + (steps * this.turnDirection) + this.players.length) % this.players.length;
    this.nextTurnAction = 'normal';
  }
}
