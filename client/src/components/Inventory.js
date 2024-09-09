import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config'; // Importa l'URL di base
import eggImages from '../utils/eggImages'; // Importa il modulo delle immagini

function Inventory() {
  const { user } = useContext(AuthContext);
  const [eggs, setEggs] = useState({});
  const [message, setMessage] = useState('');

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

  const handleIncubate = (eggType) => {
    axios.post(`${API_BASE_URL}/tc/incubate`, { username: user, eggType })
      .then(response => {
        setMessage(`L'uovo di tipo ${eggType} è stato inserito nell'incubatore!`);
        // Aggiorna lo stato rimuovendo un'unità di quell'uovo dall'inventario
        setEggs(prevEggs => ({
          ...prevEggs,
          [eggType]: prevEggs[eggType] - 1
        }));
      })
      .catch(error => {
        console.error('Error incubating egg:', error);
        setMessage('Errore durante l\'incubazione.');
      });
  };

  return (
    <div>
      <h2>Your Egg Inventory</h2>
      {message && <p>{message}</p>} {/* Mostra messaggi di stato */}
      {Object.keys(eggs).length > 0 ? (
        <ul>
          {Object.entries(eggs).map(([eggType, count]) => {
            const imageName = `${eggType.toLowerCase().replace(/ /g, '-')}.png`; // Trasforma il tipo di uovo nel nome del file
            const image = eggImages[imageName]; // Trova l'immagine
            return (
              <li key={eggType}>
                <img src={image} alt={eggType} style={{ width: '50px', height: '50px' }} />
                {eggType}: {count}
                <button onClick={() => handleIncubate(eggType)} disabled={count <= 0}>
                  Incubate
                </button>
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
