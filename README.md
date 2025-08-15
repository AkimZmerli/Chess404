# Chess404

A modern chess game built with Next.js, TypeScript, and Tailwind CSS featuring a beautiful Tokyo Night theme.

## Features

- ✅ **Complete Chess Rules**: All standard chess rules implemented including:
  - Piece movements (pawn, knight, bishop, rook, queen, king)
  - Special moves (castling, en passant, pawn promotion)
  - Check, checkmate, and stalemate detection
  - 50-move rule for draws

- 🤖 **AI Opponent**: 
  - Minimax algorithm with alpha-beta pruning
  - Position evaluation with piece-square tables
  - 3-ply search depth for balanced difficulty

- 🎨 **Beautiful UI**:
  - Tokyo Night theme with dark mode aesthetic
  - Smooth animations and transitions
  - Responsive design for all devices
  - Visual indicators for legal moves and game status

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom Tokyo Night palette
- **Chess Logic**: Custom chess engine with full rule implementation
- **AI**: Minimax algorithm with position evaluation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
chess404/
├── app/              # Next.js app directory
├── components/       # React components
│   └── Board/       # Chess board components
├── lib/             # Core logic
│   ├── chess-engine.ts  # Chess rules and game logic
│   ├── ai.ts           # AI opponent logic
│   └── types.ts        # TypeScript definitions
└── public/          # Static assets
```

## Known Issues

- Stack overflow in certain move generation scenarios (being investigated)
- AI thinking time can vary based on position complexity

## Future Enhancements

- Multiple difficulty levels
- Move history with algebraic notation
- Game saving/loading
- Online multiplayer
- Opening book integration
- Puzzle mode

## Development

This project uses:
- ESLint for code linting
- TypeScript strict mode for type safety
- Tailwind CSS for styling

## License

MIT