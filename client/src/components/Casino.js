import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';

function Casino() {
  const { user, tcBalance, spendTc, earnTc, fetchTcBalance } = useContext(AuthContext);
  
  // Stati per il gioco Carta Alta
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winnings, setWinnings] = useState(1); // Imposta 1 come valore predefinito
  const [message, setMessage] = useState('');

  // Stati per il gioco Aviator
  const [aviatorMultiplier, setAviatorMultiplier] = useState(1);
  const [aviatorBet, setAviatorBet] = useState(1); // Imposta 1 come valore predefinito
  const [aviatorGameRunning, setAviatorGameRunning] = useState(false);
  const [aviatorCrashPoint, setAviatorCrashPoint] = useState(null);
  const [aviatorCashOut, setAviatorCashOut] = useState(false);
  const [aviatorEarnings, setAviatorEarnings] = useState(0);

  const cardValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  const deck = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  // Funzione per pescare una carta casuale
  const drawCard = () => {
    const randomIndex = Math.floor(Math.random() * deck.length);
    return deck[randomIndex];
  };

  // Inizia il gioco Carta Alta
  const startGame = async () => {
    if (tcBalance < winnings) {
      setMessage('Insufficient TC balance to start the game.');
      return;
    }

    spendTc(winnings); // Deduce la puntata TC
    const firstCard = drawCard();
    setCurrentCard(firstCard);
    setGameStarted(true);
    setGameOver(false);
    setMessage('');
  };

  // Gestisci il cashout per Carta Alta
  const handleCashOut = async () => {
    try {
      const action = 'wincasino'; // Aggiungi l'azione di cashout per il casino
      await earnTc(winnings, action); // Usa la funzione earnTc per registrare il guadagno e l'azione
      resetGame(); // Funzione per resettare il gioco
    } catch (error) {
      console.error('Error during cashout:', error);
    }
  };

  // Controlla se l'utente ha indovinato
  const guess = (guessHigh) => {
    const nextDraw = drawCard();
    setNextCard(nextDraw);

    if (
      (guessHigh && cardValues[nextDraw] > cardValues[currentCard]) ||
      (!guessHigh && cardValues[nextDraw] < cardValues[currentCard])
    ) {
      setWinnings(prevWinnings => prevWinnings + 1);
      setCurrentCard(nextDraw);
      setMessage('Correct! Keep going or cash out.');
    } else {
      setMessage(`You lost! The next card was ${nextDraw}.`);
      setGameOver(true);
    }
  };

  // Resetta il gioco Carta Alta
  const resetGame = () => {
    setGameStarted(false);
    setCurrentCard(null);
    setNextCard(null);
    setWinnings(1); // Resetta la puntata a 1
    setGameOver(false);
    setMessage('');
  };

  // Funzione per generare il punto di crash per Aviator
  const generateCrashPoint = () => {
    return Math.random() * 100; // Per esempio, crash tra 1 e 100x
  };

  // Inizia il gioco Aviator
  const startAviatorGame = () => {
    if (tcBalance < aviatorBet) {
      setMessage('Insufficient TC balance to start the game.');
      return;
    }

    if (aviatorBet <= 0) {
      setMessage('Invalid bet amount. Bet must be greater than 0.');
      return;
    }

    spendTc(5); // Deduce 5 TC
    setAviatorGameRunning(true);
    setAviatorCrashPoint(generateCrashPoint());
    setAviatorMultiplier(1);
    setAviatorCashOut(false);
    setAviatorEarnings(0);
    setMessage('');
  };

  // Incrementa il moltiplicatore Aviator progressivamente finché non raggiunge il crash
  useEffect(() => {
    if (aviatorGameRunning && !aviatorCashOut) {
      const interval = setInterval(() => {
        setAviatorMultiplier(prevMultiplier => {
          const newMultiplier = prevMultiplier + 0.1; // Incrementa gradualmente
          if (newMultiplier >= aviatorCrashPoint) {
            setAviatorGameRunning(false);
            setMessage('Crash! You lost your bet.');
            clearInterval(interval);
          }
          return newMultiplier;
        });
      }, 100); // Ogni 100 ms, incrementa il moltiplicatore

      return () => clearInterval(interval);
    }
  }, [aviatorGameRunning, aviatorCashOut, aviatorCrashPoint]);

  // Gestisci il cashout per Aviator
  const handleAviatorCashOut = async () => {
    if (aviatorGameRunning) {
      try {
        if (aviatorBet <= 0) {
          setMessage('Invalid bet amount. Bet must be greater than 0.');
          return;
        }
  
        // Calcola l'importo guadagnato
        const earnings = aviatorBet * aviatorMultiplier;
        const action = 'wincasino'; // Aggiungi l'azione di cashout per il casino
  
        // Registra il guadagno
        await earnTc(earnings, action);
        setAviatorCashOut(true);
        setAviatorEarnings(earnings);
        setMessage(`You cashed out at ${aviatorMultiplier.toFixed(2)}x and earned ${earnings.toFixed(2)} TC.`);
        setAviatorGameRunning(false);
      } catch (error) {
        console.error('Error during cashout:', error);
      }
    }
  };

  return (
    <div>
      <h1>Casino</h1>

      {/* Gioco Carta Alta */}
      <div>
        <h2>Carta Alta</h2>
        {!gameStarted ? (
          <div>
            <input
              type="number"
              value={winnings}
              onChange={(e) => setWinnings(Math.max(1, Number(e.target.value)))}
              placeholder="Place your bet"
              min="1"
              step="1"
            />
            <button onClick={startGame}>Start Game</button>
          </div>
        ) : gameOver ? (
          <>
            <p>{message}</p>
            <button onClick={resetGame}>Restart</button>
          </>
        ) : (
          <>
            <p>Current card: {currentCard}</p>
            <p>{message}</p>
            <button onClick={() => guess(true)}>Higher</button>
            <button onClick={() => guess(false)}>Lower</button>
            <p>Winnings: {winnings} TC</p>
            <button onClick={handleCashOut}>Cash Out</button>
          </>
        )}
      </div>

      {/* Gioco Aviator */}
      <div>
        <h2>Aviator</h2>
        {aviatorGameRunning ? (
          <>
            <p>Current Multiplier: {aviatorMultiplier.toFixed(2)}x</p>
            <button onClick={handleAviatorCashOut}>Cash Out</button>
          </>
        ) : (
          <>
            <input
              type="number"
              value={aviatorBet}
              onChange={(e) => setAviatorBet(Math.max(1, Number(e.target.value)))}
              placeholder="Place your bet"
              min="1"
              step="1"
            />
            <button onClick={startAviatorGame}>Start Game</button>
          </>
        )}
        <p>{message}</p>
        {aviatorEarnings > 0 && <p>Your earnings: {aviatorEarnings} TC</p>}
      </div>
    </div>
  );
}

export default Casino;
