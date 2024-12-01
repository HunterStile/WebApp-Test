import React, { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw } from "lucide-react";

const BrickBreaker = () => {
  // Game Configuration
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const GAME_TICK = 16; // ~60 FPS

  // Paddle Configuration
  const PADDLE_WIDTH = 120;
  const PADDLE_HEIGHT = 15;
  const PADDLE_SPEED = 10;

  // Ball Configuration
  const BALL_SIZE = 15;
  const BALL_SPEED = 5;

  // Brick Configuration
  const BRICK_ROWS = 5;
  const BRICK_COLUMNS = 10;
  const BRICK_WIDTH = 70;
  const BRICK_HEIGHT = 25;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 50;
  const BRICK_OFFSET_LEFT = 30;

  // Game State
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ballX, setBallX] = useState(GAME_WIDTH / 2);
  const [ballY, setBallY] = useState(GAME_HEIGHT - 100);
  const [ballVelocityX, setBallVelocityX] = useState(BALL_SPEED);
  const [ballVelocityY, setBallVelocityY] = useState(-BALL_SPEED);
  const [bricks, setBricks] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameContainerRef = useRef(null);

  // Initialize bricks
  useEffect(() => {
    const initialBricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLUMNS; col++) {
        initialBricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          visible: true
        });
      }
    }
    setBricks(initialBricks);
  }, []);

  // Game logic
  useEffect(() => {
    let gameInterval;
    
    const handleMouseMove = (e) => {
      if (gameStarted && !isGameOver && gameContainerRef.current) {
        const containerRect = gameContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        
        // Adjust paddle position based on mouse, keeping it within game bounds
        const newPaddleX = Math.max(
          0, 
          Math.min(
            mouseX - PADDLE_WIDTH / 2, 
            GAME_WIDTH - PADDLE_WIDTH
          )
        );
        
        setPaddleX(newPaddleX);
      }
    };

    const handleKeyDown = (e) => {
      if (gameStarted && !isGameOver) {
        if (e.key === 'ArrowLeft' && paddleX > 0) {
          setPaddleX(prev => Math.max(0, prev - PADDLE_SPEED));
        }
        if (e.key === 'ArrowRight' && paddleX < GAME_WIDTH - PADDLE_WIDTH) {
          setPaddleX(prev => Math.min(GAME_WIDTH - PADDLE_WIDTH, prev + PADDLE_SPEED));
        }
      }
    };

    if (gameStarted && !isGameOver) {
      gameInterval = setInterval(() => {
        // [Rest of the game logic remains the same as in previous version]
        // Ball movement
        let newBallX = ballX + ballVelocityX;
        let newBallY = ballY + ballVelocityY;
        let newVelocityX = ballVelocityX;
        let newVelocityY = ballVelocityY;

        // Wall collision
        if (newBallX <= 0 || newBallX + BALL_SIZE >= GAME_WIDTH) {
          newVelocityX = -ballVelocityX;
        }

        // Top wall collision
        if (newBallY <= 0) {
          newVelocityY = -ballVelocityY;
        }

        // Bottom wall (game over)
        if (newBallY + BALL_SIZE >= GAME_HEIGHT) {
          setIsGameOver(true);
          setGameStarted(false);
          return;
        }

        // Paddle collision
        const paddleCollision = 
          newBallX + BALL_SIZE >= paddleX &&
          newBallX <= paddleX + PADDLE_WIDTH &&
          newBallY + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT;

        if (paddleCollision) {
          newVelocityY = -Math.abs(ballVelocityY);
          
          // Add paddle angle effect
          const paddleCenterX = paddleX + PADDLE_WIDTH / 2;
          const ballCenterX = newBallX + BALL_SIZE / 2;
          const angleEffect = (ballCenterX - paddleCenterX) / (PADDLE_WIDTH / 2);
          newVelocityX += angleEffect * 2;
        }

        // Brick collision
        const newBricks = bricks.map(brick => {
          if (!brick.visible) return brick;

          const brickCollision = 
            newBallX + BALL_SIZE >= brick.x &&
            newBallX <= brick.x + BRICK_WIDTH &&
            newBallY + BALL_SIZE >= brick.y &&
            newBallY <= brick.y + BRICK_HEIGHT;

          if (brickCollision) {
            // Change ball direction
            newVelocityY = -newVelocityY;
            
            // Update score
            setScore(prev => {
              const newScore = prev + 10;
              setHighScore(current => Math.max(current, newScore));
              return newScore;
            });

            return { ...brick, visible: false };
          }
          return brick;
        });

        // Check if all bricks are destroyed
        if (newBricks.every(brick => !brick.visible)) {
          setIsGameOver(true);
          setGameStarted(false);
        }

        setBricks(newBricks);
        setBallX(newBallX);
        setBallY(newBallY);
        setBallVelocityX(newVelocityX);
        setBallVelocityY(newVelocityY);
      }, GAME_TICK);

      // Add mouse move event listener
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      clearInterval(gameInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ballX, ballY, ballVelocityX, ballVelocityY, paddleX, gameStarted, isGameOver, bricks]);

  const handleClick = () => {
    if (!gameStarted || isGameOver) {
      // Reset game state
      setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
      setBallX(GAME_WIDTH / 2);
      setBallY(GAME_HEIGHT - 100);
      setBallVelocityX(BALL_SPEED);
      setBallVelocityY(-BALL_SPEED);
      setIsGameOver(false);
      setGameStarted(true);
      setScore(0);

      // Recreate bricks
      const initialBricks = [];
      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLUMNS; col++) {
          initialBricks.push({
            x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
            y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
            visible: true
          });
        }
      }
      setBricks(initialBricks);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div 
        ref={gameContainerRef}
        className="relative overflow-hidden bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg shadow-2xl"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        }}
        onClick={handleClick}
      >
        {/* [Rest of the render remains the same as previous version] */}
        {/* Paddle */}
        <div
          className="absolute bg-red-500 rounded"
          style={{
            bottom: PADDLE_HEIGHT,
            left: paddleX,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />

        {/* Ball */}
        <div
          className="absolute bg-yellow-400 rounded-full"
          style={{
            top: ballY,
            left: ballX,
            width: BALL_SIZE,
            height: BALL_SIZE,
          }}
        />

        {/* Bricks */}
        {bricks.map((brick, index) => (
          brick.visible && (
            <div
              key={index}
              className="absolute bg-green-500 border-2 border-green-600 rounded"
              style={{
                top: brick.y,
                left: brick.x,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
              }}
            />
          )
        ))}

        {/* Score and Game Over Screen remain the same */}
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
                {isGameOver ? 'Game Over!' : 'Brick Breaker'}
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

export default BrickBreaker;