'use client'

import { useState, useEffect } from 'react'
import { Square as SquareType, GameState, Move } from '@/lib/types'
import { ChessEngine } from '@/lib/chess-engine'
import { getAllSquares } from '@/lib/utils'
import Square from './Square'
import Piece from './Piece'

interface BoardProps {
  gameEngine: ChessEngine
  onMove: (move: Move) => void
  playerColor: 'white' | 'black'
  disabled?: boolean
}

export default function Board({ gameEngine, onMove, playerColor, disabled = false }: BoardProps) {
  const [gameState, setGameState] = useState<GameState>(gameEngine.getCurrentState())
  const [selectedSquare, setSelectedSquare] = useState<SquareType | null>(null)
  const [legalMoves, setLegalMoves] = useState<SquareType[]>([])
  const [lastMove, setLastMove] = useState<Move | null>(null)

  // Update game state when engine state changes
  const updateGameState = () => {
    setGameState(gameEngine.getCurrentState())
  }

  const handleSquareClick = (square: SquareType) => {
    if (disabled || gameState.turn !== playerColor) return

    const piece = gameEngine.getPieceAt(square)

    // If a square is already selected
    if (selectedSquare) {
      // If clicking the same square, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      // If clicking a legal move square, make the move
      if (legalMoves.includes(square)) {
        const move = gameEngine.makeMove(selectedSquare, square)
        if (move) {
          setLastMove(move)
          onMove(move)
          updateGameState()
        }
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      // If clicking another piece of the same color, select it
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square)
        setLegalMoves(gameEngine.getLegalMoves(square))
        return
      }

      // Otherwise, deselect
      setSelectedSquare(null)
      setLegalMoves([])
    } else {
      // If no square is selected, select this one if it has a piece of the player's color
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square)
        setLegalMoves(gameEngine.getLegalMoves(square))
      }
    }
  }

  // Get the squares in render order (flipped if player is black)
  const getRenderSquares = () => {
    const squares = getAllSquares()
    const rows: SquareType[][] = []
    
    // Group squares by rank
    for (let rank = 8; rank >= 1; rank--) {
      const row: SquareType[] = []
      for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        row.push(`${file}${rank}` as SquareType)
      }
      rows.push(row)
    }

    // Flip the board if player is black
    if (playerColor === 'black') {
      rows.reverse()
      rows.forEach(row => row.reverse())
    }

    return rows.flat()
  }

  const renderSquares = getRenderSquares()

  // Find king square if in check
  const kingInCheck = gameState.check && gameState.turn === playerColor
  const kingSquare = kingInCheck ? renderSquares.find(square => {
    const piece = gameEngine.getPieceAt(square)
    return piece?.type === 'king' && piece.color === playerColor
  }) : null

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-square bg-tokyo-bg-highlight rounded-lg shadow-2xl p-4">
        <div className="grid grid-cols-8 gap-0 w-full h-full rounded overflow-hidden border-2 border-tokyo-fg-gutter">
          {renderSquares.map((square) => {
            const piece = gameEngine.getPieceAt(square)
            const isSelected = selectedSquare === square
            const isHighlighted = legalMoves.includes(square)
            const isLastMoveFrom = lastMove?.from === square
            const isLastMoveTo = lastMove?.to === square
            const isCheck = kingSquare === square

            return (
              <Square
                key={square}
                square={square}
                piece={piece}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isLastMoveFrom={isLastMoveFrom}
                isLastMoveTo={isLastMoveTo}
                isCheck={isCheck}
                onClick={() => handleSquareClick(square)}
              >
                {piece && <Piece piece={piece} />}
              </Square>
            )
          })}
        </div>
        
        {/* Rank labels */}
        <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between px-1">
          {(playerColor === 'white' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]).map(rank => (
            <div key={rank} className="text-tokyo-comment text-xs flex items-center h-[12.5%]">
              {rank}
            </div>
          ))}
        </div>
        
        {/* File labels */}
        <div className="absolute left-4 right-4 bottom-0 flex justify-between py-1">
          {(playerColor === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']).map(file => (
            <div key={file} className="text-tokyo-comment text-xs flex justify-center w-[12.5%]">
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}