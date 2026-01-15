
const { PlayerColor, PieceType } = require('./Piece');

class Board {
  constructor() {
    this.rows = 8;
    this.cols = 8;
    this.currentPlayer = PlayerColor.RED;
    this.reset();
  }

  reset() {
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    this.currentPlayer = PlayerColor.RED;
    this.setupPieces();
  }

  setupPieces() {
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

  getPiece(row, col) {
    if (this.isValidPos(row, col)) {
      return this.grid[row][col];
    }
    return null;
  }

  isValidPos(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  getValidMoves(pos) {
    const piece = this.getPiece(pos.row, pos.col);
    if (!piece) return [];
    const moves = [];
    const directions = piece.type === PieceType.KING ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
      piece.color === PlayerColor.RED ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];

    for (const [dRow, dCol] of directions) {
      const targetRow = pos.row + dRow;
      const targetCol = pos.col + dCol;

      // Simple move
      if (this.isValidPos(targetRow, targetCol) && this.getPiece(targetRow, targetCol) === null) {
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

  isValidMove(start, end) {
    const validMoves = this.getValidMoves(start);
    return validMoves.some(m => m.row === end.row && m.col === end.col);
  }

  movePiece(start, end) {
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
    }
    return { captured, promoted };
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === PlayerColor.RED ? PlayerColor.BLUE : PlayerColor.RED;
  }

  getAllValidMoves() {
    const moves = [];
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

  countPieces(color) {
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

  checkGameOver() {
    const redPieces = this.countPieces(PlayerColor.RED);
    const bluePieces = this.countPieces(PlayerColor.BLUE);

    if (redPieces === 0) return { gameOver: true, winner: PlayerColor.BLUE };
    if (bluePieces === 0) return { gameOver: true, winner: PlayerColor.RED };

    const currentPlayerMoves = this.getAllValidMoves();
    if (currentPlayerMoves.length === 0) {
      return { gameOver: true, winner: this.currentPlayer === PlayerColor.RED ? PlayerColor.BLUE : PlayerColor.RED };
    }

    return { gameOver: false, winner: null };
  }

  // For serialization
  toState() {
    return {
      grid: this.grid,
      currentPlayer: this.currentPlayer
    };
  }
}

module.exports = Board;
