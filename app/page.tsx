'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')

  const startGame = () => {
    localStorage.setItem('playerColor', playerColor)
    router.push('/game')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-tokyo-bg-highlight rounded-lg p-8 shadow-2xl border border-tokyo-fg-gutter animate-fade-in">
        <h1 className="text-4xl font-bold text-center mb-2 text-tokyo-blue">
          Chess404
        </h1>
        <p className="text-center text-tokyo-comment mb-8">
          Challenge the AI in a game of chess
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-tokyo-fg">Choose Your Color</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlayerColor('white')}
                className={`py-4 px-6 rounded-lg font-medium transition-all ${
                  playerColor === 'white'
                    ? 'bg-tokyo-blue text-tokyo-bg'
                    : 'bg-tokyo-bg-dark text-tokyo-fg-dark hover:bg-tokyo-dark3'
                }`}
              >
                <span className="text-2xl mr-2">♔</span>
                White
              </button>
              <button
                onClick={() => setPlayerColor('black')}
                className={`py-4 px-6 rounded-lg font-medium transition-all ${
                  playerColor === 'black'
                    ? 'bg-tokyo-blue text-tokyo-bg'
                    : 'bg-tokyo-bg-dark text-tokyo-fg-dark hover:bg-tokyo-dark3'
                }`}
              >
                <span className="text-2xl mr-2">♚</span>
                Black
              </button>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 px-6 bg-tokyo-green hover:bg-tokyo-green1 text-tokyo-bg font-semibold rounded-lg transition-colors"
          >
            Start Game
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-tokyo-fg-gutter">
          <p className="text-center text-tokyo-dark5 text-sm">
            Playing as {playerColor}. {playerColor === 'white' ? 'You move first.' : 'AI moves first.'}
          </p>
        </div>
      </div>
    </main>
  )
}