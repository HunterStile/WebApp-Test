// client/src/components/Inventory.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config'; // Importa l'URL di base

// Importa le immagini degli ovuli
import commonEggImage from '../assets/images/egg/common-egg.png';
import uncommonEggImage from '../assets/images/egg/uncommon-egg.png';
import rareEggImage from '../assets/images/egg/rare-egg.png';
import epicEggImage from '../assets/images/egg/epic-egg.png';
import legendaryEggImage from '../assets/images/egg/legendary-egg.png';

function Inventory() {
  const { user } = useContext(AuthContext);
  const [eggs, setEggs] = useState({});

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/tc/eggs?username=${user}`)
        .then(response => {
          const filteredEggs = Object.fromEntries(
            Object.entries(response.data.eggs).filter(([_, count]) => count > 0)
          );
          setEggs(filteredEggs);
        })
        .catch(error => console.error('Error fetching eggs:', error));
    }
  }, [user]);

  // Mappa i tipi di ovuli alle immagini
  const eggImages = {
    'Common Egg': commonEggImage,
    'Uncommon Egg': uncommonEggImage,
    'Rare Egg': rareEggImage,
    'Epic Egg': epicEggImage,
    'Legendary Egg': legendaryEggImage
  };

  return (
    <div>
      <h2>Your Egg Inventory</h2>
      {Object.keys(eggs).length > 0 ? (
        <ul>
          {Object.entries(eggs).map(([eggType, count]) => (
            <li key={eggType}>
              <img src={eggImages[eggType]} alt={eggType} style={{ width: '50px', height: '50px' }} />
              {eggType}: {count}
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no eggs in your inventory.</p>
      )}
    </div>
  );
}

export default Inventory;
