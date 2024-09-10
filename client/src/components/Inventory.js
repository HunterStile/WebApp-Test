import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config'; // Importa l'URL di base
import eggImages from '../utils/eggImages';
import dragonImages from '../utils/dragonImages';

function Inventory() {
  const { user } = useContext(AuthContext);
  const [eggs, setEggs] = useState({});
  const [incubators, setIncubators] = useState([]);
  const [message, setMessage] = useState('');
  const [dragons, setDragons] = useState([]);

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

      axios.get(`${API_BASE_URL}/tc/incubators?username=${user}`)
        .then(response => {
          setIncubators(response.data.incubators);
        })
        .catch(error => console.error('Error fetching incubators:', error));
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIncubators(prevIncubators =>
        prevIncubators.map(incubator => {
          if (incubator.incubationEndTime) {
            return {
              ...incubator,
              timeLeft: calculateTimeLeft(new Date(incubator.incubationEndTime))
            };
          }
          return incubator; // Restituisci l'oggetto incubator se incubationEndTime non è definito
        })
      );
    }, 1000); // Aggiorna ogni secondo

    return () => clearInterval(interval); // Pulizia dell'intervallo quando il componente viene smontato
  }, [incubators]);

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/tc/dragons?username=${user}`)
        .then(response => {
          setDragons(response.data.dragons);
        })
        .catch(error => console.error('Error fetching dragons:', error));
    }
  }, [user]);

  const handleIncubate = (eggType) => {
    axios.post(`${API_BASE_URL}/tc/incubate`, { username: user, eggType })
      .then(response => {
        setMessage(`L'uovo di tipo ${eggType} è stato inserito nell'incubatore!`);
        setEggs(prevEggs => ({
          ...prevEggs,
          [eggType]: prevEggs[eggType] - 1
        }));
        axios.get(`${API_BASE_URL}/tc/incubators?username=${user}`)
          .then(response => {
            setIncubators(response.data.incubators);
          })
          .catch(error => console.error('Error fetching incubators:', error));
      })
      .catch(error => {
        console.error('Error incubating egg:', error);
        setMessage('Errore durante l\'incubazione.');
      });
  };

  const handleOpen = (index) => {
    axios.post(`${API_BASE_URL}/tc/open-incubated-egg`, { username: user, index })
      .then(response => {
        setMessage('L\'uovo è stato aperto con successo!');
        // Rimuovi l'uovo dalla lista degli incubatori
        setIncubators(prev => prev.filter((_, i) => i !== index));
        // Ricarica l'elenco degli incubatori e dei draghi
        axios.get(`${API_BASE_URL}/tc/incubators?username=${user}`)
          .then(response => {
            setIncubators(response.data.incubators);
          })
          .catch(error => console.error('Error fetching incubators:', error));

        axios.get(`${API_BASE_URL}/tc/dragons?username=${user}`)
          .then(response => {
            setDragons(response.data.dragons);
          })
          .catch(error => console.error('Error fetching dragons:', error));
      })
      .catch(error => {
        console.error('Error opening incubated egg:', error);
        setMessage('Errore durante l\'apertura dell\'uovo.');
      });
  };


  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const timeLeft = endTime - now;
    if (timeLeft < 0) return { hours: 0, minutes: 0, seconds: 0 }; // Se il tempo è scaduto, restituisci 0 per tutti
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  return (
    <div>
      <h2>Your Egg Inventory</h2>
      {message && <p>{message}</p>}
      <h3>Eggs in Inventory</h3>
      {Object.keys(eggs).length > 0 ? (
        <ul>
          {Object.entries(eggs).map(([eggType, count]) => {
            const imageName = `${eggType.toLowerCase().replace(/ /g, '-')}.png`;
            const image = eggImages[imageName];
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

      <h3>Incubated Eggs</h3>
      {incubators.length > 0 ? (
        <ul>
          {incubators.map((incubator, index) => {
            const { eggType, incubationEndTime, timeLeft } = incubator;
            const imageName = `${eggType.toLowerCase().replace(/ /g, '-')}.png`;
            const image = eggImages[imageName];
            const isReady = timeLeft?.hours <= 0 && timeLeft?.minutes <= 0 && timeLeft?.seconds <= 0;

            return (
              <li key={index}>
                <img src={image} alt={eggType} style={{ width: '50px', height: '50px' }} />
                {eggType}: {isReady ? 'Ready to Open' : `Time Left: ${timeLeft?.hours}h ${timeLeft?.minutes}m ${timeLeft?.seconds}s`}
                <button onClick={() => handleOpen(index)} disabled={!isReady}>
                  Open
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No eggs are currently incubating.</p>
      )}
      <h3>Your Dragons</h3>
      {dragons.length > 0 ? (
        <ul>
          {dragons.map((dragon, index) => {
            const imageName = dragon.name
              ? `${dragon.name.toLowerCase().replace(/ /g, '-')}.png`
              : 'default-dragon.png'; // Usa un'immagine di default se `dragon.name` è undefined
            const image = dragonImages[imageName];
            return (
              <li key={index}>
                <img src={image} alt={dragon.name || 'Unknown Dragon'} style={{ width: '200px', height: '200px' }} />
                <p>Name: {dragon.name}</p>
                <p>Resistance: {dragon.resistance}</p>
                <p>Mining Power: {dragon.miningPower}</p>
                <p>bonus: {dragon.bonus}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>You have no dragons.</p>
      )}
    </div>
  );
}

export default Inventory;
