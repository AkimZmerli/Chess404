import { Square as SquareType, Piece } from '@/lib/types'
import { getSquareColor } from '@/lib/utils'

interface SquareProps {
  square: SquareType
  piece: Piece | null
  isSelected: boolean
  isHighlighted: boolean
  isLastMoveFrom: boolean
  isLastMoveTo: boolean
  isCheck: boolean
  onClick: () => void
  children?: React.ReactNode
}

export default function Square({
  square,
  piece,
  isSelected,
  isHighlighted,
  isLastMoveFrom,
  isLastMoveTo,
  isCheck,
  onClick,
  children
}: SquareProps) {
  const isLight = getSquareColor(square) === 'light'
  
  return (
    <div
      className={`
        board-square
        ${isLight ? 'board-square-light' : 'board-square-dark'}
        ${isSelected ? 'square-selected' : ''}
        ${isLastMoveFrom || isLastMoveTo ? 'square-last-move' : ''}
        ${isCheck ? 'square-check' : ''}
        cursor-pointer
      `}
      onClick={onClick}
    >
      {children}
      {isHighlighted && !piece && (
        <div className="valid-move-dot" />
      )}
      {isHighlighted && piece && (
        <div className="valid-capture-ring" />
      )}
    </div>
  )
}