import './style.css'
import { ChessGame } from './chess-game'

// Initialize the chess game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChessGame();
});

// Add some console messaging for developers
console.log(`
  ♔ Chess404 - AI Chess Game ♔
  
  Welcome to Chess404! This is a modern chess game with:
  • AI opponent with 3 difficulty levels
  • Bullet, Rapid, and Timeless game modes  
  • Coin flip for color selection
  • Full chess rule implementation
  • Beautiful modern UI with glassmorphism effects
  
  Built with TypeScript, Vite, and lots of ♥
  
  Game controls:
  - Click pieces to select them
  - Click highlighted squares to move
  - Use header buttons for game controls
  
  Have fun playing! 🎮
`);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'n':
    case 'N':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) newGameBtn.click();
      }
      break;
    case 'f':
    case 'F':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const flipBtn = document.getElementById('flip-board-btn');
        if (flipBtn) flipBtn.click();
      }
      break;
    case 'Escape':
      // Clear any selections
      document.querySelectorAll('.board-square.selected').forEach(square => {
        square.classList.remove('selected');
      });
      document.querySelectorAll('.board-square.valid-move, .board-square.valid-capture').forEach(square => {
        square.classList.remove('valid-move', 'valid-capture');
      });
      break;
  }
});

// Add some useful global functions for debugging
(window as any).chess404 = {
  version: '1.0.0',
  author: 'AI Enhanced Development',
  description: 'A sophisticated chess game with AI opponent'
};