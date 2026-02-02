import { type Piece, PieceType, PlayerColor, type Position } from './Piece';

export class Board {
    private grid: (Piece | null)[][];
    public readonly rows = 8;
    public readonly cols = 8;
    public currentPlayer: PlayerColor = PlayerColor.RED;

    constructor() {
        this.grid = [];
        this.reset();
    }

    reset() {
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = PlayerColor.RED;
        this.setupPieces();
    }

    private setupPieces() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if ((row + col) % 2 === 1) {
                    if (row < 3) {
                        this.grid[row][col] = { color: PlayerColor.BLUE, type: PieceType.MAN }; // Top side
                    } else if (row > 4) {
                        this.grid[row][col] = { color: PlayerColor.RED, type: PieceType.MAN }; // Bottom side
                    }
                }
            }
        }
    }

    getPiece(row: number, col: number): Piece | null {
        if (this.isValidPos(row, col)) {
            return this.grid[row][col];
        }
        return null;
    }

    isValidPos(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    // Get all valid moves for a specific piece
    getValidMoves(pos: Position): Position[] {
        const piece = this.getPiece(pos.row, pos.col);
        if (!piece) return [];
        const moves: Position[] = [];
        const directions = piece.type === PieceType.KING ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
            piece.color === PlayerColor.RED ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];

        for (const [dRow, dCol] of directions) {
            const targetRow = pos.row + dRow;
            const targetCol = pos.col + dCol;

            // Simple move
            if (this.isValidPos(targetRow, targetCol) && this.getPiece(targetRow, targetCol) === null) {
                // If we are forcing captures, we might need to filter this out later. For now, allow it.
                moves.push({ row: targetRow, col: targetCol });
            }

            // Capture move
            const jumpRow = pos.row + dRow * 2;
            const jumpCol = pos.col + dCol * 2;
            if (this.isValidPos(jumpRow, jumpCol) && this.getPiece(jumpRow, jumpCol) === null) {
                const midPiece = this.getPiece(targetRow, targetCol);
                if (midPiece && midPiece.color !== piece.color) {
                    moves.push({ row: jumpRow, col: jumpCol });
                }
            }
        }
        return moves;
    }

    isValidMove(start: Position, end: Position): boolean {
        const validMoves = this.getValidMoves(start);
        return validMoves.some(m => m.row === end.row && m.col === end.col);
    }

    movePiece(start: Position, end: Position): { captured: boolean, promoted: boolean, moved: boolean } {
        const piece = this.getPiece(start.row, start.col);
        let captured = false;
        let promoted = false;

        if (piece) {
            // Check for capture
            if (Math.abs(end.row - start.row) === 2) {
                const midRow = (start.row + end.row) / 2;
                const midCol = (start.col + end.col) / 2;
                this.grid[midRow][midCol] = null;
                captured = true;
            }

            this.grid[end.row][end.col] = piece;
            this.grid[start.row][start.col] = null;

            // Promote if needed
            if ((piece.color === PlayerColor.RED && end.row === 0 && piece.type !== PieceType.KING) ||
                (piece.color === PlayerColor.BLUE && end.row === 7 && piece.type !== PieceType.KING)) {
                piece.type = PieceType.KING;
                promoted = true;
            }
            return { captured, promoted, moved: true };
        }
        return { captured, promoted, moved: false };
    }

    switchTurn() {
        this.currentPlayer = this.currentPlayer === PlayerColor.RED ? PlayerColor.BLUE : PlayerColor.RED;
    }
    clone(): Board {
        const newBoard = new Board();
        newBoard.currentPlayer = this.currentPlayer;
        // Deep copy the grid
        newBoard.grid = this.grid.map(row => row.map(piece => piece ? { ...piece } : null));
        return newBoard;
    }

    // Helper to get all possible moves for the current player
    getAllValidMoves(): { start: Position, end: Position }[] {
        const moves: { start: Position, end: Position }[] = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === this.currentPlayer) {
                    const validMoves = this.getValidMoves({ row, col });
                    validMoves.forEach(end => {
                        moves.push({ start: { row, col }, end });
                    });
                }
            }
        }
        return moves;
    }

    // Count pieces for each player
    countPieces(color: PlayerColor): number {
        let count = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === color) {
                    count++;
                }
            }
        }
        return count;
    }

    // Check if game is over and return the result
    // Returns: null (game continues), 'red' (red wins), 'blue' (blue wins), 'draw'
    checkGameOver(): { gameOver: boolean, winner: PlayerColor | 'draw' | null } {
        const redPieces = this.countPieces(PlayerColor.RED);
        const bluePieces = this.countPieces(PlayerColor.BLUE);

        console.log('checkGameOver called - Red pieces:', redPieces, 'Blue pieces:', bluePieces, 'Current player:', this.currentPlayer);

        // Check if either player has no pieces left
        if (redPieces === 0) {
            console.log('Game Over: Blue wins (no red pieces)');
            return { gameOver: true, winner: PlayerColor.BLUE };
        }
        if (bluePieces === 0) {
            console.log('Game Over: Red wins (no blue pieces)');
            return { gameOver: true, winner: PlayerColor.RED };
        }

        // Check if current player has no valid moves (stalemate)
        const currentPlayerMoves = this.getAllValidMoves();
        if (currentPlayerMoves.length === 0) {
            // Current player can't move, they lose
            const winner = this.currentPlayer === PlayerColor.RED ? PlayerColor.BLUE : PlayerColor.RED;
            console.log('Game Over: Stalemate -', winner, 'wins');
            return { gameOver: true, winner };
        }

        return { gameOver: false, winner: null };
    }

    // Sync board state from server
    sync(state: any) {
        console.log(`[Board] Syncing state. CurrentPlayer: ${this.currentPlayer} -> New: ${state.currentPlayer}`);
        if (state.grid) {
            // Restore grid with Piece objects
            this.grid = state.grid.map((row: any[]) =>
                row.map(p => p ? { ...p } : null)
            );
        }
        if (state.currentPlayer) {
            this.currentPlayer = state.currentPlayer;
        }
    }

    // Serialize board state (for optimistic move snapshots)
    toState() {
        return {
            grid: this.grid.map(row => row.map(p => p ? { ...p } : null)),
            currentPlayer: this.currentPlayer
        };
    }
}
