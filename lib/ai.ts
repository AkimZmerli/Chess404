import { 
  GameState, 
  Move, 
  Square, 
  Color, 
  Piece,
  PIECE_VALUES,
  PieceType 
} from './types'
import { ChessEngine } from './chess-engine'
import { getAllSquares, squareToCoordinates } from './utils'

export class ChessAI {
  private baseEngine: ChessEngine
  
  // Piece-square tables for positional evaluation
  private readonly PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ]

  private readonly KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ]

  private readonly BISHOP_TABLE = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ]

  private readonly ROOK_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ]

  private readonly QUEEN_TABLE = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ]

  private readonly KING_MIDDLE_TABLE = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]

  private readonly KING_END_TABLE = [
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-30,-20,-10,  0,  0,-10,-20,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-30,  0,  0,  0,  0,-30,-30],
    [-50,-30,-30,-30,-30,-30,-30,-50]
  ]

  constructor(engine: ChessEngine) {
    this.baseEngine = engine
  }

  // Find the best move for the current position
  findBestMove(depth: number = 3): Move | null {
    // Create a working copy of the engine
    const engine = this.baseEngine.clone()
    const gameState = engine.getCurrentState()
    const isMaximizing = gameState.turn === 'white'
    
    let bestMove: Move | null = null
    let bestValue = isMaximizing ? -Infinity : Infinity
    
    // Get all possible moves
    const moves = this.getAllPossibleMoves(engine, gameState.turn)
    
    // If no moves available, return null
    if (moves.length === 0) return null
    
    // Evaluate each move
    for (const move of moves) {
      // Make the move
      const actualMove = engine.makeMove(move.from, move.to)
      if (!actualMove) continue
      
      // Evaluate the position
      const value = this.minimax(engine, depth - 1, -Infinity, Infinity, !isMaximizing)
      
      // Undo the move
      engine.undoLastMove()
      
      // Update best move
      if (isMaximizing) {
        if (value > bestValue) {
          bestValue = value
          bestMove = actualMove
        }
      } else {
        if (value < bestValue) {
          bestValue = value
          bestMove = actualMove
        }
      }
    }
    
    return bestMove
  }

  // Minimax algorithm with alpha-beta pruning
  private minimax(engine: ChessEngine, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    const gameState = engine.getCurrentState()
    
    // Terminal node or depth reached
    if (depth === 0 || gameState.checkmate || gameState.stalemate) {
      return this.evaluatePosition(engine)
    }
    
    const moves = this.getAllPossibleMoves(engine, gameState.turn)
    
    if (isMaximizing) {
      let maxEval = -Infinity
      
      for (const move of moves) {
        const actualMove = engine.makeMove(move.from, move.to)
        if (!actualMove) continue
        
        const evaluation = this.minimax(engine, depth - 1, alpha, beta, false)
        engine.undoLastMove()
        
        maxEval = Math.max(maxEval, evaluation)
        alpha = Math.max(alpha, evaluation)
        
        if (beta <= alpha) break // Beta cutoff
      }
      
      return maxEval
    } else {
      let minEval = Infinity
      
      for (const move of moves) {
        const actualMove = engine.makeMove(move.from, move.to)
        if (!actualMove) continue
        
        const evaluation = this.minimax(engine, depth - 1, alpha, beta, true)
        engine.undoLastMove()
        
        minEval = Math.min(minEval, evaluation)
        beta = Math.min(beta, evaluation)
        
        if (beta <= alpha) break // Alpha cutoff
      }
      
      return minEval
    }
  }

  // Evaluate the current position
  private evaluatePosition(engine: ChessEngine): number {
    const gameState = engine.getCurrentState()
    
    // Checkmate evaluation
    if (gameState.checkmate) {
      return gameState.turn === 'white' ? -100000 : 100000
    }
    
    // Stalemate or draw
    if (gameState.stalemate || gameState.status === 'draw') {
      return 0
    }
    
    let evaluation = 0
    
    // Material and position evaluation
    for (const square of getAllSquares()) {
      const piece = engine.getPieceAt(square)
      if (!piece) continue
      
      const pieceValue = PIECE_VALUES[piece.type]
      const positionValue = this.getPositionValue(piece, square)
      const totalValue = pieceValue + positionValue
      
      evaluation += piece.color === 'white' ? totalValue : -totalValue
    }
    
    // Bonus for castling rights
    const castlingBonus = 20
    if (gameState.castlingRights.white.kingside || gameState.castlingRights.white.queenside) {
      evaluation += castlingBonus
    }
    if (gameState.castlingRights.black.kingside || gameState.castlingRights.black.queenside) {
      evaluation -= castlingBonus
    }
    
    // Penalty for being in check
    if (gameState.check) {
      evaluation += gameState.turn === 'white' ? -50 : 50
    }
    
    return evaluation
  }

  // Get positional value for a piece
  private getPositionValue(piece: Piece, square: Square): number {
    const coords = squareToCoordinates(square)
    const row = piece.color === 'white' ? 7 - coords.row : coords.row
    const col = coords.col
    
    switch (piece.type) {
      case 'pawn':
        return this.PAWN_TABLE[row][col]
      case 'knight':
        return this.KNIGHT_TABLE[row][col]
      case 'bishop':
        return this.BISHOP_TABLE[row][col]
      case 'rook':
        return this.ROOK_TABLE[row][col]
      case 'queen':
        return this.QUEEN_TABLE[row][col]
      case 'king':
        // Use endgame table if few pieces remain
        const pieceCount = this.countPieces(this.baseEngine)
        return pieceCount < 10 ? this.KING_END_TABLE[row][col] : this.KING_MIDDLE_TABLE[row][col]
      default:
        return 0
    }
  }

  // Count total pieces on board
  private countPieces(engine: ChessEngine): number {
    let count = 0
    for (const square of getAllSquares()) {
      if (engine.getPieceAt(square)) count++
    }
    return count
  }

  // Get all possible moves for a color
  private getAllPossibleMoves(engine: ChessEngine, color: Color): { from: Square; to: Square }[] {
    const moves: { from: Square; to: Square }[] = []
    
    for (const square of getAllSquares()) {
      const piece = engine.getPieceAt(square)
      if (!piece || piece.color !== color) continue
      
      const legalMoves = engine.getLegalMoves(square)
      for (const toSquare of legalMoves) {
        moves.push({ from: square, to: toSquare })
      }
    }
    
    // Shuffle moves for variety
    for (let i = moves.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [moves[i], moves[j]] = [moves[j], moves[i]]
    }
    
    return moves
  }
}