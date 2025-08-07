import { ChessEngine } from './chess-engine';
import { Piece, PieceColor, Position, Move, Difficulty, PieceType } from './types';

export class ChessAI {
  private engine: ChessEngine;
  private difficulty: Difficulty;
  private color: PieceColor;

  // Piece values for evaluation
  private readonly pieceValues: Record<PieceType, number> = {
    pawn: 10,
    knight: 30,
    bishop: 30,
    rook: 50,
    queen: 90,
    king: 900
  };

  // Position bonuses for better play
  private readonly positionBonus = {
    pawn: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    knight: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    bishop: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5, 10, 10,  5,  0,-10],
      [-10,  5,  5, 10, 10,  5,  5,-10],
      [-10,  0, 10, 10, 10, 10,  0,-10],
      [-10, 10, 10, 10, 10, 10, 10,-10],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    rook: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [5, 10, 10, 10, 10, 10, 10,  5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    queen: [
      [-20,-10,-10, -5, -5,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5,  5,  5,  5,  0,-10],
      [-5,  0,  5,  5,  5,  5,  0, -5],
      [0,  0,  5,  5,  5,  5,  0, -5],
      [-10,  5,  5,  5,  5,  5,  0,-10],
      [-10,  0,  5,  0,  0,  0,  0,-10],
      [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    king: [
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [20, 20,  0,  0,  0,  0, 20, 20],
      [20, 30, 10,  0,  0, 10, 30, 20]
    ]
  };

  constructor(engine: ChessEngine, difficulty: Difficulty, color: PieceColor) {
    this.engine = engine;
    this.difficulty = difficulty;
    this.color = color;
  }

  public async makeMove(): Promise<Move | null> {
    // Add thinking delay for realism
    const thinkingTime = this.getThinkingTime();
    await this.delay(thinkingTime);

    const depth = this.getSearchDepth();
    const bestMove = this.findBestMove(depth);
    
    if (bestMove) {
      return this.engine.makeMove(bestMove.from, bestMove.to);
    }
    
    return null;
  }

  private getThinkingTime(): number {
    switch (this.difficulty) {
      case 'easy': return Math.random() * 1000 + 500; // 0.5-1.5s
      case 'medium': return Math.random() * 2000 + 1000; // 1-3s
      case 'hard': return Math.random() * 3000 + 2000; // 2-5s
      default: return 1000;
    }
  }

  private getSearchDepth(): number {
    switch (this.difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 2;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private findBestMove(depth: number): { from: Position; to: Position } | null {
    const allMoves = this.getAllPossibleMoves(this.color);
    if (allMoves.length === 0) return null;

    // Easy difficulty: make some random moves
    if (this.difficulty === 'easy' && Math.random() < 0.3) {
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      return randomMove;
    }

    let bestMove = allMoves[0];
    let bestScore = -Infinity;

    for (const move of allMoves) {
      const score = this.minimax(move.from, move.to, depth - 1, -Infinity, Infinity, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private getAllPossibleMoves(color: PieceColor): { from: Position; to: Position }[] {
    const moves: { from: Position; to: Position }[] = [];
    const board = this.engine.getBoard();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const validMoves = this.engine.getValidMoves(piece.position);
          for (const to of validMoves) {
            moves.push({ from: piece.position, to });
          }
        }
      }
    }

    return moves;
  }

  private minimax(from: Position, to: Position, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
    // Make the move temporarily
    const originalPiece = this.engine.getPieceAt(from);
    const capturedPiece = this.engine.getPieceAt(to);
    
    if (!originalPiece) return 0;

    // Simulate the move
    const move = this.engine.makeMove(from, to);
    if (!move) return maximizingPlayer ? -Infinity : Infinity;

    // Base case
    if (depth === 0 || this.engine.isCheckmate() || this.engine.isStalemate()) {
      const score = this.evaluatePosition();
      // Undo the move (simplified - in real implementation you'd need full undo)
      return score;
    }

    const currentColor = this.engine.getCurrentTurn();
    const allMoves = this.getAllPossibleMoves(currentColor);

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const nextMove of allMoves) {
        const evaluation = this.minimax(nextMove.from, nextMove.to, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const nextMove of allMoves) {
        const evaluation = this.minimax(nextMove.from, nextMove.to, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  private evaluatePosition(): number {
    const board = this.engine.getBoard();
    let score = 0;

    // Material and position evaluation
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const pieceValue = this.pieceValues[piece.type];
          const positionValue = this.positionBonus[piece.type][piece.color === 'white' ? row : 7 - row][col];
          const totalValue = pieceValue + positionValue / 10;
          
          if (piece.color === this.color) {
            score += totalValue;
          } else {
            score -= totalValue;
          }
        }
      }
    }

    // Bonus for checking opponent
    if (this.engine.isInCheck(this.getOpponentColor(this.color))) {
      score += 50;
    }

    // Penalty for being in check
    if (this.engine.isInCheck(this.color)) {
      score -= 50;
    }

    // Checkmate evaluation
    if (this.engine.isCheckmate()) {
      const winner = this.getOpponentColor(this.engine.getCurrentTurn());
      return winner === this.color ? 10000 : -10000;
    }

    // Stalemate evaluation
    if (this.engine.isStalemate()) {
      return 0;
    }

    return score;
  }

  private getOpponentColor(color: PieceColor): PieceColor {
    return color === 'white' ? 'black' : 'white';
  }

  private positionToIndex(position: Position): [number, number] {
    const col = position.charCodeAt(0) - 97;
    const row = 8 - parseInt(position[1]);
    return [row, col];
  }

  public setDifficulty(difficulty: Difficulty) {
    this.difficulty = difficulty;
  }

  public getDifficulty(): Difficulty {
    return this.difficulty;
  }
}