import { Square, Coordinates, Color } from './types'

// Convert square notation (e.g., 'e4') to coordinates
export function squareToCoordinates(square: Square): Coordinates {
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const row = parseInt(square[1]) - 1
  return { row, col }
}

// Convert coordinates to square notation
export function coordinatesToSquare(coords: Coordinates): Square {
  const col = String.fromCharCode('a'.charCodeAt(0) + coords.col)
  const row = (coords.row + 1).toString()
  return `${col}${row}` as Square
}

// Check if coordinates are within board bounds
export function isValidCoordinate(coords: Coordinates): boolean {
  return coords.row >= 0 && coords.row < 8 && coords.col >= 0 && coords.col < 8
}

// Get all squares on the board
export function getAllSquares(): Square[] {
  const squares: Square[] = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      squares.push(coordinatesToSquare({ row, col }))
    }
  }
  return squares
}

// Get color of a chess board square (for UI)
export function getSquareColor(square: Square): 'light' | 'dark' {
  const { row, col } = squareToCoordinates(square)
  return (row + col) % 2 === 0 ? 'light' : 'dark'
}

// Get opposite color
export function getOppositeColor(color: Color): Color {
  return color === 'white' ? 'black' : 'white'
}

// Calculate distance between two squares
export function getSquareDistance(from: Square, to: Square): number {
  const fromCoords = squareToCoordinates(from)
  const toCoords = squareToCoordinates(to)
  
  const rowDiff = Math.abs(fromCoords.row - toCoords.row)
  const colDiff = Math.abs(fromCoords.col - toCoords.col)
  
  return Math.max(rowDiff, colDiff)
}

// Check if two squares are on the same diagonal
export function areSquaresOnSameDiagonal(from: Square, to: Square): boolean {
  const fromCoords = squareToCoordinates(from)
  const toCoords = squareToCoordinates(to)
  
  const rowDiff = Math.abs(fromCoords.row - toCoords.row)
  const colDiff = Math.abs(fromCoords.col - toCoords.col)
  
  return rowDiff === colDiff && rowDiff > 0
}

// Check if two squares are on the same rank (row)
export function areSquaresOnSameRank(from: Square, to: Square): boolean {
  return from[1] === to[1] && from !== to
}

// Check if two squares are on the same file (column)
export function areSquaresOnSameFile(from: Square, to: Square): boolean {
  return from[0] === to[0] && from !== to
}

// Get all squares between two squares (exclusive)
export function getSquaresBetween(from: Square, to: Square): Square[] {
  const squares: Square[] = []
  const fromCoords = squareToCoordinates(from)
  const toCoords = squareToCoordinates(to)
  
  const rowDiff = toCoords.row - fromCoords.row
  const colDiff = toCoords.col - fromCoords.col
  
  // Not on same rank, file, or diagonal
  if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
    return squares
  }
  
  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff)
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff)
  
  let currentRow = fromCoords.row + rowStep
  let currentCol = fromCoords.col + colStep
  
  while (currentRow !== toCoords.row || currentCol !== toCoords.col) {
    squares.push(coordinatesToSquare({ row: currentRow, col: currentCol }))
    currentRow += rowStep
    currentCol += colStep
  }
  
  return squares
}