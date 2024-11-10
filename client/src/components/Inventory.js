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
  
        // Aggiorna lo stato delle uova rimuovendo quelle che hanno conteggio 0
        setEggs(prevEggs => {
          const updatedEggs = {
            ...prevEggs,
            [eggType]: prevEggs[eggType] - 1
          };
          
          // Rimuovi le uova con conteggio 0
          if (updatedEggs[eggType] <= 0) {
            const { [eggType]: _, ...filteredEggs } = updatedEggs;
            return filteredEggs;
          }
  
          return updatedEggs;
        });
  
        // Aggiorna l'elenco degli incubatori
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
    <div className="inventory-container">
      <h2 className="inventory-title">Your Egg Inventory</h2>
      {message && <p className="message">{message}</p>}
      
      <div className="inventory-section">
        <h3 className="section-heading">Eggs in Inventory</h3>
        {Object.keys(eggs).length > 0 ? (
          <div className="egg-list">
            {Object.entries(eggs).map(([eggType, count]) => {
              const imageName = `${eggType.toLowerCase().replace(/ /g, '-')}.png`;
              const image = eggImages[imageName];
              return (
                <div key={eggType} className="egg-list-item">
                  <img src={image} alt={eggType} className="egg-image" />
                  <div className="egg-info">
                    <span className="egg-name">{eggType}</span>
                    <span className="egg-count">Quantity: {count}</span>
                  </div>
                  <button 
                    className="incubate-button"
                    onClick={() => handleIncubate(eggType)} 
                    disabled={count <= 0}
                  >
                    Incubate
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">You have no eggs in your inventory.</p>
        )}
      </div>
  
      <div className="inventory-section">
        <h3 className="section-heading">Incubated Eggs</h3>
        {incubators.length > 0 ? (
          <div className="incubator-list">
            {incubators.map((incubator, index) => {
              const { eggType, timeLeft } = incubator;
              const imageName = `${eggType.toLowerCase().replace(/ /g, '-')}.png`;
              const image = eggImages[imageName];
              const isReady = timeLeft?.hours <= 0 && timeLeft?.minutes <= 0 && timeLeft?.seconds <= 0;
  
              return (
                <div key={index} className="incubator-item">
                  <img src={image} alt={eggType} className="egg-image" />
                  <div className="egg-info">
                    <span className="egg-name">{eggType}</span>
                    <span className="timer">
                      {isReady ? 'Ready to Open' : `Time Left: ${timeLeft?.hours}h ${timeLeft?.minutes}m ${timeLeft?.seconds}s`}
                    </span>
                  </div>
                  <button 
                    className="open-button"
                    onClick={() => handleOpen(index)} 
                    disabled={!isReady}
                  >
                    Open
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No eggs are currently incubating.</p>
        )}
      </div>
  
      <div className="inventory-section">
        <h3 className="section-heading">Your Dragons</h3>
        {dragons.length > 0 ? (
          <div className="dragon-inventory-list">
            {dragons.map((dragon, index) => {
              const imageName = dragon.name
                ? `${dragon.name.toLowerCase().replace(/ /g, '-')}.png`
                : 'default-dragon.png';
              const image = dragonImages[imageName];
              return (
                <div key={index} className="dragon-inventory-card">
                  <img src={image} alt={dragon.name || 'Unknown Dragon'} className="dragon-inventory-image" />
                  <div className="dragon-inventory-stats">
                    <div className="dragon-stat">
                      <span className="stat-label">Name:</span>
                      <span className="stat-value">{dragon.name}</span>
                    </div>
                    <div className="dragon-stat">
                      <span className="stat-label">Resistance:</span>
                      <span className="stat-value">{dragon.resistance}</span>
                    </div>
                    <div className="dragon-stat">
                      <span className="stat-label">Mining Power:</span>
                      <span className="stat-value">{dragon.miningPower}</span>
                    </div>
                    <div className="dragon-stat">
                      <span className="stat-label">Bonus:</span>
                      <span className="stat-value">{dragon.bonus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">You have no dragons.</p>
        )}
      </div>
    </div>
  );
}

export default Inventory;
