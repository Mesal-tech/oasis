import Phaser from 'phaser';
import { SHAPES, SHAPE_COLORS, GAME_CONFIG, UI_COLORS, EFFECTS } from './constants.js';

export class CardRenderer {
  static createCardTexture(scene, card, key = null) {
    const width = GAME_CONFIG.CARD_WIDTH;
    const height = GAME_CONFIG.CARD_HEIGHT;
    const textureKey = key || `card_${card.id}`;

    // Create render texture for better quality
    const rt = scene.add.renderTexture(0, 0, width + 10, height + 10);
    const graphics = scene.add.graphics();

    // Draw card shadow
    graphics.fillStyle(UI_COLORS.CARD_SHADOW, 0.4);
    graphics.fillRoundedRect(
      EFFECTS.CARD_SHADOW_OFFSET_X + 5,
      EFFECTS.CARD_SHADOW_OFFSET_Y + 5,
      width,
      height,
      12
    );
    graphics.generateTexture('temp_shadow', width + 10, height + 10);
    rt.draw('temp_shadow', 0, 0);
    graphics.clear();

    // Card background with gradient effect
    graphics.fillStyle(UI_COLORS.CARD_WHITE, 1);
    graphics.fillRoundedRect(5, 5, width, height, 12);

    // Decorative inner border
    graphics.lineStyle(2, UI_COLORS.CARD_BORDER, 0.2);
    graphics.strokeRoundedRect(10, 10, width - 10, height - 10, 8);

    // Main border
    graphics.lineStyle(3, UI_COLORS.CARD_BORDER, 1);
    graphics.strokeRoundedRect(5, 5, width, height, 12);

    rt.draw(graphics, 0, 0);
    graphics.clear();

    // Get color for this shape
    const color = SHAPE_COLORS[card.shape];

    // Draw main shape in center with gradient effect
    this.drawShapeWithGradient(graphics, card.shape, width / 2 + 5, height / 2 + 5, 35, color);
    rt.draw(graphics, 0, 0);
    graphics.clear();

    // Draw number with shadow effect
    const numberText = scene.add.text(width / 2 + 5, height / 2 + 5, card.number.toString(), {
      fontSize: '40px',
      fontFamily: 'Arial Black',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);

    rt.draw(numberText, 0, 0);
    numberText.destroy();

    // Draw corner shapes and numbers
    this.drawCornerElements(scene, rt, graphics, card, width, height, color);

    // Add subtle shine effect
    graphics.fillStyle(0xffffff, 0.1);
    graphics.fillRoundedRect(5, 5, width, height / 3, 12);
    rt.draw(graphics, 0, 0);

    // Generate final texture
    rt.saveTexture(textureKey);

    // Clean up
    graphics.destroy();
    rt.destroy();
    scene.textures.remove('temp_shadow');

    return textureKey;
  }

  static drawCornerElements(scene, rt, graphics, card, width, height, color) {
    // Top-left corner
    this.drawShape(graphics, card.shape, 20, 20, 10, color);
    rt.draw(graphics, 0, 0);
    graphics.clear();

    const topLeftNum = scene.add.text(20, 20, card.number.toString(), {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    rt.draw(topLeftNum, 0, 0);
    topLeftNum.destroy();

    // Bottom-right corner (rotated)
    graphics.save();
    graphics.translateCanvas(width - 15, height - 15);
    graphics.rotateCanvas(Math.PI);
    this.drawShape(graphics, card.shape, 0, 0, 10, color);
    graphics.restore();
    rt.draw(graphics, 0, 0);
    graphics.clear();

    const bottomRightNum = scene.add.text(width - 15, height - 15, card.number.toString(), {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5).setRotation(Math.PI);
    rt.draw(bottomRightNum, 0, 0);
    bottomRightNum.destroy();
  }

  static createCardBackTexture(scene) {
    const width = GAME_CONFIG.CARD_WIDTH;
    const height = GAME_CONFIG.CARD_HEIGHT;
    const textureKey = 'card_back';

    const rt = scene.add.renderTexture(0, 0, width + 10, height + 10);
    const graphics = scene.add.graphics();

    // Draw shadow
    graphics.fillStyle(UI_COLORS.CARD_SHADOW, 0.4);
    graphics.fillRoundedRect(
      EFFECTS.CARD_SHADOW_OFFSET_X + 5,
      EFFECTS.CARD_SHADOW_OFFSET_Y + 5,
      width,
      height,
      12
    );
    graphics.generateTexture('temp_back_shadow', width + 10, height + 10);
    rt.draw('temp_back_shadow', 0, 0);
    graphics.clear();

    // Card background (rich red/brown)
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillRoundedRect(5, 5, width, height, 12);

    // Traditional pattern background
    graphics.lineStyle(2, 0xa52a2a, 0.4);
    const patternSize = 15;
    for (let x = 0; x < width; x += patternSize) {
      for (let y = 0; y < height; y += patternSize) {
        graphics.strokeRect(x + 5, y + 5, patternSize, patternSize);
        graphics.lineBetween(x + 5, y + 5, x + patternSize + 5, y + patternSize + 5);
        graphics.lineBetween(x + patternSize + 5, y + 5, x + 5, y + patternSize + 5);
      }
    }

    rt.draw(graphics, 0, 0);
    graphics.clear();

    // Gold border
    graphics.lineStyle(4, UI_COLORS.GOLD, 1);
    graphics.strokeRoundedRect(5, 5, width, height, 12);

    // Inner decorative border
    graphics.lineStyle(2, UI_COLORS.GOLD, 0.6);
    graphics.strokeRoundedRect(12, 12, width - 14, height - 14, 8);

    rt.draw(graphics, 0, 0);

    // "NAIJA WHOT" text
    const titleText = scene.add.text(width / 2 + 5, height / 2 - 10, 'NAIJA', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const subtitleText = scene.add.text(width / 2 + 5, height / 2 + 15, 'WHOT', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    rt.draw(titleText, 0, 0);
    rt.draw(subtitleText, 0, 0);

    // Add decorative stars in corners
    const starSize = 8;
    this.drawStar(graphics, 20, 20, 5, starSize, starSize / 2);
    this.drawStar(graphics, width - 10, 20, 5, starSize, starSize / 2);
    this.drawStar(graphics, 20, height - 10, 5, starSize, starSize / 2);
    this.drawStar(graphics, width - 10, height - 10, 5, starSize, starSize / 2);
    graphics.fillStyle(UI_COLORS.GOLD, 1);
    graphics.fillPath();

    rt.draw(graphics, 0, 0);

    // Save texture
    rt.saveTexture(textureKey);

    // Clean up
    graphics.destroy();
    titleText.destroy();
    subtitleText.destroy();
    rt.destroy();
    scene.textures.remove('temp_back_shadow');

    return textureKey;
  }

  static drawShapeWithGradient(graphics, shape, x, y, size, color) {
    // Create gradient effect by drawing multiple layers
    const layers = 3;
    for (let i = layers; i > 0; i--) {
      const layerSize = size * (0.7 + (i / layers) * 0.3);
      const alpha = 0.3 + (i / layers) * 0.7;
      graphics.fillStyle(color, alpha);
      graphics.lineStyle(2, 0x000000, alpha);
      this.drawShape(graphics, shape, x, y, layerSize, color, true);
    }
  }

  static drawShape(graphics, shape, x, y, size, color, skipStroke = false) {
    if (!skipStroke) {
      graphics.fillStyle(color, 1);
      graphics.lineStyle(2, 0x000000, 1);
    }

    switch (shape) {
      case SHAPES.CIRCLE:
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
        break;

      case SHAPES.TRIANGLE:
        graphics.beginPath();
        graphics.moveTo(x, y - size);
        graphics.lineTo(x - size, y + size);
        graphics.lineTo(x + size, y + size);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        break;

      case SHAPES.CROSS:
        const crossWidth = size / 3;
        // Vertical bar
        graphics.fillRect(x - crossWidth / 2, y - size, crossWidth, size * 2);
        graphics.strokeRect(x - crossWidth / 2, y - size, crossWidth, size * 2);
        // Horizontal bar
        graphics.fillRect(x - size, y - crossWidth / 2, size * 2, crossWidth);
        graphics.strokeRect(x - size, y - crossWidth / 2, size * 2, crossWidth);
        break;

      case SHAPES.SQUARE:
        graphics.fillRect(x - size, y - size, size * 2, size * 2);
        graphics.strokeRect(x - size, y - size, size * 2, size * 2);
        break;

      case SHAPES.STAR:
        this.drawStar(graphics, x, y, 5, size, size / 2);
        break;
    }
  }

  static drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }

    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }
}
