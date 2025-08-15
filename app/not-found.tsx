import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-9xl font-bold text-tokyo-blue mb-4">404</h1>
        <p className="text-2xl text-tokyo-fg mb-2">Page Not Found</p>
        <p className="text-tokyo-comment mb-8">
          Looks like this page is in checkmate!
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-tokyo-blue hover:bg-tokyo-blue1 text-tokyo-bg font-medium rounded-lg transition-colors"
        >
          Return to Game
        </Link>
      </div>
    </main>
  )
}