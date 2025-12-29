export const PieceType = {
    MAN: 'MAN',
    KING: 'KING'
} as const;
export type PieceType = typeof PieceType[keyof typeof PieceType];

export const PlayerColor = {
    RED: 'RED',
    BLUE: 'BLUE'
} as const;
export type PlayerColor = typeof PlayerColor[keyof typeof PlayerColor];

export interface Piece {
    color: PlayerColor;
    type: PieceType;
}

export interface Position {
    row: number;
    col: number;
}
