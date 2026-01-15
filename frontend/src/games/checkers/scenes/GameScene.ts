/// <reference types="vite/client" />
import Phaser from 'phaser';
import { Board } from '../logic/Board';
import { PlayerColor, PieceType } from '../logic/Piece';
import { AI } from '../logic/AI';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    private socket: Socket | null = null;
    private isMultiplayer: boolean = false;
    private myColor: PlayerColor = PlayerColor.RED; // Assigned by server
    private isFlipped: boolean = false;
    private pendingState: any = null;
    private boardSnapshot: any = null; // For optimistic move rollback
    private lastMoveHighlightGroup!: Phaser.GameObjects.Group;

    constructor() {
        super('GameScene');
    }

    create() {
        this.boardLogic = new Board();

        // Check Registry
        const mode = this.registry.get('gameMode');
        console.log('GameScene created. Registry gameMode:', mode, 'PlayerId:', this.registry.get('playerId'));
        this.isMultiplayer = mode === 'multiplayer';

        if (!this.isMultiplayer) {
            this.ai = new AI(3, PlayerColor.BLUE);
        }

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

        // Debug UI: Room Info
        const roomText = this.add.text(10, 10, 'Room: --', { fontSize: '16px', color: '#000' });
        const playersText = this.add.text(10, 30, 'Players: --', { fontSize: '16px', color: '#000' });

        // Expose to class scope to update later
        (this as any).roomInfoText = roomText;
        (this as any).playerCountText = playersText;

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
        this.lastMoveHighlightGroup = this.add.group();

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
        this.events.on('showHint', this.showHint, this);
        this.scale.on('resize', this.handleResize, this);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
        this.events.on(Phaser.Scenes.Events.DESTROY, this.shutdown, this);

        this.handleResize(); // Initial positioning

        // Connect LAST to ensure all groups are initialized
        if (this.isMultiplayer) {
            this.setupMultiplayer();
        }
    }

    shutdown() {
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('joined');
            this.socket.off('gameState');
            this.socket.off('moveMade');
            this.socket.off('gameOver');
            this.socket.disconnect();
            this.socket = null;
        }
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
        // Reduce margin to make it bigger on mobile
        const margin = width < 600 ? 10 : 40;
        const availableWidth = width - margin * 2;
        const availableHeight = height - margin * 4;

        // Bigger board on mobile: use more width
        const maxBoardSize = Math.min(availableWidth, availableHeight, (width < 600 ? 1000 : 640));

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
                    // Coordinates using helper
                    const pos = this.getScreenPos(row, col);
                    const x = pos.x;
                    const y = pos.y;

                    // Use Sprite/Container instead of DOM
                    const texture = piece.color === PlayerColor.RED ? 'puck_red' : 'puck_blue';
                    const container = this.add.container(x, y);

                    const puck = this.add.image(0, 0, texture);
                    puck.setDisplaySize(this.tileSize * 0.85, this.tileSize * 0.85);
                    container.add(puck);

                    if (piece.type === PieceType.KING) {
                        const crown = this.add.image(0, 0, 'crown_overlay');
                        crown.setDisplaySize(this.tileSize * 0.85, this.tileSize * 0.85);
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

    getScreenPos(row: number, col: number) {
        let visualRow = row;
        let visualCol = col;

        if (this.isFlipped) {
            visualRow = 7 - row;
            visualCol = 7 - col;
        }

        const x = this.boardOffsetX + visualCol * this.tileSize + this.tileSize / 2;
        const y = this.boardOffsetY + visualRow * this.tileSize + this.tileSize / 2;
        return { x, y };
    }

    handleInput(pointer: Phaser.Input.Pointer) {
        const startX = this.boardOffsetX;
        const startY = this.boardOffsetY;
        const localX = pointer.x - startX;
        const localY = pointer.y - startY;

        let col = Math.floor(localX / this.tileSize);
        let row = Math.floor(localY / this.tileSize);

        if (this.isFlipped) {
            col = 7 - col;
            row = 7 - row;
        }

        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            this.handleSquareClick(row, col);
        } else {
            console.log('Ignored input: out of bounds', row, col);
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

        // Multiplayer Check: Can only interact with OWN pieces
        if (this.isMultiplayer && this.myColor !== undefined) {
            console.log(`[Input] isMultiplayer check. MyColor: ${this.myColor}, ClickedPieceColor: ${clickedPiece?.color}`);
            // If clicking a piece that is NOT mine, return
            if (clickedPiece && clickedPiece.color !== this.myColor) {
                console.log('[Input] Ignored: Clicked opponent piece');
                return;
            }
            // NOTE: If clicking empty square, we allow it (for move destination)
        }

        console.log(`[Input] Checking turn. CurrentPlayer: ${this.boardLogic.currentPlayer}, ClickedPieceColor: ${clickedPiece?.color}`);
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
            if (this.isMultiplayer) {
                const start = { row: this.selectedPiece.r, col: this.selectedPiece.c };
                const end = { row, col };

                // Check if move is valid locally first
                if (!this.boardLogic.isValidMove(start, end)) {
                    return; // Invalid move, don't even try
                }

                // OPTIMISTIC: Save snapshot before move
                this.boardSnapshot = this.boardLogic.toState();

                // OPTIMISTIC: Execute move locally (animation + logic)
                this.executeMove(start, end);

                // Emit to server for validation
                if (this.socket) {
                    this.socket.emit('input', {
                        type: 'move',
                        start: start,
                        end: end
                    });
                }
            } else {
                if (this.boardLogic.isValidMove({ row: this.selectedPiece.r, col: this.selectedPiece.c }, { row, col })) {
                    this.executeMove({ row: this.selectedPiece.r, col: this.selectedPiece.c }, { row, col });
                }
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
            const { captured, promoted, moved } = this.boardLogic.movePiece(start, end);

            // If the piece was NOT moved (e.g., start square was empty), 
            // it means the board state was likely already synced by the server.
            // In this case, we SHOULD NOT switch the turn locally, because 'sync' 
            // already set the correct currentPlayer.
            if (!moved) {
                console.log('Move logic skipped (piece missing). Assuming state already synced.');
                this.createPieces(); // Ensure visuals are correct
                this.isAnimating = false;

                // Apply queued state if any (just in case)
                if (this.pendingState) {
                    this.boardLogic.sync(this.pendingState);
                    this.createPieces();
                    this.updateTurnUI();
                    this.pendingState = null;
                }
                return;
            }

            this.createPieces(); // Full redraw to finalize state (kings, captures)
            this.showLastMoveHighlight(start, end); // Highlight the last move

            // Check for game over immediately after capture (in case all pieces are gone)
            console.log('Checking for game over after move from', start, 'to', end);
            const immediateGameOverCheck = this.boardLogic.checkGameOver();
            console.log('Game over check result:', immediateGameOverCheck);
            console.log('immediateGameOverCheck.gameOver value:', immediateGameOverCheck.gameOver);
            console.log('Type of gameOver:', typeof immediateGameOverCheck.gameOver);

            if (immediateGameOverCheck.gameOver) {
                console.log('ENTERING GAME OVER HANDLER');
                this.handleGameOver(immediateGameOverCheck.winner);
                this.isAnimating = false;
                this.activeChainPiece = null;
                return;
            }

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
                if (this.boardLogic.currentPlayer === PlayerColor.RED) {
                    this.highlightSquares(end.row, end.col, startX, startY);
                    this.showValidMoves(end.row, end.col, startX, startY);
                }
                // Turn continues for current player

                // If it's AI's turn and there's a chain, continue the AI turn
                if (this.boardLogic.currentPlayer === PlayerColor.BLUE) {
                    this.time.delayedCall(500, () => {
                        this.continueAiChain();
                    });
                }
            } else {
                this.activeChainPiece = null;
                this.boardLogic.switchTurn();

                // Check for game over after turn switch
                const gameOverResult = this.boardLogic.checkGameOver();
                if (gameOverResult.gameOver) {
                    this.handleGameOver(gameOverResult.winner);
                    this.isAnimating = false;
                    return;
                }

                this.updateTurnUI();

                // Check if it's now AI's turn
                if (this.boardLogic.currentPlayer === PlayerColor.BLUE) {
                    this.triggerAiTurn();
                }
            }

            this.isAnimating = false;

            // Apply queued state if any
            if (this.pendingState) {
                console.log('Applying pending state after animation');
                this.boardLogic.sync(this.pendingState);
                this.createPieces();
                this.updateTurnUI();
                this.pendingState = null;
            }
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

            const pos = this.getScreenPos(end.row, end.col);
            const targetX = pos.x;
            const targetY = pos.y;

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

    continueAiChain() {
        // This method is called when the AI has a chain capture available
        if (!this.activeChainPiece || this.boardLogic.currentPlayer !== PlayerColor.BLUE) {
            return;
        }

        this.isAiTurn = true;
        this.isAnimating = true;

        // Get valid moves for the active chain piece
        const validMoves = this.boardLogic.getValidMoves({
            row: this.activeChainPiece.r,
            col: this.activeChainPiece.c
        });

        // Filter for capture moves only (distance 2)
        const captureMoves = validMoves.filter(m =>
            Math.abs(m.row - this.activeChainPiece!.r) === 2
        );

        if (captureMoves.length > 0) {
            // Map capture moves to full Move objects
            const possibleMoves = captureMoves.map(end => ({
                start: { row: this.activeChainPiece!.r, col: this.activeChainPiece!.c },
                end: end
            }));

            // Use AI to pick the best capture move from the VALID options only
            const move = this.ai.getBestMove(this.boardLogic.clone(), possibleMoves);

            if (move) {
                // Execute the next capture in the chain
                this.executeMove(
                    { row: this.activeChainPiece.r, col: this.activeChainPiece.c },
                    move.end
                );
            } else {
                // Fallback: just pick the first available capture
                this.executeMove(
                    { row: this.activeChainPiece.r, col: this.activeChainPiece.c },
                    captureMoves[0]
                );
            }
        }

        this.isAiTurn = false;
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
        const pos = this.getScreenPos(row, col);
        const h = this.highlightGroup.create(pos.x, pos.y, 'highlight');
        h.setDisplaySize(this.tileSize, this.tileSize);
    }

    showValidMoves(row: number, col: number, startX: number, startY: number) {
        const moves = this.boardLogic.getValidMoves({ row, col });
        moves.forEach(m => {
            const pos = this.getScreenPos(m.row, m.col);
            const h = this.highlightGroup.create(pos.x, pos.y, 'valid_move');
            h.setDisplaySize(this.tileSize, this.tileSize);
        });
    }

    handleGameOver(winner: PlayerColor | 'draw' | null) {
        console.log('handleGameOver called with winner:', winner, 'myColor:', this.myColor);

        // Calculate score based on remaining pieces
        const redPieces = this.boardLogic.countPieces(PlayerColor.RED);
        const bluePieces = this.boardLogic.countPieces(PlayerColor.BLUE);

        let isWinner = false;
        let isDraw = false;
        let score = 0;

        if (winner === 'draw') {
            isDraw = true;
            score = redPieces * 7;
        } else if (winner !== null) {
            // In multiplayer, check if winner matches THIS player's color
            // In AI mode, myColor is always RED (the human player)
            if (this.isMultiplayer) {
                isWinner = winner === this.myColor;
            } else {
                // AI mode: RED is the human player
                isWinner = winner === PlayerColor.RED;
            }

            // Score based on perspective
            if (isWinner) {
                const myPieces = this.myColor === PlayerColor.RED ? redPieces : bluePieces;
                score = myPieces * 10;
            } else {
                const myPieces = this.myColor === PlayerColor.RED ? redPieces : bluePieces;
                score = myPieces * 5;
            }
        }

        console.log('Emitting gameOver event:', { isWinner, isDraw, score, redPieces, bluePieces });

        // Emit game over event to be caught by the React layer
        this.events.emit('gameOver', {
            isWinner,
            isDraw,
            score,
            redPieces,
            bluePieces
        });
    }

    showHint() {
        // Only show hints for the player's turn (RED)
        if (this.boardLogic.currentPlayer !== PlayerColor.RED || this.isAiTurn || this.isAnimating) {
            return;
        }

        // Clear any existing highlights
        this.highlightGroup.clear(true, true);

        // Use AI to get the best move for the player
        const playerAI = new AI(2, PlayerColor.RED); // Lower depth for faster hint
        const bestMove = playerAI.getBestMove(this.boardLogic.clone());

        if (bestMove) {
            const startX = this.boardOffsetX;
            const startY = this.boardOffsetY;

            // Highlight the piece to move with a pulsing effect
            const pos = this.getScreenPos(bestMove.start.row, bestMove.start.col);
            const pieceX = pos.x;
            const pieceY = pos.y;

            const hintPiece = this.add.circle(pieceX, pieceY, this.tileSize * 0.5, 0xFFCE31, 0.4);
            this.highlightGroup.add(hintPiece);

            // Pulsing animation for the piece
            this.tweens.add({
                targets: hintPiece,
                alpha: 0.7,
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut'
            });

            // Highlight the destination with an arrow or marker
            const destPos = this.getScreenPos(bestMove.end.row, bestMove.end.col);
            const destX = destPos.x;
            const destY = destPos.y;

            const hintDest = this.add.circle(destX, destY, this.tileSize * 0.4, 0x00FF88, 0.5);
            this.highlightGroup.add(hintDest);

            // Pulsing animation for the destination
            this.tweens.add({
                targets: hintDest,
                alpha: 0.8,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut'
            });

            // Draw an arrow from piece to destination
            const graphics = this.add.graphics();
            graphics.lineStyle(4, 0xFFCE31, 0.6);
            graphics.beginPath();
            graphics.moveTo(pieceX, pieceY);
            graphics.lineTo(destX, destY);
            graphics.strokePath();
            this.highlightGroup.add(graphics);

            // Fade out the arrow
            this.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: 1500,
                delay: 1000,
                onComplete: () => {
                    this.highlightGroup.clear(true, true);
                }
            });
        }
    }

    /**
     * Highlight the last move: bright on destination, subtle on origin and capture path.
     */
    showLastMoveHighlight(start: { row: number, col: number }, end: { row: number, col: number }) {
        // Clear previous highlights
        this.lastMoveHighlightGroup.clear(true, true);

        const subtleColor = 0xFFCE31; // Yellow
        const brightColor = 0x00FF88; // Green
        const subtleAlpha = 0.25;
        const brightAlpha = 0.45;

        // Origin tile (subtle)
        const startPos = this.getScreenPos(start.row, start.col);
        const startHighlight = this.add.rectangle(
            startPos.x, startPos.y,
            this.tileSize * 0.9, this.tileSize * 0.9,
            subtleColor, subtleAlpha
        );
        startHighlight.setStrokeStyle(2, subtleColor, 0.5);
        this.lastMoveHighlightGroup.add(startHighlight);

        // If capture (jump), highlight the midpoint tile
        if (Math.abs(start.row - end.row) === 2) {
            const midRow = (start.row + end.row) / 2;
            const midCol = (start.col + end.col) / 2;
            const midPos = this.getScreenPos(midRow, midCol);
            const midHighlight = this.add.rectangle(
                midPos.x, midPos.y,
                this.tileSize * 0.9, this.tileSize * 0.9,
                0xFF4444, subtleAlpha // Red for captured
            );
            midHighlight.setStrokeStyle(2, 0xFF4444, 0.5);
            this.lastMoveHighlightGroup.add(midHighlight);
        }

        // Destination tile (bright)
        const endPos = this.getScreenPos(end.row, end.col);
        const endHighlight = this.add.rectangle(
            endPos.x, endPos.y,
            this.tileSize * 0.9, this.tileSize * 0.9,
            brightColor, brightAlpha
        );
        endHighlight.setStrokeStyle(3, brightColor, 0.8);
        this.lastMoveHighlightGroup.add(endHighlight);
    }

    setupMultiplayer() {
        let playerId = this.registry.get('playerId');
        if (!playerId) {
            const storedId = localStorage.getItem('checkers_guest_id');
            if (storedId) {
                playerId = storedId;
            } else {
                playerId = 'guest_' + Math.floor(Math.random() * 100000);
                localStorage.setItem('checkers_guest_id', playerId);
            }
            console.log('Using Guest ID:', playerId);
        }

        // Read matchmaking options from registry
        const joinType = this.registry.get('joinType') || 'quickmatch';
        const roomCode = this.registry.get('roomCode') || null;

        this.socket = io(`${API_URL}/checkers`, {
            query: {
                playerId: playerId,
                username: this.registry.get('username') || 'Guest'
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to Checkers Server. JoinType:', joinType, 'RoomCode:', roomCode);
            this.socket?.emit('join', {
                playerId: playerId,
                username: this.registry.get('username') || 'Guest',
                joinType: joinType,
                roomCode: roomCode
            });
        });

        this.socket.on('joined', (data: any) => {
            console.log('Joined room:', data);

            // Update Debug UI
            if ((this as any).roomInfoText) (this as any).roomInfoText.setText(`Room: ${data.roomId}`);
            if ((this as any).playerCountText) (this as any).playerCountText.setText(`Players: ${data.players.length}`);

            this.myColor = data.yourColor === 'RED' ? PlayerColor.RED : PlayerColor.BLUE;

            // Flip board if BLUE
            this.isFlipped = this.myColor === PlayerColor.BLUE;
            if (this.isFlipped) {
                console.log('Flipping board for Blue player');
                this.createPieces();
            }
        });

        this.socket.on('playerJoined', (data: any) => {
            console.log('Another player joined:', data);
            // We don't have the full list here easily unless we track it, 
            // but we can increment or just say "Players: updated"
            // Ideally server sends full list or count. 
            // lets just append to a local list logic? 
            // For now, simpler: asking server or just "Players: 2" since max is 2
            if ((this as any).playerCountText) (this as any).playerCountText.setText(`Players: 2 (Full)`);
        });

        this.socket.on('playerLeft', (data: any) => {
            console.log('Player left:', data);
            if ((this as any).playerCountText) (this as any).playerCountText.setText(`Players: 1`);
        });

        this.socket.on('gameState', (state: any) => {
            // Guard: If animating a move, don't clobber state yet.
            // onMoveComplete will trigger a sync or createPieces eventually.
            // Guard: If animating a move, don't clobber state yet.
            // onMoveComplete will trigger a sync or createPieces eventually.
            if (this.isAnimating) {
                console.log('Queuing gameState update while animating');
                this.pendingState = state;
                return;
            }
            this.boardLogic.sync(state);
            this.createPieces();
            this.updateTurnUI();

            // Sync chain state if needed, though 'moveMade' handles animation logic best
        });

        this.socket.on('moveMade', (data: any) => {
            console.log('Client received moveMade event:', data);
            // Clear snapshot - move was accepted
            this.boardSnapshot = null;

            // If we already animated optimistically (it was our move), skip
            // The server state will sync via gameState event
            // Only animate if it's the opponent's move
            if (data.color !== (this.myColor === PlayerColor.RED ? 'RED' : 'BLUE')) {
                this.animateMoveOnly(data.start, data.end, data.result);
            }
        });

        this.socket.on('invalidMove', () => {
            console.warn('[Optimistic] Move rejected by server. Rolling back.');
            if (this.boardSnapshot) {
                this.boardLogic.sync(this.boardSnapshot);
                this.createPieces();
                this.updateTurnUI();
                this.boardSnapshot = null;
                this.isAnimating = false;
            }
        });

        this.socket.on('gameOver', (result: any) => {
            this.handleGameOver(result.winner);
        });
    }

    restartGame() {
        if (this.isMultiplayer) return; // Cannot restart multiplayer locally

        this.boardLogic.reset();
        this.createPieces();
        this.highlightGroup.clear(true, true);
        this.selectedPiece = null;
        this.isAnimating = false;
        this.isAiTurn = false;
    }

    /**
     * Multiplayer-only: Animate a move without running local game logic.
     * The server state (via gameState event) is the source of truth.
     */
    animateMoveOnly(start: { row: number, col: number }, end: { row: number, col: number }, result?: { captured?: boolean, promoted?: boolean }) {
        this.isAnimating = true;
        this.highlightGroup.clear(true, true);
        this.selectedPiece = null;

        // Find the visual piece to animate
        let visualPiece: Phaser.GameObjects.Container | null = null;
        const children = this.pieceGroup.getChildren();
        for (const child of children) {
            const container = child as Phaser.GameObjects.Container;
            if (container.getData('r') === start.row && container.getData('c') === start.col) {
                visualPiece = container;
                break;
            }
        }

        const onAnimComplete = () => {
            this.isAnimating = false;
            this.showLastMoveHighlight(start, end); // Highlight the opponent's move
            // Apply any pending state from server
            if (this.pendingState) {
                console.log('[MP] Applying pending state after animation');
                this.boardLogic.sync(this.pendingState);
                this.createPieces();
                this.updateTurnUI();
                this.pendingState = null;
            }
        };

        if (visualPiece) {
            visualPiece.setDepth(100);

            // Animate capture fade-out if applicable
            if (result?.captured || Math.abs(start.row - end.row) === 2) {
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
            }

            const pos = this.getScreenPos(end.row, end.col);
            this.tweens.add({
                targets: visualPiece,
                x: pos.x,
                y: pos.y,
                duration: 300,
                ease: 'Power2',
                onComplete: onAnimComplete
            });
        } else {
            // No visual piece found (maybe already synced), just complete
            console.warn('[MP] animateMoveOnly: Could not find visual piece at', start);
            onAnimComplete();
        }
    }
}
