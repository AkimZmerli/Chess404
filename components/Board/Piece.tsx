import { Piece as PieceType, PIECE_UNICODE } from '@/lib/types'

interface PieceProps {
  piece: PieceType
  isDragging?: boolean
}

export default function Piece({ piece, isDragging = false }: PieceProps) {
  const symbol = PIECE_UNICODE[piece.color][piece.type]
  
  return (
    <div
      className={`
        piece
        ${piece.color === 'white' ? 'piece-white' : 'piece-black'}
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      {symbol}
    </div>
  )
}