import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, RotateCcw } from "lucide-react";

const TetrisGame = () => {
  // ==================== GAME CONFIGURATION ====================
  const GAME_WIDTH = 10;
  const GAME_HEIGHT = 20;
  const BLOCK_SIZE = 30;
  const GAME_SPEED_MS = 500;

  // Tetromino shapes
  const TETROMINOS = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    O: [
      [1, 1],
      [1, 1]
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ]
  };

  const COLORS = [
    "#FF0D72", "#0DC2FF", "#0DFF72", 
    "#F538FF", "#FF8E0D", "#FFE138", "#3877FF"
  ];

  // ==================== GAME STATE ====================
  const [board, setBoard] = useState(
    Array(GAME_HEIGHT).fill().map(() => Array(GAME_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game loop references
  const gameLoopRef = useRef(null);

  // Get random tetromino
  const getRandomTetromino = () => {
    const keys = Object.keys(TETROMINOS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
      shape: TETROMINOS[randomKey],
      color: COLORS[keys.indexOf(randomKey)]
    };
  };

  // Initialize new piece
  const initializePiece = useCallback(() => {
    const newPiece = getRandomTetromino();
    setCurrentPiece(newPiece);
    setCurrentPosition({ x: Math.floor(GAME_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), y: 0 });

    // Check if new piece can be placed
    if (!isValidMove(newPiece.shape, { x: Math.floor(GAME_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), y: 0 })) {
      handleGameOver();
    }
  }, []);

  // Check if move is valid
  const isValidMove = useCallback((tetromino, position) => {
    for (let y = 0; y < tetromino.length; y++) {
      for (let x = 0; x < tetromino[y].length; x++) {
        if (tetromino[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;

          if (
            newX < 0 || 
            newX >= GAME_WIDTH || 
            newY >= GAME_HEIGHT || 
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  // Rotate tetromino
  const rotatePiece = useCallback(() => {
    if (!currentPiece) return;

    const rotated = currentPiece.shape[0].map((val, index) => 
      currentPiece.shape.map(row => row[index]).reverse()
    );

    if (isValidMove(rotated, currentPosition)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece, currentPosition, isValidMove]);

  // Move piece
  const movePiece = useCallback((dx, dy) => {
    const newPosition = { 
      x: currentPosition.x + dx, 
      y: currentPosition.y + dy 
    };

    if (isValidMove(currentPiece.shape, newPosition)) {
      setCurrentPosition(newPosition);
    } else if (dy > 0) {
      // Piece landed
      mergePieceToBoard();
      clearLines();
      initializePiece();
    }
  }, [currentPiece, currentPosition, isValidMove, initializePiece]);

  // Merge piece to board
  const mergePieceToBoard = useCallback(() => {
    const newBoard = [...board];
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          if (currentPosition.y + y >= 0) {
            newBoard[currentPosition.y + y][currentPosition.x + x] = currentPiece.color;
          }
        }
      }
    }
    setBoard(newBoard);
  }, [board, currentPiece, currentPosition]);

  // Clear completed lines
  const clearLines = useCallback(() => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const clearedLines = GAME_HEIGHT - newBoard.length;
    
    if (clearedLines > 0) {
      const emptyLines = Array(clearedLines).fill().map(() => Array(GAME_WIDTH).fill(0));
      const updatedBoard = [...emptyLines, ...newBoard];
      
      setBoard(updatedBoard);
      
      // Score calculation
      const points = [40, 100, 300, 1200];
      const newScore = score + points[clearedLines - 1] * 1;
      setScore(newScore);
      setHighScore(Math.max(highScore, newScore));
    }
  }, [board, score, highScore]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      if (gameStarted && !isGameOver) {
        movePiece(0, 1);
      }
    };

    if (gameStarted && !isGameOver) {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED_MS);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, isGameOver, movePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || isGameOver) return;

      switch(e.key) {
        case 'ArrowLeft': movePiece(-1, 0); break;
        case 'ArrowRight': movePiece(1, 0); break;
        case 'ArrowDown': movePiece(0, 1); break;
        case 'ArrowUp': rotatePiece(); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotatePiece, gameStarted, isGameOver]);

  // Handle game start/restart
  const handleClick = () => {
    if (!gameStarted || isGameOver) {
      setBoard(Array(GAME_HEIGHT).fill().map(() => Array(GAME_WIDTH).fill(0)));
      setScore(0);
      setIsGameOver(false);
      setGameStarted(true);
      initializePiece();
    }
  };

  // Game over handler
  const handleGameOver = () => {
    setIsGameOver(true);
    setGameStarted(false);
    clearInterval(gameLoopRef.current);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div 
        className="relative overflow-hidden bg-black rounded-lg shadow-2xl"
        style={{
          width: GAME_WIDTH * BLOCK_SIZE,
          height: GAME_HEIGHT * BLOCK_SIZE,
        }}
        onClick={handleClick}
      >
        {/* Game Board */}
        {board.map((row, y) => 
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="absolute border border-gray-800"
              style={{
                top: y * BLOCK_SIZE,
                left: x * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: cell || 'transparent'
              }}
            />
          ))
        )}

        {/* Current Piece */}
        {currentPiece && gameStarted && !isGameOver && (
          currentPiece.shape.map((row, y) => 
            row.map((cell, x) => cell ? (
              <div
                key={`piece-${x}-${y}`}
                className="absolute border border-gray-800"
                style={{
                  top: (currentPosition.y + y) * BLOCK_SIZE,
                  left: (currentPosition.x + x) * BLOCK_SIZE,
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  backgroundColor: currentPiece.color
                }}
              />
            ) : null)
          )
        )}

        {/* Score */}
        <div className="absolute top-4 left-4 text-white text-xl font-bold">
          <div className="flex items-center gap-2">
            <Trophy size={24} />
            <span>{score}</span>
          </div>
          <div className="text-sm opacity-75">Best: {highScore}</div>
        </div>

        {/* Start/Game Over Screen */}
        {(!gameStarted || isGameOver) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white p-8 rounded-lg">
              <h2 className="text-4xl font-bold mb-4">
                {isGameOver ? 'Game Over!' : 'Tetris'}
              </h2>
              <p className="text-xl mb-4">
                {isGameOver ? `Score: ${score}` : 'Click to start'}
              </p>
              {isGameOver && (
                <button 
                  className="flex items-center gap-2 mx-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={handleClick}
                >
                  <RotateCcw size={20} />
                  Play Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TetrisGame;