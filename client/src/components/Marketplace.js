import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import mysteryBoxImage from '../assets/images/mystery-box.png'; // Importa l'immagine

function Marketplace() {
  const { user, tcBalance, spendTc } = useContext(AuthContext);
  const [result, setResult] = useState('');

  const openMysteryBox = () => {
    const randomValue = Math.random() * 100;
    let eggType = '';

    if (randomValue < 60) {
      eggType = 'Common Egg';
    } else if (randomValue < 86) {
      eggType = 'Uncommon Egg';
    } else if (randomValue < 95) {
      eggType = 'Rare Egg';
    } else if (randomValue < 99) {
      eggType = 'Epic Egg';
    } else {
      eggType = 'Legendary Egg';
    }

    setResult(eggType);
    spendTc(50); // Deduct 50 TC
  };

  return (
    <div>
      <h2>Marketplace</h2>
      <p>Your TC Balance: {tcBalance}</p>
      <img src={mysteryBoxImage} alt="Mystery Box" style={{ width: '200px', height: '200px' }} />
      <button onClick={openMysteryBox}>Open Mystery Box (50 TC)</button>
      <p>{result && `You got a ${result}!`}</p>
    </div>
  );
}

export default Marketplace;
