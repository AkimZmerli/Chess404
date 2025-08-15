'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Board from '@/components/Board/Board'
import { ChessEngine } from '@/lib/chess-engine'
import { ChessAI } from '@/lib/ai'
import { GameState, Move, Color } from '@/lib/types'

export default function GamePage() {
  const router = useRouter()
  const [engine] = useState(() => new ChessEngine())
  const [ai] = useState(() => new ChessAI(engine))
  const [gameState, setGameState] = useState<GameState>(engine.getCurrentState())
  const [playerColor, setPlayerColor] = useState<Color>('white')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [moveHistory, setMoveHistory] = useState<Move[]>([])

  // Initialize game
  useEffect(() => {
    const savedColor = localStorage.getItem('playerColor') as Color
    if (!savedColor) {
      router.push('/')
      return
    }
    setPlayerColor(savedColor)
  }, [router])

  // Update game state
  const updateGameState = useCallback(() => {
    const newState = engine.getCurrentState()
    setGameState(newState)
    setMoveHistory([...newState.moveHistory])
  }, [engine])

  // Make AI move
  const makeAIMove = useCallback(async () => {
    setIsAIThinking(true)
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const aiMove = ai.findBestMove(3) // Depth 3 for reasonable performance
    if (aiMove) {
      const move = engine.makeMove(aiMove.from, aiMove.to)
      if (move) {
        updateGameState()
      }
    }
    
    setIsAIThinking(false)
  }, [ai, engine, updateGameState])

  // Make AI first move if player is black
  useEffect(() => {
    if (playerColor === 'black' && moveHistory.length === 0) {
      setTimeout(() => makeAIMove(), 1000)
    }
  }, [playerColor, moveHistory.length, makeAIMove])

  // Handle player move
  const handlePlayerMove = useCallback((move: Move) => {
    updateGameState()
    
    // Check if game is over
    const state = engine.getCurrentState()
    if (state.checkmate || state.stalemate || state.status === 'draw') {
      return
    }
    
    // AI responds
    setTimeout(() => makeAIMove(), 500)
  }, [engine, updateGameState, makeAIMove])

  // New game
  const handleNewGame = () => {
    router.push('/')
  }

  // Get game status message
  const getStatusMessage = () => {
    if (gameState.checkmate) {
      const winner = gameState.turn === 'white' ? 'Black' : 'White'
      return `Checkmate! ${winner} wins!`
    }
    if (gameState.stalemate) {
      return 'Stalemate! It\'s a draw!'
    }
    if (gameState.status === 'draw') {
      return 'Draw by 50-move rule!'
    }
    if (gameState.check) {
      return 'Check!'
    }
    if (isAIThinking) {
      return 'AI is thinking...'
    }
    return gameState.turn === playerColor ? 'Your turn' : 'AI\'s turn'
  }

  return (
    <div className="min-h-screen bg-tokyo-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-tokyo-bg-highlight rounded-lg p-6 mb-6 shadow-xl border border-tokyo-fg-gutter">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-tokyo-blue">Chess404</h1>
            <button
              onClick={handleNewGame}
              className="px-6 py-2 bg-tokyo-blue hover:bg-tokyo-blue1 text-tokyo-bg font-medium rounded-lg transition-colors"
            >
              New Game
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Board */}
          <div className="lg:col-span-2">
            <Board
              gameEngine={engine}
              onMove={handlePlayerMove}
              playerColor={playerColor}
              disabled={isAIThinking || gameState.checkmate || gameState.stalemate}
            />
          </div>

          {/* Game Info */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-tokyo-bg-highlight rounded-lg p-4 shadow-xl border border-tokyo-fg-gutter">
              <h3 className="font-semibold text-tokyo-fg mb-2">Status</h3>
              <p className={`text-lg ${gameState.checkmate ? 'text-tokyo-red' : gameState.check ? 'text-tokyo-orange' : 'text-tokyo-green'}`}>
                {getStatusMessage()}
              </p>
              <div className="mt-2 text-sm text-tokyo-comment">
                <p>Turn: {gameState.turn}</p>
                <p>Move: {gameState.fullMoveNumber}</p>
              </div>
            </div>

            {/* Captured Pieces */}
            <div className="bg-tokyo-bg-highlight rounded-lg p-4 shadow-xl border border-tokyo-fg-gutter">
              <h3 className="font-semibold text-tokyo-fg mb-2">Captured Pieces</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-tokyo-comment text-sm">By White:</span>
                  <div className="text-2xl">
                    {gameState.capturedPieces.black.map((piece, i) => (
                      <span key={i} className="text-tokyo-bg-dark">
                        {piece === 'pawn' && '♟'}
                        {piece === 'knight' && '♞'}
                        {piece === 'bishop' && '♝'}
                        {piece === 'rook' && '♜'}
                        {piece === 'queen' && '♛'}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-tokyo-comment text-sm">By Black:</span>
                  <div className="text-2xl">
                    {gameState.capturedPieces.white.map((piece, i) => (
                      <span key={i} className="text-tokyo-fg">
                        {piece === 'pawn' && '♙'}
                        {piece === 'knight' && '♘'}
                        {piece === 'bishop' && '♗'}
                        {piece === 'rook' && '♖'}
                        {piece === 'queen' && '♕'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-tokyo-bg-highlight rounded-lg p-4 shadow-xl border border-tokyo-fg-gutter">
              <h3 className="font-semibold text-tokyo-fg mb-2">Move History</h3>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-1 text-sm font-mono">
                  {moveHistory.map((move, index) => (
                    <div key={index} className="flex">
                      <span className="text-tokyo-comment w-12">
                        {Math.floor(index / 2) + 1}.
                      </span>
                      <span className="text-tokyo-fg">
                        {move.from}-{move.to}
                        {move.captured && ' x'}
                        {move.check && '+'}
                        {move.checkmate && '#'}
                      </span>
                    </div>
                  ))}
                  {moveHistory.length === 0 && (
                    <p className="text-tokyo-comment">No moves yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}