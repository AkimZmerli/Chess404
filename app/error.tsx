'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center animate-fade-in max-w-md">
        <h1 className="text-4xl font-bold text-tokyo-red mb-4">Something went wrong!</h1>
        <p className="text-tokyo-comment mb-8">
          An unexpected error occurred. The game might be in an illegal position.
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-tokyo-blue hover:bg-tokyo-blue1 text-tokyo-bg font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  )
}