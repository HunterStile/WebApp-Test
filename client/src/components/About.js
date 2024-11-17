import React, { useState, useEffect } from "react";
import { Trophy, RotateCcw } from "lucide-react";

const FlappyBeard = () => {
  const [birdY, setBirdY] = useState(150);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [gravity] = useState(0.6);
  const [lift] = useState(-12);
  const [isGameOver, setIsGameOver] = useState(false);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [pipeGap] = useState(170);
  const [birdRotation, setBirdRotation] = useState(0);
  
  const birdWidth = 40;
  const birdHeight = 40;
  const pipeWidth = 60;

  useEffect(() => {
    let gameInterval;
    
    if (gameStarted && !isGameOver) {
      gameInterval = setInterval(() => {
        // Bird physics
        setBirdY(prevY => {
          const newY = prevY + birdVelocity;
          return Math.max(0, Math.min(newY, window.innerHeight - birdHeight));
        });
        setBirdVelocity(prevVelocity => prevVelocity + gravity);
        
        // Bird rotation based on velocity
        setBirdRotation(Math.min(Math.max(birdVelocity * 2, -20), 90));

        // Spawn pipes
        if (Math.random() < 0.02) {
          const minY = pipeGap + 50;
          const maxY = window.innerHeight - pipeGap - 50;
          const newPipeY = Math.floor(Math.random() * (maxY - minY) + minY);
          setPipes(prevPipes => [
            ...prevPipes,
            { x: window.innerWidth, y: newPipeY, scored: false }
          ]);
        }

        // Move pipes and check collisions
        setPipes(prevPipes => {
          return prevPipes
            .map(pipe => ({
              ...pipe,
              x: pipe.x - 5
            }))
            .filter(pipe => pipe.x + pipeWidth > 0);
        });

        // Collision detection
        const birdRect = {
          x: window.innerWidth / 4,
          y: birdY,
          width: birdWidth,
          height: birdHeight
        };

        pipes.forEach(pipe => {
          const topPipeRect = {
            x: pipe.x,
            y: 0,
            width: pipeWidth,
            height: pipe.y - pipeGap / 2
          };

          const bottomPipeRect = {
            x: pipe.x,
            y: pipe.y + pipeGap / 2,
            width: pipeWidth,
            height: window.innerHeight - (pipe.y + pipeGap / 2)
          };

          if (checkCollision(birdRect, topPipeRect) || 
              checkCollision(birdRect, bottomPipeRect) ||
              birdY <= 0 || 
              birdY + birdHeight >= window.innerHeight) {
            handleGameOver();
          }
        });

        // Score update
        pipes.forEach(pipe => {
          if (pipe.x + pipeWidth < window.innerWidth / 4 && !pipe.scored) {
            setScore(prevScore => {
              const newScore = prevScore + 1;
              setHighScore(current => Math.max(current, newScore));
              return newScore;
            });
            pipe.scored = true;
          }
        });
      }, 20);
    }

    return () => clearInterval(gameInterval);
  }, [birdVelocity, birdY, gravity, pipes, pipeGap, isGameOver, gameStarted]);

  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    setGameStarted(false);
  };

  const handleClick = () => {
    if (!gameStarted) {
      setGameStarted(true);
      setBirdY(150);
      setBirdVelocity(0);
      setIsGameOver(false);
      setPipes([]);
      setScore(0);
    } else if (!isGameOver) {
      setBirdVelocity(lift);
    }
  };

  return (
    <div 
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-400 to-blue-600"
      onClick={handleClick}
    >
      {/* Bird */}
      <div
        className="absolute transition-transform"
        style={{
          top: birdY,
          left: `${window.innerWidth / 4}px`,
          width: birdWidth,
          height: birdHeight,
          transform: `translateX(-50%) rotate(${birdRotation}deg)`,
        }}
      >
        <div className="w-full h-full bg-yellow-400 rounded-full relative overflow-hidden">
          <div className="absolute w-3/4 h-1/2 bg-yellow-500 bottom-0 left-1/2 transform -translate-x-1/2" />
          <div className="absolute w-2 h-2 bg-black rounded-full top-1/3 right-1/4" />
        </div>
      </div>

      {/* Pipes */}
      {pipes.map((pipe, index) => (
        <div key={index}>
          <div
            className="absolute bg-green-600 border-4 border-green-700"
            style={{
              top: 0,
              left: pipe.x,
              width: pipeWidth,
              height: pipe.y - pipeGap / 2,
            }}
          >
            <div className="absolute bottom-0 left-0 w-full h-4 bg-green-500" />
          </div>
          <div
            className="absolute bg-green-600 border-4 border-green-700"
            style={{
              top: pipe.y + pipeGap / 2,
              left: pipe.x,
              width: pipeWidth,
              height: window.innerHeight - (pipe.y + pipeGap / 2),
            }}
          >
            <div className="absolute top-0 left-0 w-full h-4 bg-green-500" />
          </div>
        </div>
      ))}

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
              {isGameOver ? 'Game Over!' : 'Flappy Beard'}
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
  );
};

export default FlappyBeard;