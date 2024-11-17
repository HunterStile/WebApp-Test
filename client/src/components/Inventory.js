import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config'; // Importa l'URL di base
import { getEggImage } from '../utils/eggImages';
import { getDragonImage } from '../utils/dragonImages';

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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-purple-400 mb-6">Your Egg Inventory</h2>

        {message && (
          <div className="bg-purple-500 text-white p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* Eggs Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-cyan-400">Eggs in Inventory</h3>
          {Object.keys(eggs).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(eggs).map(([eggType, count]) => (
                <div key={eggType} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden">
                      <img
                        src={getEggImage(eggType)}
                        alt={eggType}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{eggType}</h4>
                      <p className="text-sm text-slate-400">Quantity: {count}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleIncubate(eggType)}
                    disabled={count <= 0}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
                  >
                    Incubate
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              You have no eggs in your inventory.
            </div>
          )}
        </div>

        {/* Incubators Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-green-400">Incubated Eggs</h3>
          {incubators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incubators.map((incubator, index) => {
                const { eggType, timeLeft } = incubator;
                const isReady = timeLeft?.hours <= 0 && timeLeft?.minutes <= 0 && timeLeft?.seconds <= 0;

                return (
                  <div key={index} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden">
                        <img
                          src={getEggImage(eggType)}
                          alt={eggType}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{eggType}</h4>
                        <p className="text-sm text-cyan-400">
                          {isReady ? 'Ready to Open' :
                            `${timeLeft?.hours}h ${timeLeft?.minutes}m ${timeLeft?.seconds}s`
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpen(index)}
                      disabled={!isReady}
                      className={`px-4 py-2 rounded-lg ${isReady
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-slate-600 cursor-not-allowed'
                        }`}
                    >
                      Open
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              No eggs are currently incubating.
            </div>
          )}
        </div>

        {/* Dragons Section */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-pink-400">Your Dragons</h3>
          {dragons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dragons.map((dragon, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <div className="mb-4 w-full h-48 bg-slate-600 rounded-lg overflow-hidden">
                    <img
                      src={getDragonImage(dragon.name)}
                      alt={dragon.name || 'Unknown Dragon'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{dragon.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-800 p-2 rounded">
                      <span className="text-slate-400">Resistance:</span>
                      <div className="text-yellow-400">{dragon.resistance}</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                      <span className="text-slate-400">Mining Power:</span>
                      <div className="text-cyan-400">{dragon.miningPower}</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                      <span className="text-slate-400">Bonus:</span>
                      <div className="text-green-400">+{dragon.bonus}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              You have no dragons.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventory;
