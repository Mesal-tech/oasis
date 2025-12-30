import Phaser from 'phaser';
import { Board } from '../logic/Board';
import { PlayerColor, PieceType } from '../logic/Piece';
import { AI } from '../logic/AI';

export default class GameScene extends Phaser.Scene {
    private boardLogic!: Board;
    private tileSize = 80;
    private pieceGroup!: Phaser.GameObjects.Group;
    private boardGroup!: Phaser.GameObjects.Group;
    private highlightGroup!: Phaser.GameObjects.Group;
    private selectedPiece: { r: number, c: number } | null = null;
    private turnText!: Phaser.GameObjects.Text;
    private turnIndicator!: Phaser.GameObjects.Image;
    private ai!: AI;
    private isAnimating: boolean = false;
    private isAiTurn: boolean = false;
    private activeChainPiece: { r: number, c: number } | null = null;
    private boardOffsetX = 0;
    private boardOffsetY = 0;
    private background!: Phaser.GameObjects.Image;
    private boardBg!: Phaser.GameObjects.Image;
    private turnContainer!: Phaser.GameObjects.Container;

    constructor() {
        super('GameScene');
    }

    create() {
        this.boardLogic = new Board();
        this.ai = new AI(3, PlayerColor.BLUE);

        // 1. Background
        this.background = this.add.image(0, 0, 'bg_wood');
        
        // 2. Board
        this.boardBg = this.add.image(0, 0, 'base_game');
        this.boardBg.setDisplaySize(680, 680);

        this.updateLayout();

        // 5. UI Elements
        // Turn Indicator
        this.turnContainer = this.add.container(0, 0);

        // Use Sprite for the indicator
        this.turnIndicator = this.add.image(-25, 0, 'puck_red');
        this.turnIndicator.setDisplaySize(40, 40);

        this.turnText = this.add.text(5, 0, 'Your Turn', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0, 0.5);

        this.turnContainer.add([this.turnIndicator, this.turnText]);

        // 3. Pieces Group
        this.pieceGroup = this.add.group();
        this.boardGroup = this.add.group();
        this.highlightGroup = this.add.group();

        this.createPieces();
        this.updateLayout(); // Run again to scale UI after creation

        // 4. Input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log('Pointer down @', pointer.x, pointer.y);
            if (this.isAiTurn || this.isAnimating) return;
            this.handleInput(pointer);
        });

        // Events
        this.events.on('restart', this.restartGame, this);
        this.scale.on('resize', this.handleResize, this);
        
        this.handleResize(); // Initial positioning
    }

    handleResize() {
        this.updateLayout();
        this.createBoard(this.boardOffsetX, this.boardOffsetY);
        this.createPieces();
    }

    updateLayout() {
        const { width, height } = this.scale;

        // Background should cover the entire screen
        this.background.setPosition(width / 2, height / 2);
        
        // Scale background to cover
        const bgScale = Math.max(width / this.background.width, height / this.background.height);
        this.background.setScale(bgScale);

        // Calculate dynamic board size
        // Use 90% of the smallest screen dimension, maxing out at 640px for the board itself
        const margin = 40;
        const availableWidth = width - margin * 2;
        const availableHeight = height - margin * 4; // More margin for turn indicator and potential bottom controls
        const maxBoardSize = Math.min(640, availableWidth, availableHeight);
        
        this.tileSize = maxBoardSize / 8;
        const totalBoardSize = maxBoardSize;

        // Center the board
        this.boardOffsetX = (width - totalBoardSize) / 2;
        this.boardOffsetY = (height - totalBoardSize) / 2;

        // Scale the board background (the wood frame)
        // Original size was 680 for a 640 board (20px border on each side)
        const framePadding = (this.tileSize / 80) * 40; 
        this.boardBg.setPosition(width / 2, height / 2);
        this.boardBg.setDisplaySize(totalBoardSize + framePadding, totalBoardSize + framePadding);
        
        if (this.turnContainer) {
            const uiScale = Math.max(0.7, Math.min(1, totalBoardSize / 640));
            this.turnContainer.setScale(uiScale);
            
            // Position turn UI above the board
            const turnY = Math.max(40, this.boardOffsetY - 40 * uiScale);
            this.turnContainer.setPosition(width / 2 - 40 * uiScale, turnY);
            
            if (this.turnIndicator) {
                this.turnIndicator.setDisplaySize(40, 40);
            }
        }
    }



    createBoard(startX: number, startY: number) {
        this.boardGroup.clear(true, true);
        const tileScale = this.tileSize / 80;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isDark = (row + col) % 2 === 1;
                const texture = isDark ? 'tile_dark' : 'tile_light';
                // Coordinates
                const x = startX + col * this.tileSize + this.tileSize / 2;
                const y = startY + row * this.tileSize + this.tileSize / 2;
                const tile = this.add.image(x, y, texture);
                // Use setDisplaySize and slightly overlap or perfect fit to prevent gaps
                tile.setDisplaySize(Math.ceil(this.tileSize), Math.ceil(this.tileSize));
                this.boardGroup.add(tile);
            }
        }
    }

    createPieces() {
        const startX = this.boardOffsetX;
        const startY = this.boardOffsetY;
        this.pieceGroup.clear(true, true);

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.boardLogic.getPiece(row, col);
                if (piece) {
                    // Coordinates
                    const x = startX + col * this.tileSize + this.tileSize / 2;
                    const y = startY + row * this.tileSize + this.tileSize / 2;

                    // Use Sprite/Container instead of DOM
                    const texture = piece.color === PlayerColor.RED ? 'puck_red' : 'puck_blue';
                    const container = this.add.container(x, y);
                    
                    const puck = this.add.image(0, 0, texture);
                    puck.setDisplaySize(this.tileSize * 0.85, this.tileSize * 0.85);
                    container.add(puck);

                    if (piece.type === PieceType.KING) {
                        const crown = this.add.image(0, 0, 'king_overlay');
                        crown.setDisplaySize(this.tileSize * 0.7, this.tileSize * 0.7);
                        container.add(crown);
                    }
                    
                    container.setData('r', row);
                    container.setData('c', col);

                    this.pieceGroup.add(container);
                }
            }
        }
        this.updateTurnUI();
    }



    getVisualPiece(row: number, col: number): Phaser.GameObjects.Image | Phaser.GameObjects.Container | null {
        const children = this.pieceGroup.getChildren();
        for (const child of children) {
            const obj = child as Phaser.GameObjects.GameObject;
            if (obj.getData('r') === row && obj.getData('c') === col) {
                return obj as any;
            }
        }
        return null;
    }

    animateBounce(piece: Phaser.GameObjects.Image | Phaser.GameObjects.Container) {
        this.tweens.add({
            targets: piece,
            scaleX: piece.scaleX * 1.1,
            scaleY: piece.scaleY * 0.9,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    handleInput(pointer: Phaser.Input.Pointer) {
        const startX = this.boardOffsetX;
        const startY = this.boardOffsetY;
        const localX = pointer.x - startX;
        const localY = pointer.y - startY;

        const col = Math.floor(localX / this.tileSize);
        const row = Math.floor(localY / this.tileSize);

        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            this.handleSquareClick(row, col);
        }
    }

    handleSquareClick(row: number, col: number) {
        const clickedPiece = this.boardLogic.getPiece(row, col);

        // Chain Guard: If chaining, only allow interaction with the active piece
        if (this.activeChainPiece) {
            // Use logic to reject if clicking a DIFFERENT piece
            if (clickedPiece && (row !== this.activeChainPiece.r || col !== this.activeChainPiece.c)) {
                return;
            }
            // If clicking empty square, we let it proceed to 'Move' logic
            // But 'Move' logic uses this.selectedPiece, which we set in executeMove.
        }

        const isCurrentPlayerPiece = clickedPiece && clickedPiece.color === this.boardLogic.currentPlayer;
        const startX = this.boardOffsetX;
        const startY = this.boardOffsetY;

        // Selection
        if (isCurrentPlayerPiece) {
            this.selectedPiece = { r: row, c: col };
            // ...
            this.highlightSquares(row, col, startX, startY);
            this.showValidMoves(row, col, startX, startY);

            const visualPiece = this.getVisualPiece(row, col);
            if (visualPiece) {
                this.animateBounce(visualPiece);
            }
        }
        // Move
        else if (this.selectedPiece && !clickedPiece) {
            // Attempt move
            if (this.boardLogic.isValidMove({ row: this.selectedPiece.r, col: this.selectedPiece.c }, { row, col })) {
                this.executeMove({ row: this.selectedPiece.r, col: this.selectedPiece.c }, { row, col });
            }
        }
    }

    executeMove(start: { row: number, col: number }, end: { row: number, col: number }) {
        this.isAnimating = true;
        this.highlightGroup.clear(true, true);
        this.selectedPiece = null;

        // Find the visual piece to animate
        let visualPiece: Phaser.GameObjects.Container | null = null;

        // Iterate through group children using getChildren()
        const children = this.pieceGroup.getChildren();
        for (const child of children) {
            const container = child as Phaser.GameObjects.Container;
            if (container.getData('r') === start.row && container.getData('c') === start.col) {
                visualPiece = container;
                break;
            }
        }

        const onMoveComplete = () => {
            const { captured, promoted } = this.boardLogic.movePiece(start, end);
            this.createPieces(); // Full redraw to finalize state (kings, captures)

            // Multi-jump Logic
            let canChain = false;
            if (captured && !promoted) {
                const validMoves = this.boardLogic.getValidMoves(end);
                // Check if any move is a capture (distance 2)
                canChain = validMoves.some(m => Math.abs(m.row - end.row) === 2);
            }

            if (canChain) {
                this.activeChainPiece = { r: end.row, c: end.col };
                this.selectedPiece = this.activeChainPiece;
                const startX = this.boardOffsetX;
                const startY = this.boardOffsetY;
                // Auto-select and highlight
                this.highlightSquares(end.row, end.col, startX, startY);
                this.showValidMoves(end.row, end.col, startX, startY);
                // Turn continues for current player
            } else {
                this.activeChainPiece = null;
                this.boardLogic.switchTurn();
                this.updateTurnUI();

                // Check if it's now AI's turn
                if (this.boardLogic.currentPlayer === PlayerColor.BLUE) {
                    this.triggerAiTurn();
                }
            }

            this.isAnimating = false;
        };

        if (visualPiece) {
            // Bring to top so it slides OVER other pieces (captures)
            visualPiece.setDepth(100);

            // Check for capture (jump)
            if (Math.abs(start.row - end.row) === 2) {
                const midRow = (start.row + end.row) / 2;
                const midCol = (start.col + end.col) / 2;
                const capturedVisual = this.getVisualPiece(midRow, midCol);

                if (capturedVisual) {
                    this.tweens.add({
                        targets: capturedVisual,
                        alpha: 0,
                        scaleX: 0.5,
                        scaleY: 0.5,
                        duration: 300,
                        ease: 'Power2'
                    });
                }

                // Jump effect for the capturing piece
                this.tweens.add({
                    targets: visualPiece,
                    scaleX: 1.6,
                    scaleY: 1.6,
                    duration: 150,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }

            const targetX = this.boardOffsetX + end.col * this.tileSize + this.tileSize / 2;
            const targetY = this.boardOffsetY + end.row * this.tileSize + this.tileSize / 2;

            this.tweens.add({
                targets: visualPiece,
                x: targetX,
                y: targetY,
                duration: 300,
                ease: 'Power2',
                onComplete: onMoveComplete
            });
        } else {
            // Fallback if visual lookup failed
            onMoveComplete();
        }
    }

    triggerAiTurn() {
        this.isAiTurn = true;
        this.updateTurnUI();
        // Small delay for realism
        this.time.delayedCall(500, () => {
            const move = this.ai.getBestMove(this.boardLogic.clone());
            if (move) {
                this.executeMove(move.start, move.end);
            }
            this.isAiTurn = false;
            this.updateTurnUI();
        });
    }

    updateTurnUI() {
        if (!this.turnIndicator) return;
        
        if (this.boardLogic.currentPlayer === PlayerColor.RED) {
            this.turnIndicator.setTexture('puck_red');
            this.turnText.setText('Your Turn');
        } else {
            this.turnIndicator.setTexture('puck_blue');
            this.turnText.setText("'s Turn");
        }
    }

    highlightSquares(row: number, col: number, startX: number, startY: number) {
        this.highlightGroup.clear(true, true);
        const x = startX + col * this.tileSize + this.tileSize / 2;
        const y = startY + row * this.tileSize + this.tileSize / 2;
        const h = this.highlightGroup.create(x, y, 'highlight');
        h.setDisplaySize(this.tileSize, this.tileSize);
    }

    showValidMoves(row: number, col: number, startX: number, startY: number) {
        const moves = this.boardLogic.getValidMoves({ row, col });
        moves.forEach(m => {
            const x = startX + m.col * this.tileSize + this.tileSize / 2;
            const y = startY + m.row * this.tileSize + this.tileSize / 2;
            const h = this.highlightGroup.create(x, y, 'valid_move');
            h.setDisplaySize(this.tileSize, this.tileSize);
        });
    }

    restartGame() {
        this.boardLogic.reset();
        this.createPieces();
        this.highlightGroup.clear(true, true);
        this.selectedPiece = null;
        this.isAnimating = false;
        this.isAiTurn = false;
    }
}
