import { ChessEngine } from './chess-engine';
import { ChessAI } from './chess-ai';
import { GameConfig, GameState, Timer, Move, PieceColor, Position, Difficulty, GameMode, GameModes } from './types';

export class ChessGame {
  private engine: ChessEngine;
  private ai: ChessAI | null = null;
  private config: GameConfig | null = null;
  private gameState: GameState = 'setup';
  private timer: Timer = { white: 0, black: 0, active: null };
  private timerInterval: number | null = null;
  private selectedSquare: Position | null = null;
  private isThinking = false;

  private gameSetupElement: HTMLElement | null = null;
  private gameScreenElement: HTMLElement | null = null;
  private boardElement: HTMLElement | null = null;

  constructor() {
    this.engine = new ChessEngine();
    this.initializeUI();
  }

  private initializeUI() {
    const app = document.getElementById('app');
    if (!app) return;

    // Remove loading screen
    setTimeout(() => {
      const loading = document.querySelector('.loading');
      if (loading) loading.remove();
      
      this.showGameSetup();
    }, 800);
  }

  private showGameSetup() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="game-setup">
        <div class="setup-container">
          <h1 class="setup-title">Chess404</h1>
          <p class="setup-subtitle">Challenge the AI in an epic chess battle</p>
          
          <div class="setup-section">
            <h3 class="section-title">Game Mode</h3>
            <div class="mode-selector">
              ${Object.entries(GameModes).map(([mode, config]) => `
                <label class="mode-option" data-mode="${mode}">
                  <input type="radio" name="gameMode" value="${mode}" ${mode === 'rapid' ? 'checked' : ''}>
                  <div class="mode-details">
                    <div class="mode-name">${config.name}</div>
                    <div class="mode-description">${config.description}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div class="setup-section">
            <h3 class="section-title">AI Difficulty</h3>
            <div class="difficulty-selector">
              <div class="difficulty-option selected" data-difficulty="easy">Easy</div>
              <div class="difficulty-option" data-difficulty="medium">Medium</div>
              <div class="difficulty-option" data-difficulty="hard">Hard</div>
            </div>
          </div>
          
          <div class="setup-section">
            <h3 class="section-title">Color Selection</h3>
            <div class="color-selector">
              <div class="difficulty-option selected" data-color="white">White</div>
              <div class="difficulty-option" data-color="black">Black</div>
            </div>
          </div>
          
          <button id="start-game-btn" class="start-button">Start Game</button>
        </div>
      </div>
    `;

    this.bindSetupEvents();
  }

  private bindSetupEvents() {
    // Mode selection
    document.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const radio = target.querySelector('input[type="radio"]') as HTMLInputElement;
        radio.checked = true;
        
        document.querySelectorAll('.mode-option').forEach(opt => opt.classList.remove('selected'));
        target.classList.add('selected');
      });
    });

    // Difficulty selection
    document.querySelectorAll('.difficulty-option[data-difficulty]').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        document.querySelectorAll('.difficulty-option[data-difficulty]').forEach(opt => opt.classList.remove('selected'));
        target.classList.add('selected');
      });
    });

    // Color selection
    document.querySelectorAll('.difficulty-option[data-color]').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        document.querySelectorAll('.difficulty-option[data-color]').forEach(opt => opt.classList.remove('selected'));
        target.classList.add('selected');
      });
    });

    // Start game
    document.getElementById('start-game-btn')?.addEventListener('click', () => {
      this.startGame();
    });
  }


  private startGame() {
    // Get selected options
    const selectedMode = (document.querySelector('input[name="gameMode"]:checked') as HTMLInputElement)?.value as GameMode;
    const selectedDifficulty = document.querySelector('.difficulty-option[data-difficulty].selected')?.getAttribute('data-difficulty') as Difficulty;
    const playerColor = document.querySelector('.difficulty-option[data-color].selected')?.getAttribute('data-color') as PieceColor;

    if (!selectedMode || !selectedDifficulty || !playerColor) {
      alert('Please complete all setup options!');
      return;
    }

    this.config = {
      mode: selectedMode,
      difficulty: selectedDifficulty,
      playerColor,
      timeLimit: GameModes[selectedMode].timeLimit
    };

    // Initialize AI
    this.ai = new ChessAI(this.engine, selectedDifficulty, playerColor === 'white' ? 'black' : 'white');

    // Initialize timer
    if (this.config.timeLimit) {
      this.timer.white = this.config.timeLimit;
      this.timer.black = this.config.timeLimit;
    }

    this.gameState = 'playing';
    this.showGameScreen();
    
    // If AI plays white, make first move
    if (playerColor === 'black') {
      this.timer.active = 'white';
      this.startTimer();
      setTimeout(() => this.makeAIMove(), 1000);
    } else {
      this.timer.active = 'white';
      this.startTimer();
    }
  }

  private showGameScreen() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="game-screen">
        <header class="game-header">
          <div class="game-title">Chess404</div>
          <div class="game-info">
            <div class="timer" id="white-timer">
              <div class="timer-label">White</div>
              <div class="timer-value">--:--</div>
            </div>
            <div class="timer" id="black-timer">
              <div class="timer-label">Black</div>
              <div class="timer-value">--:--</div>
            </div>
          </div>
          <div class="game-controls">
            <button class="control-btn" id="new-game-btn">New Game</button>
            <button class="control-btn" id="flip-board-btn">Flip Board</button>
          </div>
        </header>
        
        <main class="game-main">
          <div class="game-sidebar">
            <div class="sidebar-section">
              <h3 class="sidebar-title">Game Status</h3>
              <div class="status-indicator">
                <div class="status-text" id="game-status">White to move</div>
              </div>
            </div>
            
            <div class="sidebar-section">
              <h3 class="sidebar-title">Captured Pieces</h3>
              <div style="margin-bottom: 1rem;">
                <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">Black pieces:</div>
                <div class="captured-pieces" id="captured-black"></div>
              </div>
              <div>
                <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">White pieces:</div>
                <div class="captured-pieces" id="captured-white"></div>
              </div>
            </div>
          </div>
          
          <div class="board-container">
            <div class="board-wrapper">
              <div class="chess-board" id="chess-board"></div>
              <div class="thinking-indicator" id="thinking-indicator" style="display: none;">
                AI is thinking...
              </div>
            </div>
          </div>
          
          <div class="game-sidebar">
            <div class="sidebar-section">
              <h3 class="sidebar-title">Move History</h3>
              <div class="move-history" id="move-history"></div>
            </div>
          </div>
        </main>
      </div>
    `;

    this.boardElement = document.getElementById('chess-board');
    this.bindGameEvents();
    this.renderBoard();
    this.updateTimer();
  }

  private bindGameEvents() {
    // Board clicks
    this.boardElement?.addEventListener('click', (e) => {
      const square = (e.target as HTMLElement).closest('.board-square') as HTMLElement;
      if (square) {
        this.handleSquareClick(square.getAttribute('data-position') as Position);
      }
    });

    // Control buttons
    document.getElementById('new-game-btn')?.addEventListener('click', () => {
      this.resetGame();
    });

    document.getElementById('flip-board-btn')?.addEventListener('click', () => {
      this.flipBoard();
    });
  }

  private renderBoard() {
    if (!this.boardElement) return;

    const board = this.engine.getBoard();
    this.boardElement.innerHTML = '';

    console.log('Rendering board:', board); // Debug log

    // Create squares from rank 8 to rank 1 (top to bottom visually)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        const position = this.indexToPosition(row, col);
        
        square.className = 'board-square';
        square.classList.add((row + col) % 2 === 0 ? 'square-light' : 'square-dark');
        square.setAttribute('data-position', position);
        
        // Add coordinates
        if (col === 0) {
          const rankLabel = document.createElement('div');
          rankLabel.className = 'coordinates coord-rank';
          rankLabel.textContent = (8 - row).toString();
          square.appendChild(rankLabel);
        }
        
        if (row === 7) {
          const fileLabel = document.createElement('div');
          fileLabel.className = 'coordinates coord-file';
          fileLabel.textContent = String.fromCharCode(97 + col);
          square.appendChild(fileLabel);
        }

        // Add piece if present
        const piece = board[row][col];
        if (piece) {
          const pieceElement = document.createElement('div');
          pieceElement.className = 'chess-piece';
          pieceElement.textContent = this.engine.getPieceSymbol(piece);
          console.log(`Piece at ${position}: ${piece.type} ${piece.color} = ${this.engine.getPieceSymbol(piece)}`); // Debug log
          square.appendChild(pieceElement);
        }

        this.boardElement.appendChild(square);
      }
    }

    this.updateGameStatus();
  }

  private indexToPosition(row: number, col: number): Position {
    return String.fromCharCode(97 + col) + (8 - row).toString();
  }

  private handleSquareClick(position: Position) {
    if (this.isThinking || this.gameState !== 'playing') return;
    if (!this.config || this.engine.getCurrentTurn() !== this.config.playerColor) return;

    const piece = this.engine.getPieceAt(position);

    if (this.selectedSquare) {
      if (this.selectedSquare === position) {
        // Deselect
        this.clearSelection();
      } else if (piece && piece.color === this.config.playerColor) {
        // Select different piece
        this.selectSquare(position);
      } else {
        // Try to make move
        this.makePlayerMove(this.selectedSquare, position);
      }
    } else if (piece && piece.color === this.config.playerColor) {
      // Select piece
      this.selectSquare(position);
    }
  }

  private selectSquare(position: Position) {
    this.clearSelection();
    this.selectedSquare = position;
    
    const piece = this.engine.getPieceAt(position);
    console.log(`Selected piece at ${position}:`, piece);
    
    const square = document.querySelector(`[data-position="${position}"]`);
    square?.classList.add('selected');
    
    // Highlight valid moves
    const validMoves = this.engine.getValidMoves(position);
    console.log(`Valid moves for ${piece?.type} at ${position}:`, validMoves);
    
    validMoves.forEach(move => {
      const moveSquare = document.querySelector(`[data-position="${move}"]`);
      const hasEnemyPiece = this.engine.getPieceAt(move) !== null;
      moveSquare?.classList.add(hasEnemyPiece ? 'valid-capture' : 'valid-move');
    });
  }

  private clearSelection() {
    // Remove selection highlighting
    document.querySelectorAll('.board-square').forEach(square => {
      square.classList.remove('selected', 'valid-move', 'valid-capture');
    });
    this.selectedSquare = null;
  }

  private async makePlayerMove(from: Position, to: Position) {
    const move = this.engine.makeMove(from, to);
    if (move) {
      this.clearSelection();
      this.renderBoard();
      this.updateMoveHistory();
      this.updateCapturedPieces();
      
      // Switch timer
      this.timer.active = this.engine.getCurrentTurn();
      
      // Check for game end
      if (this.engine.isCheckmate()) {
        this.endGame('win', 'Checkmate! You won!');
        return;
      } else if (this.engine.isStalemate()) {
        this.endGame('draw', 'Stalemate! It\'s a draw!');
        return;
      }
      
      // Make AI move after delay
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  private async makeAIMove() {
    if (!this.ai || this.gameState !== 'playing') return;
    
    this.isThinking = true;
    this.showThinking(true);
    
    const move = await this.ai.makeMove();
    
    this.showThinking(false);
    this.isThinking = false;
    
    if (move) {
      this.renderBoard();
      this.updateMoveHistory();
      this.updateCapturedPieces();
      
      // Switch timer
      this.timer.active = this.engine.getCurrentTurn();
      
      // Check for game end
      if (this.engine.isCheckmate()) {
        this.endGame('lose', 'Checkmate! AI won!');
      } else if (this.engine.isStalemate()) {
        this.endGame('draw', 'Stalemate! It\'s a draw!');
      }
    }
  }

  private showThinking(show: boolean) {
    const indicator = document.getElementById('thinking-indicator');
    if (indicator) {
      indicator.style.display = show ? 'block' : 'none';
    }
  }

  private updateGameStatus() {
    const statusElement = document.getElementById('game-status');
    if (!statusElement) return;

    const currentTurn = this.engine.getCurrentTurn();
    const isCheck = this.engine.isInCheck(currentTurn);
    
    let statusText = '';
    if (this.engine.isCheckmate()) {
      statusText = `Checkmate! ${currentTurn === 'white' ? 'Black' : 'White'} wins!`;
    } else if (this.engine.isStalemate()) {
      statusText = 'Stalemate! It\'s a draw!';
    } else if (isCheck) {
      statusText = `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)} in check!`;
    } else {
      statusText = `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)} to move`;
    }
    
    statusElement.textContent = statusText;

    // Highlight king in check
    document.querySelectorAll('.board-square').forEach(square => {
      square.classList.remove('in-check');
    });
    
    if (isCheck) {
      const board = this.engine.getBoard();
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.type === 'king' && piece.color === currentTurn) {
            const square = document.querySelector(`[data-position="${piece.position}"]`);
            square?.classList.add('in-check');
            break;
          }
        }
      }
    }
  }

  private updateMoveHistory() {
    const historyElement = document.getElementById('move-history');
    if (!historyElement) return;
    
    const moves = this.engine.getMoveHistory();
    const moveText = moves
      .map((move, index) => {
        const moveNumber = Math.floor(index / 2) + 1;
        const isWhite = index % 2 === 0;
        return isWhite ? `${moveNumber}. ${move.notation}` : move.notation;
      })
      .join(' ');
    
    historyElement.textContent = moveText || 'No moves yet';
    historyElement.scrollTop = historyElement.scrollHeight;
  }

  private updateCapturedPieces() {
    const moves = this.engine.getMoveHistory();
    const capturedWhite: string[] = [];
    const capturedBlack: string[] = [];
    
    moves.forEach(move => {
      if (move.capturedPiece) {
        const symbol = this.engine.getPieceSymbol(move.capturedPiece);
        if (move.capturedPiece.color === 'white') {
          capturedWhite.push(symbol);
        } else {
          capturedBlack.push(symbol);
        }
      }
    });
    
    const whiteElement = document.getElementById('captured-white');
    const blackElement = document.getElementById('captured-black');
    
    if (whiteElement) {
      whiteElement.innerHTML = capturedWhite.map(piece => 
        `<span class="captured-piece">${piece}</span>`
      ).join('');
    }
    
    if (blackElement) {
      blackElement.innerHTML = capturedBlack.map(piece => 
        `<span class="captured-piece">${piece}</span>`
      ).join('');
    }
  }

  private startTimer() {
    if (!this.config?.timeLimit) return;
    
    this.timerInterval = window.setInterval(() => {
      if (this.timer.active && this.gameState === 'playing') {
        this.timer[this.timer.active]--;
        
        if (this.timer[this.timer.active] <= 0) {
          this.endGame(this.timer.active === this.config?.playerColor ? 'lose' : 'win', 
                      `Time up! ${this.timer.active === this.config?.playerColor ? 'You lose!' : 'You win!'}`);
          return;
        }
        
        this.updateTimer();
      }
    }, 1000);
  }

  private updateTimer() {
    const whiteTimer = document.getElementById('white-timer');
    const blackTimer = document.getElementById('black-timer');
    
    if (whiteTimer && blackTimer) {
      const whiteTime = this.config?.timeLimit ? this.formatTime(this.timer.white) : '--:--';
      const blackTime = this.config?.timeLimit ? this.formatTime(this.timer.black) : '--:--';
      
      const whiteValue = whiteTimer.querySelector('.timer-value') as HTMLElement;
      const blackValue = blackTimer.querySelector('.timer-value') as HTMLElement;
      
      whiteValue.textContent = whiteTime;
      blackValue.textContent = blackTime;
      
      // Update active timer styling
      whiteTimer.classList.toggle('active', this.timer.active === 'white');
      blackTimer.classList.toggle('active', this.timer.active === 'black');
      
      // Add danger styling for low time
      whiteTimer.classList.toggle('danger', this.timer.white < 30);
      blackTimer.classList.toggle('danger', this.timer.black < 30);
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private endGame(result: 'win' | 'lose' | 'draw', message: string) {
    this.gameState = 'ended';
    this.timer.active = null;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Show game over modal
    const modal = document.createElement('div');
    modal.className = 'game-over-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="game-result ${result}">
          ${result === 'win' ? '🎉 Victory!' : result === 'lose' ? '😔 Defeat!' : '🤝 Draw!'}
        </div>
        <div class="result-details">${message}</div>
        <div class="modal-actions">
          <button class="modal-btn btn-primary" id="play-again-btn">Play Again</button>
          <button class="modal-btn btn-secondary" id="new-setup-btn">New Setup</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Bind modal events
    modal.querySelector('#play-again-btn')?.addEventListener('click', () => {
      modal.remove();
      this.resetGame();
    });
    
    modal.querySelector('#new-setup-btn')?.addEventListener('click', () => {
      modal.remove();
      this.showGameSetup();
    });
  }

  private resetGame() {
    this.engine.reset();
    this.gameState = 'playing';
    this.selectedSquare = null;
    this.isThinking = false;
    
    if (this.config?.timeLimit) {
      this.timer.white = this.config.timeLimit;
      this.timer.black = this.config.timeLimit;
    }
    
    // Reset AI
    if (this.ai && this.config) {
      this.ai = new ChessAI(this.engine, this.config.difficulty, 
                           this.config.playerColor === 'white' ? 'black' : 'white');
    }
    
    this.renderBoard();
    
    // Start game appropriately
    if (this.config?.playerColor === 'black') {
      this.timer.active = 'white';
      this.startTimer();
      setTimeout(() => this.makeAIMove(), 1000);
    } else {
      this.timer.active = 'white';
      this.startTimer();
    }
  }

  private flipBoard() {
    // Simple board flip by reversing the order
    if (!this.boardElement) return;
    
    const squares = Array.from(this.boardElement.children);
    squares.reverse().forEach(square => this.boardElement?.appendChild(square));
  }
}