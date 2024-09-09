// client/src/components/Inventory.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config'; // Importa l'URL di base
import eggImages from '../utils/eggImages'; // Importa il modulo delle immagini

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

  return (
    <div>
      <h2>Your Egg Inventory</h2>
      {Object.keys(eggs).length > 0 ? (
        <ul>
          {Object.entries(eggs).map(([eggType, count]) => {
            const imageName = `${eggType.toLowerCase().replace(/ /g, '-')}.png`; // Trasforma il tipo di uovo nel nome del file
            const image = eggImages[imageName]; // Trova l'immagine
            return (
              <li key={eggType}>
                <img src={image} alt={eggType} style={{ width: '50px', height: '50px' }} />
                {eggType}: {count}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>You have no eggs in your inventory.</p>
      )}
    </div>
  );
}

export default Inventory;
