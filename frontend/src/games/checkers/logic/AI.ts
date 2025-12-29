import { Board } from './Board';
import { PlayerColor, PieceType } from './Piece';

export interface Move {
    start: { row: number, col: number };
    end: { row: number, col: number };
}

export class AI {
    private depth: number;
    private aiColor: PlayerColor;

    constructor(depth: number = 3, aiColor: PlayerColor = PlayerColor.BLUE) {
        this.depth = depth;
        this.aiColor = aiColor;
    }

    getBestMove(board: Board): Move | null {
        const result = this.minimax(board, this.depth, -Infinity, Infinity, true);
        return result.move;
    }

    private minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): { score: number, move: Move | null } {
        // Terminal case: Game over or max depth reached
        // Note: We don't have a game over check in Board yet, assuming purely on depth or no moves for now
        const allMoves = board.getAllValidMoves();

        if (depth === 0 || allMoves.length === 0) {
            return { score: this.evaluate(board), move: null };
        }

        let bestMove: Move | null = null;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of allMoves) {
                const newBoard = board.clone();
                newBoard.movePiece(move.start, move.end);
                newBoard.switchTurn(); // Explicitly switch turn for AI simulation

                const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, false).score;

                if (evalScore > maxEval) {
                    maxEval = evalScore;
                    bestMove = move;
                }
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break; // Prune
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (const move of allMoves) {
                const newBoard = board.clone();
                newBoard.movePiece(move.start, move.end);
                newBoard.switchTurn(); // Explicitly switch turn for AI simulation

                const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, true).score;

                if (evalScore < minEval) {
                    minEval = evalScore;
                    bestMove = move;
                }
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break; // Prune
            }
            return { score: minEval, move: bestMove };
        }
    }

    private evaluate(board: Board): number {
        let score = 0;
        for (let row = 0; row < board.rows; row++) {
            for (let col = 0; col < board.cols; col++) {
                const piece = board.getPiece(row, col);
                if (piece) {
                    let value = piece.type === PieceType.KING ? 5 : 1;

                    // Positional weight: Advance towards enemy side
                    // Blue moves down (increasing row index), Red moves up (decreasing row index)
                    // (Assuming Blue starts at top 0-2 and Red at bottom 5-7 based on Board.ts setupPieces)
                    if (piece.color === PlayerColor.BLUE) {
                        value += row * 0.1;
                    } else {
                        value += (7 - row) * 0.1;
                    }

                    if (piece.color === this.aiColor) {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }
        return score;
    }
}
