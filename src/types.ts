export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type Position = string; // e.g., 'e4', 'a1'
export type GameMode = 'bullet' | 'rapid' | 'timeless';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'setup' | 'playing' | 'paused' | 'ended';
export type GameResult = 'win' | 'loss' | 'draw';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
  promotionPiece?: PieceType;
  notation: string;
  timestamp: number;
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PieceColor;
  timeLimit?: number; // in seconds
}

export interface GameStats {
  movesPlayed: number;
  timeElapsed: number;
  capturedPieces: { white: Piece[], black: Piece[] };
  isInCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
}

export interface Timer {
  white: number;
  black: number;
  active: PieceColor | null;
}

// Chess piece Unicode symbols
export const PieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

// Game mode configurations
export const GameModes: Record<GameMode, { name: string; description: string; timeLimit?: number }> = {
  bullet: {
    name: 'Bullet',
    description: '1 minute per player - Lightning fast games',
    timeLimit: 60
  },
  rapid: {
    name: 'Rapid',
    description: '10 minutes per player - Quick tactical games',
    timeLimit: 600
  },
  timeless: {
    name: 'Timeless',
    description: 'No time limit - Pure strategy and contemplation'
  }
};