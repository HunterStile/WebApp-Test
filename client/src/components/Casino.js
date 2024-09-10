// client/src/components/Casino.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';

function Casino() {
  const {user, tcBalance, spendTc, earnTc, fetchTcBalance } = useContext(AuthContext);
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [message, setMessage] = useState('');

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

  // Inizia il gioco
  const startGame = async () => {
    if (tcBalance < 5) {
      setMessage('Insufficient TC balance to start the game.');
      return;
    }

    spendTc(5); // Deduce 5 TC
    const firstCard = drawCard();
    setCurrentCard(firstCard);
    setGameStarted(true);
    setGameOver(false);
    setWinnings(0);
    setMessage('');
  };

  // Gestisci il cashout
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

  // Resetta il gioco
  const resetGame = () => {
    setGameStarted(false);
    setCurrentCard(null);
    setNextCard(null);
    setWinnings(0);
    setGameOver(false);
    setMessage('');
  };

  return (
    <div>
      <h1>Casino - Carta Alta</h1>
      {!gameStarted ? (
        <button onClick={startGame}>Start Game (5 TC)</button>
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
  );
}

export default Casino;
