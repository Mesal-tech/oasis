import Phaser from 'phaser';
import { GameLogic } from '../GameLogic.js';
import { CardRenderer } from '../CardRenderer.js';
import { GAME_CONFIG, SHAPES, SHAPE_COLORS, UI_COLORS, ANIMATIONS, EFFECTS } from '../constants.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.gameLogic = null;
    this.playerCardSprites = [];
    this.aiCardSprites = [];
    this.topCardSprite = null;
    this.selectedCard = null;
    this.isProcessingTurn = false;
    this.shapeSelectionModal = null;
  }

  init(data) {
    this.playerName = data.playerName || 'You';
    this.difficulty = data.difficulty || 'medium';
  }

  create() {
    const { width, height } = this.cameras.main;

    // Enhanced background with gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(UI_COLORS.TABLE_GREEN, UI_COLORS.TABLE_GREEN, 0x083d1e, 0x083d1e, 1);
    bg.fillRect(0, 0, width, height);

    // Add decorative felt pattern
    const pattern = this.add.graphics();
    pattern.lineStyle(1, UI_COLORS.TABLE_PATTERN, 0.2);
    const patternSize = 40;
    for (let i = 0; i < width; i += patternSize) {
      for (let j = 0; j < height; j += patternSize) {
        pattern.strokeRect(i, j, patternSize, patternSize);
        pattern.lineBetween(i, j, i + patternSize, j + patternSize);
      }
    }

    // Add table border
    const border = this.add.graphics();
    border.lineStyle(8, 0x654321, 1);
    border.strokeRect(10, 10, width - 20, height - 20);
    border.lineStyle(3, UI_COLORS.GOLD, 0.5);
    border.strokeRect(15, 15, width - 30, height - 30);

    // Initialize game logic
    this.gameLogic = new GameLogic(this.playerName, this.difficulty);

    // Create card textures
    this.createCardTextures();

    // UI Elements
    this.createUI();

    // Initial render
    this.renderGame();

    // Start AI turn if AI goes first
    if (this.gameLogic.getCurrentPlayer().isAI) {
      this.time.delayedCall(1000, () => this.processAITurn());
    }
  }

  createCardTextures() {
    // Create card back texture
    CardRenderer.createCardBackTexture(this);

    // Create textures for all cards in players' hands
    this.gameLogic.players.forEach(player => {
      player.hand.forEach(card => {
        if (!this.textures.exists(`card_${card.id}`)) {
          CardRenderer.createCardTexture(this, card);
        }
      });
    });

    // Create texture for top card
    const topCard = this.gameLogic.getTopCard();
    if (topCard && !this.textures.exists(`card_${topCard.id}`)) {
      CardRenderer.createCardTexture(this, topCard);
    }
  }

  createUI() {
    const { width, height } = this.cameras.main;

    // Title with shadow
    this.add.text(width / 2 + 3, 33, 'NAIJA WHOT', {
      fontSize: '52px',
      fontFamily: 'Arial Black',
      color: '#000000',
      alpha: 0.3
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, 30, 'NAIJA WHOT', {
      fontSize: '52px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#8b4513',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Animate title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Deck pile (left side)
    this.deckPile = this.add.image(width / 2 - 150, height / 2, 'card_back')
      .setScale(0.8);

    this.deckCountText = this.add.text(width / 2 - 150, height / 2 + 80, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Discard pile (right side)
    this.discardPile = this.add.container(width / 2 + 150, height / 2);

    // Current player indicator with enhanced styling
    this.turnIndicator = this.add.text(width / 2, 95, '', {
      fontSize: '26px',
      fontFamily: 'Arial Black',
      color: UI_COLORS.HIGHLIGHT,
      stroke: '#000000',
      strokeThickness: 5,
      backgroundColor: '#000000',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setAlpha(0.9);

    // Requested shape indicator with better styling
    this.requestedShapeText = this.add.text(width / 2, height / 2 - 130, '', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#8b0000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // AI player displays (top)
    this.aiDisplays = [];
    const aiSpacing = width / 4;
    for (let i = 0; i < 3; i++) {
      const x = aiSpacing * (i + 0.5);
      const container = this.add.container(x, 130);

      // Background with gradient effect
      const bg = this.add.rectangle(0, 0, 220, 110, 0x2a2a3e, 0.9).setOrigin(0.5);
      bg.setStrokeStyle(3, UI_COLORS.GOLD, 0.7);

      // Player name with icon
      const nameText = this.add.text(0, -35, `🤖 AI ${i + 1}`, {
        fontSize: '20px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Card count badge
      const cardCountBg = this.add.rectangle(0, 10, 100, 35, UI_COLORS.INFO, 1).setOrigin(0.5);
      cardCountBg.setStrokeStyle(2, 0x000000);

      const cardCountText = this.add.text(0, 10, '4 cards', {
        fontSize: '18px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      // Turn indicator (hidden by default)
      const turnIndicator = this.add.text(0, -55, '▼ PLAYING ▼', {
        fontSize: '14px',
        fontFamily: 'Arial Black',
        color: UI_COLORS.HIGHLIGHT,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setVisible(false);

      container.add([bg, nameText, cardCountBg, cardCountText, turnIndicator]);
      container.setData('cardCountText', cardCountText);
      container.setData('bg', bg);
      container.setData('turnIndicator', turnIndicator);
      container.setData('playerIndex', i + 1);

      this.aiDisplays.push(container);
    }

    // Player hand area
    this.playerHandContainer = this.add.container(width / 2, height - 120);

    // Draw button with enhanced styling
    const drawButtonBg = this.add.rectangle(width / 2, height - 250, 180, 50, UI_COLORS.ERROR, 1)
      .setStrokeStyle(4, 0x8b0000)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on('pointerdown', () => this.onDrawCard())
      .on('pointerover', function () {
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
          ease: 'Back.easeOut'
        });
        this.setFillStyle(0xff6666, 1);
      })
      .on('pointerout', function () {
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Back.easeIn'
        });
        this.setFillStyle(UI_COLORS.ERROR, 1);
      });

    this.drawButton = this.add.text(width / 2, height - 250, '🎴 DRAW CARD', {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    drawButtonBg.setData('textObj', this.drawButton);

    // Message text
    this.messageText = this.add.text(width / 2, height / 2 + 120, '', {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5);
  }

  renderGame() {
    this.updateDeckCount();
    this.updateTopCard();
    this.updatePlayerHand();
    this.updateAIDisplays();
    this.updateTurnIndicator();
    this.updateRequestedShape();
  }

  updateDeckCount() {
    const count = this.gameLogic.deck.getRemainingCount();
    this.deckCountText.setText(`${count} cards`);
  }

  updateTopCard() {
    const topCard = this.gameLogic.getTopCard();
    if (!topCard) return;

    // Create texture if it doesn't exist
    if (!this.textures.exists(`card_${topCard.id}`)) {
      CardRenderer.createCardTexture(this, topCard);
    }

    // Remove old sprite
    if (this.topCardSprite) {
      this.topCardSprite.destroy();
    }

    // Create new sprite
    this.topCardSprite = this.add.image(0, 0, `card_${topCard.id}`);
    this.discardPile.add(this.topCardSprite);
  }

  updatePlayerHand() {
    // Clear existing sprites
    this.playerCardSprites.forEach(sprite => sprite.destroy());
    this.playerCardSprites = [];

    const player = this.gameLogic.players[0]; // Human player
    const cards = player.hand;
    const cardWidth = GAME_CONFIG.CARD_WIDTH;
    const spacing = GAME_CONFIG.CARD_SPACING;
    const totalWidth = (cardWidth + spacing) * cards.length - spacing;
    const startX = -totalWidth / 2;

    cards.forEach((card, index) => {
      // Create texture if it doesn't exist
      if (!this.textures.exists(`card_${card.id}`)) {
        CardRenderer.createCardTexture(this, card);
      }

      const x = startX + (cardWidth + spacing) * index + cardWidth / 2;

      // Calculate fan rotation (cards spread in an arc)
      const centerIndex = (cards.length - 1) / 2;
      const offsetFromCenter = index - centerIndex;
      const rotation = offsetFromCenter * EFFECTS.CARD_FAN_ROTATION;
      const yOffset = Math.abs(offsetFromCenter) * 5; // Slight arc

      const sprite = this.add.image(x, yOffset, `card_${card.id}`)
        .setInteractive({ useHandCursor: true })
        .setData('card', card)
        .setData('originalY', yOffset)
        .setData('originalRotation', rotation)
        .setData('originalX', x)
        .setRotation(rotation)
        .setDepth(index);

      // Enhanced hover effects
      sprite.on('pointerover', function () {
        if (!this.scene.isProcessingTurn) {
          this.scene.tweens.add({
            targets: this,
            y: this.getData('originalY') - EFFECTS.CARD_HOVER_LIFT,
            scaleX: EFFECTS.CARD_HOVER_SCALE,
            scaleY: EFFECTS.CARD_HOVER_SCALE,
            rotation: 0,
            duration: ANIMATIONS.CARD_HOVER_DURATION,
            ease: 'Back.easeOut'
          });
          this.setDepth(100); // Bring to front

          // Check if card is playable and add glow
          const topCard = this.scene.gameLogic.getTopCard();
          const canPlay = this.getData('card').canPlayOn(topCard, this.scene.gameLogic.requestedShape);
          if (canPlay) {
            this.setTint(0x88ff88);
          }
        }
      });

      sprite.on('pointerout', function () {
        this.scene.tweens.add({
          targets: this,
          y: this.getData('originalY'),
          scaleX: 1,
          scaleY: 1,
          rotation: this.getData('originalRotation'),
          duration: ANIMATIONS.CARD_HOVER_DURATION,
          ease: 'Back.easeIn'
        });
        this.setDepth(this.getData('originalDepth') || index);
        this.clearTint();
      });

      // Click to play
      sprite.on('pointerdown', () => this.onCardClick(card, sprite));

      sprite.setData('originalDepth', index);
      this.playerHandContainer.add(sprite);
      this.playerCardSprites.push(sprite);
    });
  }

  updateAIDisplays() {
    this.aiDisplays.forEach((display, index) => {
      const player = this.gameLogic.players[index + 1];
      const cardCountText = display.getData('cardCountText');
      const bg = display.getData('bg');
      const turnIndicator = display.getData('turnIndicator');
      const count = player.getCardCount();
      cardCountText.setText(`${count} card${count !== 1 ? 's' : ''}`);

      // Highlight current player with animation
      if (this.gameLogic.currentPlayerIndex === index + 1) {
        bg.setFillStyle(UI_COLORS.HIGHLIGHT, 0.3);
        bg.setStrokeStyle(4, UI_COLORS.HIGHLIGHT, 1);
        turnIndicator.setVisible(true);

        // Pulse animation for turn indicator
        if (!turnIndicator.getData('animating')) {
          turnIndicator.setData('animating', true);
          this.tweens.add({
            targets: turnIndicator,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
          });
        }
      } else {
        bg.setFillStyle(0x2a2a3e, 0.9);
        bg.setStrokeStyle(3, UI_COLORS.GOLD, 0.7);
        turnIndicator.setVisible(false);

        // Stop animation
        if (turnIndicator.getData('animating')) {
          this.tweens.killTweensOf(turnIndicator);
          turnIndicator.setAlpha(1);
          turnIndicator.setData('animating', false);
        }
      }
    });
  }

  updateTurnIndicator() {
    const currentPlayer = this.gameLogic.getCurrentPlayer();
    this.turnIndicator.setText(`${currentPlayer.name}'s Turn`);

    // Update draw button visibility
    if (currentPlayer.isAI) {
      this.drawButton.setVisible(false);
    } else {
      this.drawButton.setVisible(true);
    }
  }

  updateRequestedShape() {
    if (this.gameLogic.requestedShape) {
      const shapeName = this.gameLogic.requestedShape.toUpperCase();
      this.requestedShapeText.setText(`Required Shape: ${shapeName}`);
      this.requestedShapeText.setVisible(true);
    } else {
      this.requestedShapeText.setVisible(false);
    }
  }

  onCardClick(card, sprite) {
    if (this.isProcessingTurn) return;
    if (this.gameLogic.getCurrentPlayer().isAI) return;

    const topCard = this.gameLogic.getTopCard();
    const canPlay = card.canPlayOn(topCard, this.gameLogic.requestedShape);

    if (!canPlay) {
      this.showMessage('Cannot play this card!', 1500, 0xff4444);
      this.tweens.add({
        targets: sprite,
        x: sprite.x - 10,
        yoyo: true,
        repeat: 3,
        duration: 50
      });
      return;
    }

    // If it's a Whot card, show shape selection
    if (card.isWhot()) {
      this.showShapeSelection(card);
    } else {
      this.playCard(card);
    }
  }

  showShapeSelection(card) {
    const { width, height } = this.cameras.main;

    // Create modal background with blur effect
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
      .setInteractive()
      .setDepth(1000);

    // Fade in background
    bg.setAlpha(0);
    this.tweens.add({
      targets: bg,
      alpha: 0.85,
      duration: 200
    });

    // Modal container
    const modalWidth = 550;
    const modalHeight = 450;

    const modalBg = this.add.rectangle(width / 2, height / 2, modalWidth, modalHeight, 0x1a1a2e)
      .setStrokeStyle(6, UI_COLORS.GOLD)
      .setDepth(1001);

    // Inner decorative border
    const innerBorder = this.add.rectangle(width / 2, height / 2, modalWidth - 20, modalHeight - 20, 0x000000, 0)
      .setStrokeStyle(2, UI_COLORS.GOLD, 0.5)
      .setDepth(1001);

    // Title with shadow
    this.add.text(width / 2 + 2, height / 2 - 148, 'Choose a Shape', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#000000',
      alpha: 0.5
    }).setOrigin(0.5).setDepth(1002);

    const title = this.add.text(width / 2, height / 2 - 150, 'Choose a Shape', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: UI_COLORS.GOLD,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(1002);

    const shapes = [SHAPES.CIRCLE, SHAPES.TRIANGLE, SHAPES.CROSS, SHAPES.SQUARE, SHAPES.STAR];
    const shapeButtons = [];
    const shapeGraphics = [];

    shapes.forEach((shape, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = width / 2 - 180 + col * 180;
      const y = height / 2 - 40 + row * 120;

      // Button background
      const btn = this.add.rectangle(x, y, 140, 100, SHAPE_COLORS[shape], 0.3)
        .setStrokeStyle(4, SHAPE_COLORS[shape])
        .setInteractive({ useHandCursor: true })
        .setDepth(1002);

      // Shape graphic
      const graphics = this.add.graphics().setDepth(1003);
      CardRenderer.drawShapeWithGradient(graphics, shape, x, y, 30, SHAPE_COLORS[shape]);

      // Shape name
      const shapeName = this.add.text(x, y + 55, shape.toUpperCase(), {
        fontSize: '14px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(1003);

      // Hover animation
      btn.on('pointerover', function () {
        this.scene.tweens.add({
          targets: [this, graphics, shapeName],
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
          ease: 'Back.easeOut'
        });
        this.setFillStyle(SHAPE_COLORS[shape], 0.6);
      });

      btn.on('pointerout', function () {
        this.scene.tweens.add({
          targets: [this, graphics, shapeName],
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Back.easeIn'
        });
        this.setFillStyle(SHAPE_COLORS[shape], 0.3);
      });

      btn.on('pointerdown', () => {
        // Fade out animation
        this.tweens.add({
          targets: [bg, modalBg, innerBorder, title, ...shapeButtons, ...shapeGraphics],
          alpha: 0,
          duration: 200,
          onComplete: () => {
            // Clean up modal
            bg.destroy();
            modalBg.destroy();
            innerBorder.destroy();
            title.destroy();
            shapeButtons.forEach(b => b.destroy());
            shapeGraphics.forEach(g => g.destroy());
          }
        });

        // Play card with chosen shape
        this.playCard(card, shape);
      });

      shapeButtons.push(btn);
      shapeButtons.push(shapeName);
      shapeGraphics.push(graphics);
    });

    // Scale in animation for modal
    modalBg.setScale(0);
    innerBorder.setScale(0);
    title.setScale(0);

    this.tweens.add({
      targets: [modalBg, innerBorder, title],
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    shapeButtons.forEach((btn, i) => {
      btn.setScale(0);
      this.tweens.add({
        targets: btn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        delay: 100 + i * 30,
        ease: 'Back.easeOut'
      });
    });

    shapeGraphics.forEach((g, i) => {
      g.setScale(0);
      this.tweens.add({
        targets: g,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        delay: 100 + i * 30,
        ease: 'Back.easeOut'
      });
    });

    this.shapeSelectionModal = { bg, modalBg, innerBorder, title, shapeButtons, shapeGraphics };
  }

  playCard(card, chosenShape = null) {
    this.isProcessingTurn = true;
    const player = this.gameLogic.players[0];

    const result = this.gameLogic.playCard(player, card, chosenShape);

    if (result.success) {
      // Show effect message
      if (result.effect && result.effect.message) {
        this.showMessage(result.effect.message, 2000);
      }

      // Re-render game
      this.renderGame();

      // Check for game over
      if (result.gameOver) {
        this.time.delayedCall(1500, () => {
          this.scene.start('GameOverScene', {
            winner: result.winner,
            playerScore: this.calculateScore(player)
          });
        });
        return;
      }

      // Continue to next turn
      this.time.delayedCall(1500, () => {
        this.isProcessingTurn = false;
        if (this.gameLogic.getCurrentPlayer().isAI) {
          this.processAITurn();
        }
      });
    } else {
      this.isProcessingTurn = false;
      this.showMessage(result.message, 1500, 0xff4444);
    }
  }

  onDrawCard() {
    if (this.isProcessingTurn) return;
    if (this.gameLogic.getCurrentPlayer().isAI) return;

    this.isProcessingTurn = true;
    const player = this.gameLogic.players[0];

    const result = this.gameLogic.drawUntilPlayable(player);

    this.showMessage(`Drew ${result.drawnCards.length} card(s)`, 1500);

    this.time.delayedCall(1000, () => {
      this.renderGame();

      if (result.skipped) {
        this.showMessage('No playable cards. Turn skipped.', 1500);
        this.time.delayedCall(1500, () => {
          this.isProcessingTurn = false;
          if (this.gameLogic.getCurrentPlayer().isAI) {
            this.processAITurn();
          }
        });
      } else {
        this.isProcessingTurn = false;
      }
    });
  }

  processAITurn() {
    if (this.isProcessingTurn) return;

    this.isProcessingTurn = true;
    const aiPlayer = this.gameLogic.getCurrentPlayer();

    if (!aiPlayer.isAI) {
      this.isProcessingTurn = false;
      return;
    }

    this.updateTurnIndicator();

    this.time.delayedCall(1000, () => {
      const topCard = this.gameLogic.getTopCard();
      const cardToPlay = aiPlayer.chooseCardToPlay(topCard, this.gameLogic.requestedShape);

      if (cardToPlay) {
        let chosenShape = null;
        if (cardToPlay.isWhot()) {
          chosenShape = aiPlayer.chooseShapeForWhot();
        }

        const result = this.gameLogic.playCard(aiPlayer, cardToPlay, chosenShape);

        if (result.success) {
          if (result.effect && result.effect.message) {
            this.showMessage(result.effect.message, 2000);
          }

          this.renderGame();

          if (result.gameOver) {
            this.time.delayedCall(1500, () => {
              this.scene.start('GameOverScene', {
                winner: result.winner,
                playerScore: this.calculateScore(this.gameLogic.players[0])
              });
            });
            return;
          }

          this.time.delayedCall(1500, () => {
            this.isProcessingTurn = false;
            if (this.gameLogic.getCurrentPlayer().isAI) {
              this.processAITurn();
            }
          });
        }
      } else {
        // AI has no playable card, must draw
        const result = this.gameLogic.drawUntilPlayable(aiPlayer);
        this.showMessage(`${aiPlayer.name} drew ${result.drawnCards.length} card(s)`, 1500);

        this.time.delayedCall(1500, () => {
          this.renderGame();
          this.isProcessingTurn = false;
          if (this.gameLogic.getCurrentPlayer().isAI) {
            this.processAITurn();
          }
        });
      }
    });
  }

  showMessage(text, duration = 2000, color = 0xffff00) {
    this.messageText.setText(text);
    this.messageText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.messageText.setAlpha(1);

    this.tweens.add({
      targets: this.messageText,
      alpha: 0,
      duration: duration,
      delay: duration - 500
    });
  }

  calculateScore(player) {
    // Score based on remaining cards (fewer is better)
    const cardsLeft = player.getCardCount();
    return Math.max(0, 100 - cardsLeft * 10);
  }
}
