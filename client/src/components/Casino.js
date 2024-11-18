import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const CasinoGames = () => {
    const { user, tcBalance, spendTc, earnTc } = useContext(AuthContext);

    // Carta Alta States
    const [cartaAltaState, setCartaAltaState] = useState({
        currentCard: '',
        bet: 1,
        winnings: 0,
        gameStarted: false,
        gameOver: false,
        message: ''
    });

    // Aviator States
    const [aviatorState, setAviatorState] = useState({
        bet: 1,
        multiplier: 1,
        gameRunning: false,
        crashPoint: 0,
        earnings: 0,
        message: ''
    });

    // Card Utilities
    const cardSuits = ['♥', '♦', '♠', '♣'];
    const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const drawRandomCard = () => {
        const randomValue = cardValues[Math.floor(Math.random() * cardValues.length)];
        const randomSuit = cardSuits[Math.floor(Math.random() * cardSuits.length)];
        return `${randomValue}${randomSuit}`;
    };

    // Carta Alta Game Logic
    const startCartaAlta = () => {
        if (tcBalance < cartaAltaState.bet) {
            setCartaAltaState(prev => ({ ...prev, message: 'Saldo insufficiente' }));
            return;
        }

        spendTc(cartaAltaState.bet);
        setCartaAltaState(prev => ({
            ...prev,
            currentCard: drawRandomCard(),
            gameStarted: true,
            gameOver: false,
            winnings: 0,
            message: ''
        }));
    };

    const guessCard = (isHigher) => {
        const nextCard = drawRandomCard();
        const currentValue = cardValues.indexOf(cartaAltaState.currentCard[0]);
        const nextValue = cardValues.indexOf(nextCard[0]);

        const isCorrectGuess =
            (isHigher && nextValue > currentValue) ||
            (!isHigher && nextValue < currentValue);

        if (isCorrectGuess) {
            const newWinnings = cartaAltaState.winnings + cartaAltaState.bet * 0.25;
            setCartaAltaState(prev => ({
                ...prev,
                currentCard: nextCard,
                winnings: newWinnings,
                message: 'Indovinato! Continua o ritira.'
            }));
        } else {
            setCartaAltaState(prev => ({
                ...prev,
                gameOver: true,
                message: `Hai perso! La carta era ${nextCard}`
            }));
        }
    };

    const cashOutCartaAlta = () => {
        earnTc(cartaAltaState.winnings, 'wincasino');
        setCartaAltaState(prev => ({
            ...prev,
            gameStarted: false,
            gameOver: false,
            winnings: 0,
            bet: 1
        }));
    };

    // Aviator Game Logic
    const startAviator = () => {
        if (tcBalance < aviatorState.bet) {
            setAviatorState(prev => ({ ...prev, message: 'Saldo insufficiente' }));
            return;
        }

        spendTc(aviatorState.bet);
        // Modified crash point generation to be less predictable
        const baseChance = 0.7; // 70% chance of losing
        const randomFactor = Math.random();
        const crashPoint = randomFactor < baseChance
            ? 1 + Math.random() * 1.5  // Quick crash
            : 1 + Math.random() * 5;   // Occasional higher multiplier

        setAviatorState(prev => ({
            ...prev,
            gameRunning: true,
            multiplier: 1,
            crashPoint: crashPoint,
            earnings: 0,
            message: ''
        }));
    };

    useEffect(() => {
        let intervalId;
        if (aviatorState.gameRunning) {
            intervalId = setInterval(() => {
                setAviatorState(prev => {
                    const newMultiplier = prev.multiplier + 0.1;
                    if (newMultiplier >= prev.crashPoint) {
                        return {
                            ...prev,
                            gameRunning: false,
                            message: 'Crash! Hai perso la puntata'
                        };
                    }
                    return { ...prev, multiplier: newMultiplier };
                });
            }, 100);
        }
        return () => clearInterval(intervalId);
    }, [aviatorState.gameRunning]);

    const cashOutAviator = () => {
        if (aviatorState.gameRunning) {
            const earnings = aviatorState.bet * aviatorState.multiplier;
            earnTc(earnings, 'wincasino');
            setAviatorState(prev => ({
                ...prev,
                gameRunning: false,
                earnings,
                message: `Ritirato a ${prev.multiplier.toFixed(2)}x`
            }));
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-blue-400">Casinò TC</h1>
                <p className="text-blue-200">Saldo: {tcBalance.toFixed(2)} TC</p>
            </div>

            <div className="flex space-x-4">
                {/* Carta Alta */}
                <div className="w-1/2 bg-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-blue-400 mb-4">Carta Alta</h2>
                    {!cartaAltaState.gameStarted ? (
                        <div>
                            <input
                                type="number"
                                value={cartaAltaState.bet}
                                onChange={(e) => setCartaAltaState(prev => ({ ...prev, bet: Math.max(1, Number(e.target.value)) }))}
                                className="w-full bg-gray-700 text-white p-2 rounded mb-2"
                            />
                            <button
                                onClick={startCartaAlta}
                                className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
                            >
                                Inizia
                            </button>
                        </div>
                    ) : cartaAltaState.gameOver ? (
                        <div>
                            <p>{cartaAltaState.message}</p>
                            <button
                                onClick={() => setCartaAltaState(prev => ({ ...prev, gameStarted: false, gameOver: false }))}
                                className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded mt-2"
                            >
                                Ricomincia
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="text-6xl text-center mb-4">{cartaAltaState.currentCard}</div>
                            <p className="text-center mb-2">{cartaAltaState.message}</p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => guessCard(true)}
                                    className="w-1/2 bg-green-600 hover:bg-green-700 p-2 rounded"
                                >
                                    Più Alto
                                </button>
                                <button
                                    onClick={() => guessCard(false)}
                                    className="w-1/2 bg-red-600 hover:bg-red-700 p-2 rounded"
                                >
                                    Più Basso
                                </button>
                            </div>
                            <div className="mt-2 text-center">
                                <p>Vincite: {cartaAltaState.winnings.toFixed(2)} TC</p>
                                <button
                                    onClick={cashOutCartaAlta}
                                    className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded mt-2"
                                >
                                    Ritira
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Aviator section */}
                <div className="w-1/2 bg-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-blue-400 mb-4">Aviator</h2>
                    {!aviatorState.gameRunning ? (
                        <div>
                            <input
                                type="number"
                                value={aviatorState.bet}
                                onChange={(e) => setAviatorState(prev => ({ ...prev, bet: Math.max(1, Number(e.target.value)) }))}
                                className="w-full bg-gray-700 text-white p-2 rounded mb-2"
                            />
                            <button
                                onClick={startAviator}
                                className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
                            >
                                Inizia
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="text-4xl text-center mb-4 text-green-400">
                                {aviatorState.multiplier.toFixed(2)}x
                            </div>
                            {/*
  <div className="h-4 bg-gray-700 rounded mb-4 relative">
    <div 
      className="absolute top-0 left-0 h-4 bg-blue-600 rounded" 
      style={{
        width: `${Math.min(aviatorState.multiplier / aviatorState.crashPoint * 100, 100)}%`,
        transition: 'width 0.1s linear'
      }}
    />
  </div>
*/}
                            <button
                                onClick={cashOutAviator}
                                className="w-full bg-green-600 hover:bg-green-700 p-2 rounded"
                            >
                                Ritira
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasinoGames;