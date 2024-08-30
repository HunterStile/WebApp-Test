import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import mysteryBoxImage from '../assets/images/mystery-box.png';
import commonEggImage from '../assets/images/common-egg.png';
import uncommonEggImage from '../assets/images/uncommon-egg.png';
import rareEggImage from '../assets/images/rare-egg.png';
import epicEggImage from '../assets/images/epic-egg.png';
import legendaryEggImage from '../assets/images/legendary-egg.png';
import axios from 'axios';
import API_BASE_URL from '../config'; // Importa l'URL di base

function Marketplace() {
  const { user, tcBalance, spendTc } = useContext(AuthContext);
  const [result, setResult] = useState('');
  const [eggImage, setEggImage] = useState(null);
  const [boxOpened, setBoxOpened] = useState(false);

  const openMysteryBox = async () => {
    if (tcBalance < 50) {
      alert('Insufficient TC balance');
      return;
    }

    const randomValue = Math.random() * 100;
    let eggType = '';
    let image = null;

    if (randomValue < 60) {
      eggType = 'Common Egg';
      image = commonEggImage;
    } else if (randomValue < 86) {
      eggType = 'Uncommon Egg';
      image = uncommonEggImage;
    } else if (randomValue < 95) {
      eggType = 'Rare Egg';
      image = rareEggImage;
    } else if (randomValue < 99) {
      eggType = 'Epic Egg';
      image = epicEggImage;
    } else {
      eggType = 'Legendary Egg';
      image = legendaryEggImage;
    }

    setResult(eggType);
    setEggImage(image);
    spendTc(50); // Deduct 50 TC using the context function

    // Salva l'uovo ottenuto sul server
    try {
      await axios.post(`${API_BASE_URL}/tc/open-box`, { username: user, eggType });
    } catch (error) {
      console.error('Error saving egg:', error);
    }

    setBoxOpened(true);
  };

  const resetBox = () => {
    setResult('');
    setEggImage(null);
    setBoxOpened(false);
  };

  return (
    <div>
      <h2>Marketplace</h2>
      {!boxOpened ? (
        <>
          <img src={mysteryBoxImage} alt="Mystery Box" style={{ width: '200px', height: '200px' }} />
          <button onClick={openMysteryBox}>Open Mystery Box (50 TC)</button>
        </>
      ) : (
        <>
          <h3>You got a {result}!</h3>
          {eggImage && <img src={eggImage} alt={result} style={{ width: '200px', height: '200px' }} />}
          <button onClick={resetBox}>Open a new Mystery Box</button>
        </>
      )}
    </div>
  );
}

export default Marketplace;
