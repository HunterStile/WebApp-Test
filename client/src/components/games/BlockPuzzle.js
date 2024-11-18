import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, RotateCcw } from "lucide-react";

const WoodyBlockPuzzle = () => {
  // Game Configuration
  const BOARD_SIZE = 10;
  const BLOCK_SIZE = 60;
  const PIECE_POOL_COUNT = 4;

  // Predefined block shapes (same as before)
  const BLOCK_SHAPES = [
    [[1,1],[1,0],[1,0]],
    [[1,1,1],[0,0,1]],
    [[0,1],[0,1],[1,1]],
    [[1,0,0],[1,1,1]],
    [[1,1,1,1]],
    [[1],[1],[1],[1]],
    [[1,1],[1,1]],
    [[1,1,1],[0,1,0]],
    [[0,1,0],[1,1,1]],
    [[1,1]],
    [[1]]
  ];

  // State Management
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0))
  );
  const [currentPieces, setCurrentPieces] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Refs for tracking drag
  const boardRef = useRef(null);
  const pieceRefs = useRef([]);

// Completely revised drag handling
const handleMouseDown = (e, index) => {
  const piece = currentPieces[index];
  const pieceElement = pieceRefs.current[index];
  
  const startX = e.clientX - pieceElement.getBoundingClientRect().left;
  const startY = e.clientY - pieceElement.getBoundingClientRect().top;

  const dragHandler = (e) => {
    pieceElement.style.position = 'fixed';
    pieceElement.style.left = `${e.clientX - startX}px`;
    pieceElement.style.top = `${e.clientY - startY}px`;
    pieceElement.style.zIndex = '1000';
  };

  const dropHandler = (e) => {
    document.removeEventListener('mousemove', dragHandler);
    document.removeEventListener('mouseup', dropHandler);

    const boardRect = boardRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - boardRect.left) / BLOCK_SIZE);
    const y = Math.floor((e.clientY - boardRect.top) / BLOCK_SIZE);

    if (placePiece(piece, x, y)) {
      const newPieces = [...currentPieces];
      newPieces.splice(index, 1, generateRandomPiece());
      setCurrentPieces(newPieces);

      checkAndClearLines();
      
      if (checkGameOver()) {
        setIsGameOver(true);
      }
    }

    // Resetta lo stile dell'elemento
    pieceElement.style.position = 'static';
    pieceElement.style.zIndex = 'auto';
    pieceElement.style.left = 'auto';
    pieceElement.style.top = 'auto';
  };

  document.addEventListener('mousemove', dragHandler);
  document.addEventListener('mouseup', dropHandler);
};


  // Generate a random piece (same as before)
  const generateRandomPiece = useCallback(() => {
    const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    return {
      shape,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
  }, []);

  // Initialize game pieces (same as before)
  const initializePieces = useCallback(() => {
    const newPieces = Array(PIECE_POOL_COUNT)
      .fill()
      .map(() => generateRandomPiece());
    setCurrentPieces(newPieces);
  }, [generateRandomPiece]);

  // Check if a piece can be placed at a specific position (same as before)
  const canPlacePiece = useCallback((piece, startX, startY) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = startX + x;
          const boardY = startY + y;
          
          if (
            boardX < 0 || 
            boardX >= BOARD_SIZE || 
            boardY < 0 || 
            boardY >= BOARD_SIZE || 
            board[boardY][boardX]
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  // Place a piece on the board (same as before)
  const placePiece = useCallback((piece, startX, startY) => {
    // Controllo se il pezzo può essere posizionato
    if (!canPlacePiece(piece, startX, startY)) return false;
  
    const newBoard = board.map(row => [...row]);
    
    // Usa le coordinate corrette per mappare il pezzo sulla board
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          // Usa startX e startY per posizionare correttamente il pezzo
          newBoard[startY + y][startX + x] = piece.color;
        }
      }
    }
    
    setBoard(newBoard);
    return true;
  }, [board, canPlacePiece]);

  // Check for completed rows and columns (same as before)
  const checkAndClearLines = useCallback(() => {
    let newBoard = [...board];
    let linesCleared = 0;

    newBoard = newBoard.filter(row => !row.every(cell => cell));
    linesCleared += BOARD_SIZE - newBoard.length;

    while (newBoard.length < BOARD_SIZE) {
      newBoard.unshift(Array(BOARD_SIZE).fill(0));
    }

    for (let x = 0; x < BOARD_SIZE; x++) {
      if (newBoard.every(row => row[x])) {
        newBoard.forEach(row => { row[x] = 0; });
        linesCleared++;
      }
    }

    if (linesCleared > 0) {
      const newScore = score + (linesCleared * 10);
      setScore(newScore);
      setHighScore(Math.max(highScore, newScore));
    }

    setBoard(newBoard);
  }, [board, score, highScore]);

  // Check if game is over (same as before)
  const checkGameOver = useCallback(() => {
    return !currentPieces.some(piece => 
      board.some((row, y) => 
        row.some((cell, x) => 
          !cell && canPlacePiece(piece, x, y)
        )
      )
    );
  }, [board, currentPieces, canPlacePiece]);


  // Game initialization (same as before)
  const initializeGame = useCallback(() => {
    setBoard(Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0)));
    setScore(0);
    setIsGameOver(false);
    initializePieces();
  }, [initializePieces]);

  // Initialize game on first render
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div 
        className="relative flex bg-gray-800 rounded-lg shadow-2xl"
        style={{
          width: BOARD_SIZE * BLOCK_SIZE + 250,
          height: BOARD_SIZE * BLOCK_SIZE,
        }}
      >
        {/* Game Board */}
        <div 
          ref={boardRef}
          className="grid grid-cols-10 gap-0.5 bg-gray-700"
          style={{
            width: BOARD_SIZE * BLOCK_SIZE,
            height: BOARD_SIZE * BLOCK_SIZE,
          }}
        >
          {board.map((row, y) => 
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className="border border-gray-600"
                style={{
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  backgroundColor: cell || 'transparent'
                }}
              />
            ))
          )}
        </div>

        {/* Piece Pool - Uniform Block Size */}
        <div className="flex flex-col p-4 space-y-4">
          {currentPieces.map((piece, index) => (
            <div 
              key={index}
              ref={el => pieceRefs.current[index] = el}
              onMouseDown={(e) => handleMouseDown(e, index)}
              className="grid gap-0.5 cursor-move hover:opacity-70"
              style={{
                gridTemplateColumns: `repeat(${piece.shape[0].length}, ${BLOCK_SIZE}px)`,
              }}
            >
              {piece.shape.map((row, y) => 
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="border border-gray-600"
                    style={{
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      backgroundColor: cell ? piece.color : 'transparent'
                    }}
                  />
                ))
              )}
            </div>
          ))}
        </div>

        {/* Score and Game Over Screen (same as before) */}
        <div className="absolute top-4 left-4 text-white text-xl font-bold">
          <div className="flex items-center gap-2">
            <Trophy size={24} />
            <span>{score}</span>
          </div>
          <div className="text-sm opacity-75">Best: {highScore}</div>
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white p-8 rounded-lg">
              <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-4">Score: {score}</p>
              <button 
                className="flex items-center gap-2 mx-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={initializeGame}
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WoodyBlockPuzzle;