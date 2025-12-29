import Phaser from 'phaser';
import { Board } from '../logic/Board';
import { PlayerColor, PieceType } from '../logic/Piece';
import { AI } from '../logic/AI';

export default class GameScene extends Phaser.Scene {
    private boardLogic!: Board;
    private tileSize = 80;
    private pieceGroup!: Phaser.GameObjects.Group;
    private highlightGroup!: Phaser.GameObjects.Group;
    private selectedPiece: { r: number, c: number } | null = null;
    private turnText!: Phaser.GameObjects.Text;
    private turnIndicator!: Phaser.GameObjects.DOMElement;
    private ai!: AI;
    private isAnimating: boolean = false;
    private isAiTurn: boolean = false;
    private activeChainPiece: { r: number, c: number } | null = null;
    private boardOffsetX = 80;
    private boardOffsetY = 80;

    constructor() {
        super('GameScene');
    }

    create() {
        this.boardLogic = new Board();
        this.ai = new AI(3, PlayerColor.BLUE);

        // 1. Background
        const bg = this.add.image(400, 400, 'bg_wood');
        bg.setDisplaySize(800, 800); // Stretch to fit

        // 2. Board
        // Draw a border background for the board using the base_game image
        const boardBg = this.add.image(400, 400, 'base_game');
        boardBg.setDisplaySize(680, 680);

        this.createBoard(this.boardOffsetX, this.boardOffsetY);

        // 5. UI Elements
        // Turn Indicator
        const turnBg = this.add.container(360, 40);

        // Use DOM element for the icon
        this.turnIndicator = this.add.dom(-25, 0, 'div');
        this.turnIndicator.setClassName('puck puck-red puck-icon');

        this.turnText = this.add.text(5, 0, 'Your Turn', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0, 0.5);

        turnBg.add([this.turnIndicator, this.turnText]);

        // 3. Pieces Group
        this.pieceGroup = this.add.group();
        this.highlightGroup = this.add.group();

        this.createPieces();

        // 4. Input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log('Pointer down @', pointer.x, pointer.y);
            if (this.isAiTurn || this.isAnimating) return;
            this.handleInput(pointer);
        });

        // Events
        this.events.on('restart', this.restartGame, this);
    }



    createBoard(startX: number, startY: number) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isDark = (row + col) % 2 === 1;
                const texture = isDark ? 'tile_dark' : 'tile_light';
                // Coordinates
                const x = startX + col * this.tileSize + this.tileSize / 2;
                const y = startY + row * this.tileSize + this.tileSize / 2;
                this.add.image(x, y, texture);
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

                    // Use DOM Element for CSS Pucks
                    const className = piece.color === PlayerColor.RED ? 'puck puck-red' : 'puck puck-blue';

                    const puck = this.add.dom(x, y, 'div');
                    puck.setClassName(className);

                    if (piece.type === PieceType.KING) {
                        puck.setClassName(`${className} king`);
                    }

                    // Store logical position for animation lookup
                    puck.setData('r', row);
                    puck.setData('c', col);

                    this.pieceGroup.add(puck);
                }
            }
        }
        this.updateTurnUI();
    }



    getVisualPiece(row: number, col: number): Phaser.GameObjects.DOMElement | null {
        const children = this.pieceGroup.getChildren();
        for (const child of children) {
            const dom = child as Phaser.GameObjects.DOMElement;
            if (dom.getData('r') === row && dom.getData('c') === col) {
                return dom;
            }
        }
        return null;
    }

    animateBounce(piece: Phaser.GameObjects.DOMElement) {
        this.tweens.add({
            targets: piece,
            scaleX: 1.1,
            scaleY: 0.9,
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
        let visualPiece: Phaser.GameObjects.DOMElement | null = null;

        // Iterate through group children using getChildren()
        const children = this.pieceGroup.getChildren();
        for (const child of children) {
            const dom = child as Phaser.GameObjects.DOMElement;
            if (dom.getData('r') === start.row && dom.getData('c') === start.col) {
                visualPiece = dom;
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
        if (this.boardLogic.currentPlayer === PlayerColor.RED) {
            this.turnIndicator.setClassName('puck puck-red puck-icon');
            this.turnText.setText('Your Turn');
        } else {
            this.turnIndicator.setClassName('puck puck-blue puck-icon');
            this.turnText.setText("'s Turn");
        }
    }

    highlightSquares(row: number, col: number, startX: number, startY: number) {
        this.highlightGroup.clear(true, true);
        const x = startX + col * this.tileSize + this.tileSize / 2;
        const y = startY + row * this.tileSize + this.tileSize / 2;
        this.highlightGroup.create(x, y, 'highlight');
    }

    showValidMoves(row: number, col: number, startX: number, startY: number) {
        const moves = this.boardLogic.getValidMoves({ row, col });
        moves.forEach(m => {
            const x = startX + m.col * this.tileSize + this.tileSize / 2;
            const y = startY + m.row * this.tileSize + this.tileSize / 2;
            this.highlightGroup.create(x, y, 'valid_move');
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
