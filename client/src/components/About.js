import React, { useState, useEffect, useRef } from "react";
import { Trophy, RotateCcw } from "lucide-react";

const FlappyBeard = () => {
  // ==================== CONFIGURAZIONE DEL GIOCO ====================
  
  // FISICA DEL GIOCO
  const GRAVITY = 0.6;        // Forza di gravità (più alto = cade più velocemente)
  const JUMP_FORCE = -12;     // Forza del salto (più negativo = salta più in alto)
  const GAME_SPEED = 10;       // Velocità di movimento delle pipe
  const GAME_TICK = 20;       // Intervallo di aggiornamento del gioco in ms

  // DIMENSIONI DEL GIOCATORE
  const BIRD_WIDTH = 40;      // Larghezza del personaggio
  const BIRD_HEIGHT = 40;     // Altezza del personaggio
  const BIRD_START_Y = 150;   // Posizione verticale iniziale
  const BIRD_X_POSITION = 4;  // Posizione orizzontale (il gioco divide la width per questo numero)
  
  // CONFIGURAZIONE DELLE PIPE (OSTACOLI)
  const INITIAL_PIPE_GAP = 250;     // Distanza verticale iniziale tra le pipe
  const MIN_PIPE_GAP = 140;         // Distanza verticale minima tra le pipe
  const GAP_DECREASE_RATE = 5;      // Di quanto diminuisce il gap ogni 5 punti
  
  const INITIAL_PIPE_WIDTH = 80;    // Larghezza iniziale delle pipe
  const MIN_PIPE_WIDTH = 50;        // Larghezza minima delle pipe
  const WIDTH_DECREASE_RATE = 2;    // Di quanto diminuisce la larghezza ogni 5 punti
  
  // CONFIGURAZIONE DELLO SPAWN DELLE PIPE
  const INITIAL_SPAWN_INTERVAL = 60; // Intervallo iniziale tra la generazione di pipe
  const MIN_SPAWN_INTERVAL = 50;      // Intervallo minimo tra la generazione di pipe
  const SPAWN_DECREASE_RATE = 2;      // Di quanto diminuisce l'intervallo ogni 5 punti
  
  // CONFIGURAZIONE DELLA ROTAZIONE DEL PERSONAGGIO
  const MAX_ROTATION_UP = -20;      // Rotazione massima verso l'alto
  const MAX_ROTATION_DOWN = 90;     // Rotazione massima verso il basso
  const ROTATION_FACTOR = 2;        // Fattore di moltiplicazione per la rotazione

  // ==================== STATO DEL GIOCO ====================
  const [birdY, setBirdY] = useState(BIRD_START_Y);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPipeGap, setCurrentPipeGap] = useState(INITIAL_PIPE_GAP);
  const [currentPipeWidth, setCurrentPipeWidth] = useState(INITIAL_PIPE_WIDTH);
  const [currentSpawnInterval, setCurrentSpawnInterval] = useState(INITIAL_SPAWN_INTERVAL);
  const [birdRotation, setBirdRotation] = useState(0);
  
  const frameCountRef = useRef(0);
  const lastPipeSpawnRef = useRef(0);

  // Funzione per aggiornare la difficoltà basata sul punteggio
  const updateDifficulty = (newScore) => {
    const difficultyLevel = Math.floor(newScore / 5); // Aumenta difficoltà ogni 5 punti
    
    // Aggiorna il gap tra le pipe
    const newGap = Math.max(
      MIN_PIPE_GAP,
      INITIAL_PIPE_GAP - (difficultyLevel * GAP_DECREASE_RATE)
    );
    setCurrentPipeGap(newGap);
    
    // Aggiorna la larghezza delle pipe
    const newWidth = Math.max(
      MIN_PIPE_WIDTH,
      INITIAL_PIPE_WIDTH - (difficultyLevel * WIDTH_DECREASE_RATE)
    );
    setCurrentPipeWidth(newWidth);
    
    // Aggiorna l'intervallo di spawn
    const newInterval = Math.max(
      MIN_SPAWN_INTERVAL,
      INITIAL_SPAWN_INTERVAL - (difficultyLevel * SPAWN_DECREASE_RATE)
    );
    setCurrentSpawnInterval(newInterval);
  };

  useEffect(() => {
    let gameInterval;
    
    if (gameStarted && !isGameOver) {
      gameInterval = setInterval(() => {
        frameCountRef.current += 1;
        
        // Bird physics
        setBirdY(prevY => {
          const newY = prevY + birdVelocity;
          return Math.max(0, Math.min(newY, window.innerHeight - BIRD_HEIGHT));
        });
        setBirdVelocity(prevVelocity => prevVelocity + GRAVITY);
        
        // Bird rotation based on velocity
        setBirdRotation(Math.min(Math.max(birdVelocity * ROTATION_FACTOR, MAX_ROTATION_UP), MAX_ROTATION_DOWN));

        // Spawn pipes at current interval
        if (frameCountRef.current - lastPipeSpawnRef.current >= currentSpawnInterval) {
          const minY = currentPipeGap + 50;
          const maxY = window.innerHeight - currentPipeGap - 50;
          const newPipeY = Math.floor(Math.random() * (maxY - minY) + minY);
          
          setPipes(prevPipes => [
            ...prevPipes,
            { 
              x: window.innerWidth, 
              y: newPipeY, 
              scored: false,
              width: currentPipeWidth,
              gap: currentPipeGap
            }
          ]);
          
          lastPipeSpawnRef.current = frameCountRef.current;
        }

        // Move pipes and check collisions
        setPipes(prevPipes => {
          return prevPipes
            .map(pipe => ({
              ...pipe,
              x: pipe.x - GAME_SPEED
            }))
            .filter(pipe => pipe.x + pipe.width > 0);
        });

        // Collision detection
        const birdRect = {
          x: window.innerWidth / BIRD_X_POSITION,
          y: birdY,
          width: BIRD_WIDTH,
          height: BIRD_HEIGHT
        };

        pipes.forEach(pipe => {
          const topPipeRect = {
            x: pipe.x,
            y: 0,
            width: pipe.width,
            height: pipe.y - pipe.gap / 2
          };

          const bottomPipeRect = {
            x: pipe.x,
            y: pipe.y + pipe.gap / 2,
            width: pipe.width,
            height: window.innerHeight - (pipe.y + pipe.gap / 2)
          };

          if (checkCollision(birdRect, topPipeRect) || 
              checkCollision(birdRect, bottomPipeRect) ||
              birdY <= 0 || 
              birdY + BIRD_HEIGHT >= window.innerHeight) {
            handleGameOver();
          }
        });

        // Score update
        pipes.forEach(pipe => {
          if (pipe.x + pipe.width < window.innerWidth / BIRD_X_POSITION && !pipe.scored) {
            setScore(prevScore => {
              const newScore = prevScore + 1;
              setHighScore(current => Math.max(current, newScore));
              updateDifficulty(newScore);
              return newScore;
            });
            pipe.scored = true;
          }
        });
      }, GAME_TICK);
    }

    return () => clearInterval(gameInterval);
  }, [birdVelocity, birdY, pipes, isGameOver, gameStarted, currentPipeGap, currentPipeWidth, currentSpawnInterval]);

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
      setBirdY(BIRD_START_Y);
      setBirdVelocity(0);
      setIsGameOver(false);
      setPipes([]);
      setScore(0);
      frameCountRef.current = 0;
      lastPipeSpawnRef.current = 0;
      setCurrentPipeGap(INITIAL_PIPE_GAP);
      setCurrentPipeWidth(INITIAL_PIPE_WIDTH);
      setCurrentSpawnInterval(INITIAL_SPAWN_INTERVAL);
    } else if (!isGameOver) {
      setBirdVelocity(JUMP_FORCE);
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
          left: `${window.innerWidth / BIRD_X_POSITION}px`,
          width: BIRD_WIDTH,
          height: BIRD_HEIGHT,
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
              width: pipe.width,
              height: pipe.y - pipe.gap / 2,
            }}
          >
            <div className="absolute bottom-0 left-0 w-full h-4 bg-green-500" />
          </div>
          <div
            className="absolute bg-green-600 border-4 border-green-700"
            style={{
              top: pipe.y + pipe.gap / 2,
              left: pipe.x,
              width: pipe.width,
              height: window.innerHeight - (pipe.y + pipe.gap / 2),
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