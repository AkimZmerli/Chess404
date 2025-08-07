import { Piece, PieceType, PieceColor, Position, Move, PieceSymbols } from './types';

export class ChessEngine {
  private board: (Piece | null)[][] = [];
  private moveHistory: Move[] = [];
  private currentTurn: PieceColor = 'white';
  private enPassantTarget: Position | null = null;
  private castlingRights = {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  };

  constructor() {
    this.initializeBoard();
  }

  private initializeBoard() {
    // Initialize empty 8x8 board
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set up starting positions
    const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    // White pieces (bottom rows)
    for (let col = 0; col < 8; col++) {
      this.board[7][col] = this.createPiece(backRank[col], 'white', this.indexToPosition(7, col));
      this.board[6][col] = this.createPiece('pawn', 'white', this.indexToPosition(6, col));
    }
    
    // Black pieces (top rows)
    for (let col = 0; col < 8; col++) {
      this.board[0][col] = this.createPiece(backRank[col], 'black', this.indexToPosition(0, col));
      this.board[1][col] = this.createPiece('pawn', 'black', this.indexToPosition(1, col));
    }
  }

  private createPiece(type: PieceType, color: PieceColor, position: Position): Piece {
    return { type, color, position, hasMoved: false };
  }

  private indexToPosition(row: number, col: number): Position {
    return String.fromCharCode(97 + col) + (8 - row).toString();
  }

  private positionToIndex(position: Position): [number, number] {
    const col = position.charCodeAt(0) - 97;
    const row = 8 - parseInt(position[1]);
    return [row, col];
  }

  public getBoard(): (Piece | null)[][] {
    return this.board.map(row => [...row]);
  }

  public getPieceAt(position: Position): Piece | null {
    const [row, col] = this.positionToIndex(position);
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  public getCurrentTurn(): PieceColor {
    return this.currentTurn;
  }

  public getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  public getValidMoves(position: Position): Position[] {
    const piece = this.getPieceAt(position);
    if (!piece || piece.color !== this.currentTurn) return [];

    const moves = this.generatePieceMoves(piece);
    return moves.filter(move => this.isLegalMove(position, move));
  }

  private generatePieceMoves(piece: Piece): Position[] {
    const [row, col] = this.positionToIndex(piece.position);
    
    switch (piece.type) {
      case 'pawn':
        return this.generatePawnMoves(piece, row, col);
      case 'rook':
        return this.generateRookMoves(row, col, piece.color);
      case 'bishop':
        return this.generateBishopMoves(row, col, piece.color);
      case 'queen':
        return [...this.generateRookMoves(row, col, piece.color), 
                ...this.generateBishopMoves(row, col, piece.color)];
      case 'knight':
        return this.generateKnightMoves(row, col, piece.color);
      case 'king':
        return this.generateKingMoves(row, col, piece.color);
      default:
        return [];
    }
  }

  private generatePawnMoves(piece: Piece, row: number, col: number): Position[] {
    const moves: Position[] = [];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;

    // Forward move
    const newRow = row + direction;
    if (this.isValidPosition(newRow, col) && !this.board[newRow][col]) {
      moves.push(this.indexToPosition(newRow, col));
      
      // Double move from starting position
      if (row === startRow && !this.board[newRow + direction][col]) {
        moves.push(this.indexToPosition(newRow + direction, col));
      }
    }

    // Captures
    for (const deltaCol of [-1, 1]) {
      const captureCol = col + deltaCol;
      if (this.isValidPosition(newRow, captureCol)) {
        const target = this.board[newRow][captureCol];
        if (target && target.color !== piece.color) {
          moves.push(this.indexToPosition(newRow, captureCol));
        }
        
        // En passant
        const enPassantPos = this.indexToPosition(newRow, captureCol);
        if (this.enPassantTarget === enPassantPos) {
          moves.push(enPassantPos);
        }
      }
    }

    return moves;
  }

  private generateRookMoves(row: number, col: number, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dRow, dCol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dRow * i;
        const newCol = col + dCol * i;
        
        if (!this.isValidPosition(newRow, newCol)) break;
        
        const piece = this.board[newRow][newCol];
        if (!piece) {
          moves.push(this.indexToPosition(newRow, newCol));
        } else {
          if (piece.color !== color) {
            moves.push(this.indexToPosition(newRow, newCol));
          }
          break;
        }
      }
    }

    return moves;
  }

  private generateBishopMoves(row: number, col: number, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dRow, dCol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dRow * i;
        const newCol = col + dCol * i;
        
        if (!this.isValidPosition(newRow, newCol)) break;
        
        const piece = this.board[newRow][newCol];
        if (!piece) {
          moves.push(this.indexToPosition(newRow, newCol));
        } else {
          if (piece.color !== color) {
            moves.push(this.indexToPosition(newRow, newCol));
          }
          break;
        }
      }
    }

    return moves;
  }

  private generateKnightMoves(row: number, col: number, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dRow, dCol] of knightMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidPosition(newRow, newCol)) {
        const piece = this.board[newRow][newCol];
        if (!piece || piece.color !== color) {
          moves.push(this.indexToPosition(newRow, newCol));
        }
      }
    }

    return moves;
  }

  private generateKingMoves(row: number, col: number, color: PieceColor): Position[] {
    const moves: Position[] = [];
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dRow, dCol] of kingMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidPosition(newRow, newCol)) {
        const piece = this.board[newRow][newCol];
        if (!piece || piece.color !== color) {
          moves.push(this.indexToPosition(newRow, newCol));
        }
      }
    }

    // Castling
    if (!this.isInCheck(color)) {
      const kingRow = color === 'white' ? 7 : 0;
      
      // King side castling
      if (this.castlingRights[color].kingSide &&
          !this.board[kingRow][5] && !this.board[kingRow][6] &&
          !this.isSquareAttacked(this.indexToPosition(kingRow, 5), color) &&
          !this.isSquareAttacked(this.indexToPosition(kingRow, 6), color)) {
        moves.push(this.indexToPosition(kingRow, 6));
      }
      
      // Queen side castling
      if (this.castlingRights[color].queenSide &&
          !this.board[kingRow][1] && !this.board[kingRow][2] && !this.board[kingRow][3] &&
          !this.isSquareAttacked(this.indexToPosition(kingRow, 2), color) &&
          !this.isSquareAttacked(this.indexToPosition(kingRow, 3), color)) {
        moves.push(this.indexToPosition(kingRow, 2));
      }
    }

    return moves;
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  private isLegalMove(from: Position, to: Position): boolean {
    // Make a temporary move to check if it leaves king in check
    const piece = this.getPieceAt(from);
    const capturedPiece = this.getPieceAt(to);
    
    if (!piece) return false;
    
    // Temporarily make the move
    const [fromRow, fromCol] = this.positionToIndex(from);
    const [toRow, toCol] = this.positionToIndex(to);
    
    this.board[fromRow][fromCol] = null;
    this.board[toRow][toCol] = { ...piece, position: to };
    
    const isLegal = !this.isInCheck(piece.color);
    
    // Restore the board
    this.board[fromRow][fromCol] = piece;
    this.board[toRow][toCol] = capturedPiece;
    
    return isLegal;
  }

  public makeMove(from: Position, to: Position): Move | null {
    const piece = this.getPieceAt(from);
    if (!piece || piece.color !== this.currentTurn) return null;
    
    const validMoves = this.getValidMoves(from);
    if (!validMoves.includes(to)) return null;
    
    const capturedPiece = this.getPieceAt(to);
    const [fromRow, fromCol] = this.positionToIndex(from);
    const [toRow, toCol] = this.positionToIndex(to);
    
    // Handle special moves
    let isCastling = false;
    let isEnPassant = false;
    
    // Castling
    if (piece.type === 'king' && Math.abs(fromCol - toCol) === 2) {
      isCastling = true;
      const rookFromCol = toCol > fromCol ? 7 : 0;
      const rookToCol = toCol > fromCol ? 5 : 3;
      
      const rook = this.board[fromRow][rookFromCol];
      if (rook) {
        this.board[fromRow][rookToCol] = { ...rook, position: this.indexToPosition(fromRow, rookToCol), hasMoved: true };
        this.board[fromRow][rookFromCol] = null;
      }
      
      // Update castling rights
      this.castlingRights[piece.color].kingSide = false;
      this.castlingRights[piece.color].queenSide = false;
    }
    
    // En passant
    if (piece.type === 'pawn' && to === this.enPassantTarget) {
      isEnPassant = true;
      const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      this.board[capturedPawnRow][toCol] = null;
    }
    
    // Make the move
    this.board[toRow][toCol] = { ...piece, position: to, hasMoved: true };
    this.board[fromRow][fromCol] = null;
    
    // Update en passant target
    this.enPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(fromRow - toRow) === 2) {
      this.enPassantTarget = this.indexToPosition((fromRow + toRow) / 2, fromCol);
    }
    
    // Update castling rights
    if (piece.type === 'rook') {
      if (from === 'a1' || from === 'a8') this.castlingRights[piece.color].queenSide = false;
      if (from === 'h1' || from === 'h8') this.castlingRights[piece.color].kingSide = false;
    }
    
    // Create move object
    const move: Move = {
      from,
      to,
      piece: { ...piece },
      capturedPiece,
      isCheck: this.isInCheck(this.getOpponentColor(piece.color)),
      isCheckmate: false, // Will be updated after move
      isCastling,
      isEnPassant,
      notation: this.getMoveNotation(piece, from, to, capturedPiece, isCastling),
      timestamp: Date.now()
    };
    
    // Check for checkmate/stalemate
    this.currentTurn = this.getOpponentColor(this.currentTurn);
    move.isCheckmate = this.isCheckmate();
    
    this.moveHistory.push(move);
    
    return move;
  }

  private getOpponentColor(color: PieceColor): PieceColor {
    return color === 'white' ? 'black' : 'white';
  }

  private getMoveNotation(piece: Piece, from: Position, to: Position, capturedPiece?: Piece | null, isCastling?: boolean): string {
    if (isCastling) {
      return to[0] > from[0] ? 'O-O' : 'O-O-O';
    }
    
    const pieceNotation = piece.type === 'pawn' ? '' : piece.type.charAt(0).toUpperCase();
    const capture = capturedPiece ? 'x' : '';
    
    if (piece.type === 'pawn' && capturedPiece) {
      return `${from[0]}x${to}`;
    }
    
    return `${pieceNotation}${capture}${to}`;
  }

  public isInCheck(color: PieceColor): boolean {
    // Find the king
    let kingPosition: Position | null = null;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          kingPosition = piece.position;
          break;
        }
      }
      if (kingPosition) break;
    }
    
    return kingPosition ? this.isSquareAttacked(kingPosition, color) : false;
  }

  private isSquareAttacked(position: Position, byColor: PieceColor): boolean {
    const opponentColor = this.getOpponentColor(byColor);
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === opponentColor) {
          const moves = this.generatePieceMoves(piece);
          if (moves.includes(position)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  public isCheckmate(): boolean {
    if (!this.isInCheck(this.currentTurn)) return false;
    
    // Check if any move can get out of check
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.currentTurn) {
          const validMoves = this.getValidMoves(piece.position);
          if (validMoves.length > 0) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  public isStalemate(): boolean {
    if (this.isInCheck(this.currentTurn)) return false;
    
    // Check if any legal move exists
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.currentTurn) {
          const validMoves = this.getValidMoves(piece.position);
          if (validMoves.length > 0) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  public getPieceSymbol(piece: Piece): string {
    return PieceSymbols[piece.color][piece.type];
  }

  public reset() {
    this.board = [];
    this.moveHistory = [];
    this.currentTurn = 'white';
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true }
    };
    this.initializeBoard();
  }
}