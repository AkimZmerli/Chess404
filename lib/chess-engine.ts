import {
  Position,
  Piece,
  Move,
  Square,
  Color,
  GameState,
  Coordinates,
  PieceType,
  INITIAL_POSITION,
  GameStatus
} from './types'
import {
  squareToCoordinates,
  coordinatesToSquare,
  isValidCoordinate,
  getAllSquares,
  getOppositeColor,
  areSquaresOnSameDiagonal,
  areSquaresOnSameRank,
  areSquaresOnSameFile,
  getSquaresBetween
} from './utils'

export class ChessEngine {
  private state: GameState
  private stateHistory: GameState[] = []

  constructor() {
    this.state = this.getInitialState()
  }

  // Initialize game state
  private getInitialState(): GameState {
    return {
      position: { ...INITIAL_POSITION },
      turn: 'white',
      castlingRights: {
        white: { kingside: true, queenside: true },
        black: { kingside: true, queenside: true }
      },
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
      moveHistory: [],
      capturedPieces: {
        white: [],
        black: []
      },
      status: 'active',
      check: false,
      checkmate: false,
      stalemate: false
    }
  }

  // Get current game state
  getCurrentState(): GameState {
    return { ...this.state }
  }

  // Reset the game
  reset(): void {
    this.state = this.getInitialState()
  }

  // Get piece at a square
  getPieceAt(square: Square): Piece | null {
    return this.state.position[square] || null
  }

  // Get all pieces of a specific color
  getPiecesForColor(color: Color): { square: Square; piece: Piece }[] {
    const pieces: { square: Square; piece: Piece }[] = []
    
    for (const square of getAllSquares()) {
      const piece = this.getPieceAt(square)
      if (piece && piece.color === color) {
        pieces.push({ square: square as Square, piece })
      }
    }
    
    return pieces
  }

  // Find king position
  findKing(color: Color): Square | null {
    for (const square of getAllSquares()) {
      const piece = this.getPieceAt(square)
      if (piece && piece.type === 'king' && piece.color === color) {
        return square as Square
      }
    }
    return null
  }

  // Get all legal moves for a piece at a square
  getLegalMoves(square: Square): Square[] {
    const piece = this.getPieceAt(square)
    if (!piece || piece.color !== this.state.turn) {
      return []
    }

    const pseudoLegalMoves = this.getPseudoLegalMoves(square, piece)
    const legalMoves: Square[] = []

    // Filter out moves that would leave king in check
    for (const toSquare of pseudoLegalMoves) {
      if (this.wouldMoveLeaveKingInCheck(square, toSquare, piece.color)) {
        continue
      }
      legalMoves.push(toSquare)
    }

    return legalMoves
  }

  // Get pseudo-legal moves (not considering check)
  private getPseudoLegalMoves(square: Square, piece: Piece): Square[] {
    switch (piece.type) {
      case 'pawn':
        return this.getPawnMoves(square, piece)
      case 'knight':
        return this.getKnightMoves(square, piece)
      case 'bishop':
        return this.getBishopMoves(square, piece)
      case 'rook':
        return this.getRookMoves(square, piece)
      case 'queen':
        return this.getQueenMoves(square, piece)
      case 'king':
        return this.getKingMoves(square, piece)
      default:
        return []
    }
  }

  // Pawn moves
  private getPawnMoves(square: Square, piece: Piece): Square[] {
    const moves: Square[] = []
    const coords = squareToCoordinates(square)
    const direction = piece.color === 'white' ? 1 : -1
    const startRow = piece.color === 'white' ? 1 : 6

    // One square forward
    const oneForward = { row: coords.row + direction, col: coords.col }
    if (isValidCoordinate(oneForward)) {
      const oneForwardSquare = coordinatesToSquare(oneForward)
      if (!this.getPieceAt(oneForwardSquare)) {
        moves.push(oneForwardSquare)

        // Two squares forward from starting position
        if (coords.row === startRow) {
          const twoForward = { row: coords.row + (2 * direction), col: coords.col }
          const twoForwardSquare = coordinatesToSquare(twoForward)
          if (!this.getPieceAt(twoForwardSquare)) {
            moves.push(twoForwardSquare)
          }
        }
      }
    }

    // Captures
    for (const colOffset of [-1, 1]) {
      const captureCoords = { row: coords.row + direction, col: coords.col + colOffset }
      if (isValidCoordinate(captureCoords)) {
        const captureSquare = coordinatesToSquare(captureCoords)
        const targetPiece = this.getPieceAt(captureSquare)
        
        // Normal capture
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push(captureSquare)
        }
        
        // En passant
        if (captureSquare === this.state.enPassantTarget) {
          moves.push(captureSquare)
        }
      }
    }

    return moves
  }

  // Knight moves
  private getKnightMoves(square: Square, piece: Piece): Square[] {
    const moves: Square[] = []
    const coords = squareToCoordinates(square)
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ]

    for (const [rowOffset, colOffset] of knightOffsets) {
      const newCoords = { row: coords.row + rowOffset, col: coords.col + colOffset }
      if (isValidCoordinate(newCoords)) {
        const newSquare = coordinatesToSquare(newCoords)
        const targetPiece = this.getPieceAt(newSquare)
        
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newSquare)
        }
      }
    }

    return moves
  }

  // Bishop moves
  private getBishopMoves(square: Square, piece: Piece): Square[] {
    const moves: Square[] = []
    const coords = squareToCoordinates(square)
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

    for (const [rowDir, colDir] of directions) {
      for (let i = 1; i < 8; i++) {
        const newCoords = { row: coords.row + (i * rowDir), col: coords.col + (i * colDir) }
        if (!isValidCoordinate(newCoords)) break

        const newSquare = coordinatesToSquare(newCoords)
        const targetPiece = this.getPieceAt(newSquare)

        if (!targetPiece) {
          moves.push(newSquare)
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(newSquare)
          }
          break
        }
      }
    }

    return moves
  }

  // Rook moves
  private getRookMoves(square: Square, piece: Piece): Square[] {
    const moves: Square[] = []
    const coords = squareToCoordinates(square)
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

    for (const [rowDir, colDir] of directions) {
      for (let i = 1; i < 8; i++) {
        const newCoords = { row: coords.row + (i * rowDir), col: coords.col + (i * colDir) }
        if (!isValidCoordinate(newCoords)) break

        const newSquare = coordinatesToSquare(newCoords)
        const targetPiece = this.getPieceAt(newSquare)

        if (!targetPiece) {
          moves.push(newSquare)
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(newSquare)
          }
          break
        }
      }
    }

    return moves
  }

  // Queen moves (combination of bishop and rook)
  private getQueenMoves(square: Square, piece: Piece): Square[] {
    return [...this.getBishopMoves(square, piece), ...this.getRookMoves(square, piece)]
  }

  // King moves
  private getKingMoves(square: Square, piece: Piece): Square[] {
    const moves: Square[] = []
    const coords = squareToCoordinates(square)
    
    // Regular moves
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) continue

        const newCoords = { row: coords.row + rowOffset, col: coords.col + colOffset }
        if (isValidCoordinate(newCoords)) {
          const newSquare = coordinatesToSquare(newCoords)
          const targetPiece = this.getPieceAt(newSquare)

          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(newSquare)
          }
        }
      }
    }

    // Castling
    if (!this.isSquareAttacked(square, piece.color)) {
      // Kingside castling
      if (this.state.castlingRights[piece.color].kingside) {
        const rookSquare = piece.color === 'white' ? 'h1' : 'h8'
        const betweenSquares = piece.color === 'white' ? ['f1', 'g1'] : ['f8', 'g8']
        
        if (this.canCastle(square, rookSquare, betweenSquares, piece.color)) {
          moves.push(betweenSquares[1] as Square)
        }
      }

      // Queenside castling
      if (this.state.castlingRights[piece.color].queenside) {
        const rookSquare = piece.color === 'white' ? 'a1' : 'a8'
        const betweenSquares = piece.color === 'white' ? ['d1', 'c1', 'b1'] : ['d8', 'c8', 'b8']
        const checkSquares = betweenSquares.slice(0, 2)
        
        if (this.canCastle(square, rookSquare, checkSquares, piece.color, betweenSquares[2])) {
          moves.push(betweenSquares[1] as Square)
        }
      }
    }

    return moves
  }

  // Check if castling is possible
  private canCastle(
    kingSquare: Square,
    rookSquare: Square,
    betweenSquares: string[],
    color: Color,
    extraEmptySquare?: string
  ): boolean {
    // Check if rook is in place
    const rook = this.getPieceAt(rookSquare)
    if (!rook || rook.type !== 'rook' || rook.color !== color) {
      return false
    }

    // Check if squares between king and rook are empty
    for (const square of betweenSquares) {
      if (this.getPieceAt(square as Square)) {
        return false
      }
    }

    // Check extra square for queenside castling
    if (extraEmptySquare && this.getPieceAt(extraEmptySquare as Square)) {
      return false
    }

    // Check if squares king passes through are not attacked
    for (const square of betweenSquares.slice(0, 2)) {
      if (this.isSquareAttacked(square as Square, color)) {
        return false
      }
    }

    return true
  }

  // Check if a square is attacked by the opposite color
  private isSquareAttacked(square: Square, byColor: Color): boolean {
    const attackingColor = getOppositeColor(byColor)
    const attackingPieces = this.getPiecesForColor(attackingColor)

    for (const { square: attackerSquare, piece: attacker } of attackingPieces) {
      const attackerMoves = this.getPseudoLegalMoves(attackerSquare, attacker)
      if (attackerMoves.includes(square)) {
        return true
      }
    }

    return false
  }

  // Check if a move would leave the king in check
  private wouldMoveLeaveKingInCheck(from: Square, to: Square, color: Color): boolean {
    // Make the move temporarily
    const originalPiece = this.state.position[from]
    const capturedPiece = this.state.position[to]
    
    this.state.position[to] = originalPiece
    this.state.position[from] = null

    // Find king position
    const kingSquare = this.findKing(color)
    const inCheck = kingSquare ? this.isSquareAttacked(kingSquare, color) : true

    // Restore position
    this.state.position[from] = originalPiece
    this.state.position[to] = capturedPiece

    return inCheck
  }

  // Make a move
  makeMove(from: Square, to: Square): Move | null {
    const piece = this.getPieceAt(from)
    if (!piece || piece.color !== this.state.turn) {
      return null
    }

    const legalMoves = this.getLegalMoves(from)
    if (!legalMoves.includes(to)) {
      return null
    }

    // Save current state to history
    this.stateHistory.push(this.cloneState(this.state))

    const capturedPiece = this.getPieceAt(to)
    const move: Move = {
      from,
      to,
      piece: piece.type,
      captured: capturedPiece?.type
    }

    // Update position
    this.state.position[to] = piece
    this.state.position[from] = null

    // Handle special moves
    this.handleSpecialMoves(move, piece, from, to)

    // Update game state
    this.updateGameState(move, capturedPiece)

    // Check for check, checkmate, or stalemate
    this.updateGameStatus()

    return move
  }

  // Handle special moves (castling, en passant, promotion)
  private handleSpecialMoves(move: Move, piece: Piece, from: Square, to: Square): void {
    // Castling
    if (piece.type === 'king') {
      const fromCol = squareToCoordinates(from).col
      const toCol = squareToCoordinates(to).col
      
      if (Math.abs(fromCol - toCol) === 2) {
        const isKingside = toCol > fromCol
        move.castling = isKingside ? 'kingside' : 'queenside'
        
        // Move the rook
        const row = piece.color === 'white' ? '1' : '8'
        const rookFrom = isKingside ? `h${row}` : `a${row}`
        const rookTo = isKingside ? `f${row}` : `d${row}`
        
        this.state.position[rookTo as Square] = this.state.position[rookFrom as Square]
        this.state.position[rookFrom as Square] = null
      }
      
      // Update castling rights
      this.state.castlingRights[piece.color].kingside = false
      this.state.castlingRights[piece.color].queenside = false
    }

    // Update castling rights for rook moves
    if (piece.type === 'rook') {
      if (from === 'a1' || from === 'a8') {
        this.state.castlingRights[piece.color].queenside = false
      } else if (from === 'h1' || from === 'h8') {
        this.state.castlingRights[piece.color].kingside = false
      }
    }

    // En passant
    if (piece.type === 'pawn' && to === this.state.enPassantTarget) {
      move.enPassant = true
      const capturedPawnRow = piece.color === 'white' ? '5' : '4'
      const capturedPawnSquare = `${to[0]}${capturedPawnRow}` as Square
      
      move.captured = 'pawn'
      this.state.position[capturedPawnSquare] = null
    }

    // Set en passant target for next move
    if (piece.type === 'pawn') {
      const fromRow = parseInt(from[1])
      const toRow = parseInt(to[1])
      
      if (Math.abs(fromRow - toRow) === 2) {
        const enPassantRow = piece.color === 'white' ? '3' : '6'
        this.state.enPassantTarget = `${from[0]}${enPassantRow}` as Square
      } else {
        this.state.enPassantTarget = null
      }
    } else {
      this.state.enPassantTarget = null
    }

    // Pawn promotion
    if (piece.type === 'pawn') {
      const promotionRow = piece.color === 'white' ? '8' : '1'
      if (to[1] === promotionRow) {
        move.promotion = 'queen' // Default to queen
        this.state.position[to] = { type: 'queen', color: piece.color }
      }
    }
  }

  // Update game state after a move
  private updateGameState(move: Move, capturedPiece: Piece | null): void {
    // Update move history
    this.state.moveHistory.push(move)

    // Update captured pieces
    if (capturedPiece) {
      this.state.capturedPieces[capturedPiece.color].push(capturedPiece.type)
    }

    // Update half-move clock
    if (move.piece === 'pawn' || capturedPiece) {
      this.state.halfMoveClock = 0
    } else {
      this.state.halfMoveClock++
    }

    // Update full move number
    if (this.state.turn === 'black') {
      this.state.fullMoveNumber++
    }

    // Switch turn
    this.state.turn = getOppositeColor(this.state.turn)
  }

  // Update game status (check, checkmate, stalemate)
  private updateGameStatus(): void {
    const kingSquare = this.findKing(this.state.turn)
    if (!kingSquare) return

    const isInCheck = this.isSquareAttacked(kingSquare, this.state.turn)
    const hasLegalMoves = this.hasAnyLegalMoves(this.state.turn)

    this.state.check = isInCheck
    this.state.checkmate = isInCheck && !hasLegalMoves
    this.state.stalemate = !isInCheck && !hasLegalMoves

    if (this.state.checkmate) {
      this.state.status = 'checkmate'
    } else if (this.state.stalemate) {
      this.state.status = 'stalemate'
    } else if (isInCheck) {
      this.state.status = 'check'
    } else {
      this.state.status = 'active'
    }

    // Check for draw by 50-move rule
    if (this.state.halfMoveClock >= 100) {
      this.state.status = 'draw'
    }
  }

  // Check if a player has any legal moves
  private hasAnyLegalMoves(color: Color): boolean {
    const pieces = this.getPiecesForColor(color)
    
    for (const { square } of pieces) {
      const legalMoves = this.getLegalMoves(square)
      if (legalMoves.length > 0) {
        return true
      }
    }
    
    return false
  }

  // Get FEN notation for current position
  getFEN(): string {
    // Implementation of FEN notation would go here
    // For now, return a placeholder
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  }

  // Clone the current state
  private cloneState(state: GameState): GameState {
    return {
      position: { ...state.position },
      turn: state.turn,
      castlingRights: {
        white: { ...state.castlingRights.white },
        black: { ...state.castlingRights.black }
      },
      enPassantTarget: state.enPassantTarget,
      halfMoveClock: state.halfMoveClock,
      fullMoveNumber: state.fullMoveNumber,
      moveHistory: [...state.moveHistory],
      capturedPieces: {
        white: [...state.capturedPieces.white],
        black: [...state.capturedPieces.black]
      },
      status: state.status,
      check: state.check,
      checkmate: state.checkmate,
      stalemate: state.stalemate
    }
  }

  // Undo the last move
  undoLastMove(): boolean {
    if (this.stateHistory.length === 0) {
      return false
    }

    this.state = this.stateHistory.pop()!
    return true
  }

  // Create a new engine instance with the same state
  clone(): ChessEngine {
    const newEngine = new ChessEngine()
    newEngine.state = this.cloneState(this.state)
    newEngine.stateHistory = this.stateHistory.map(state => this.cloneState(state))
    return newEngine
  }
}