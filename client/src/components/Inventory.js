import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config'; // Importa l'URL di base
import eggImages from '../utils/eggImages'; // Importa il modulo delle immagini

function Inventory() {
  const { user } = useContext(AuthContext);
  const [eggs, setEggs] = useState({});
  const [incubators, setIncubators] = useState([]);
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
        setIncubators(prev => prev.filter((_, i) => i !== index));
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
    </div>
  );
}

export default Inventory;
