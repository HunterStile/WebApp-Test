import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import { getDragonImage } from '../utils/dragonImages';

function Home() {
  const { user } = useContext(AuthContext);
  const [dragons, setDragons] = useState([]);
  const [miningZone, setMiningZone] = useState([]);
  const [totalMiningPower, setTotalMiningPower] = useState(0);
  const [totalServerMiningPower, setTotalServerMiningPower] = useState(0);
  const [estimatedRewards, setEstimatedRewards] = useState({ tc: 0, satoshi: 0 });
  const [timer, setTimer] = useState(0); // Aggiungi lo stato per il timer
  const [selectedTab, setSelectedTab] = useState('daily');

  useEffect(() => {
    if (user) {
      fetchDragons();
      fetchMiningZone();
      fetchTotalServerMiningPower();
      fetchEstimatedRewards(); // Recupera le ricompense stimate
      fetchTimeUntilNextRewards(); // Recupera il tempo rimanente dal server
    }
  }, [user]);

  // Funzione per recuperare il tempo rimanente dal server
  const fetchTimeUntilNextRewards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/time-until-next-rewards`);
      if (response.data) {
        const secondsRemaining = response.data.secondsRemaining;
        setTimer(secondsRemaining); // Imposta il timer
        startTimer(secondsRemaining); // Inizia il timer con il tempo rimanente
      }
    } catch (error) {
      console.error('Errore durante il recupero del tempo rimanente:', error);
    }
  };

  // Funzione per avviare il timer
  const startTimer = (initialTime) => {
    setTimer(initialTime); // Imposta il timer iniziale

    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 0) {
          clearInterval(interval);
          fetchTimeUntilNextRewards(); // Ricarica il tempo rimanente
          return 0; // Ferma il timer a 0
        }
        return prevTimer - 1; // Decrementa il timer
      });
    }, 1000);

    // Pulisci l'intervallo quando il componente si smonta
    return () => clearInterval(interval);
  };

  const fetchDragons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/dragons`, { params: { username: user } });
      setDragons(response.data.dragons || []);
    } catch (error) {
      console.error('Errore durante il recupero dei draghi:', error);
    }
  };

  const fetchMiningZone = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/mining-zone`, { params: { username: user } });
      setMiningZone(response.data.miningZone || []);
      calculateTotalMiningPower(response.data.miningZone);
    } catch (error) {
      console.error('Errore durante il recupero della zona mining:', error);
    }
  };

  const fetchTotalServerMiningPower = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/total-mining-power`);
      setTotalServerMiningPower(response.data.totalServerMiningPower || 0);
    } catch (error) {
      console.error('Errore durante il recupero della potenza totale di mining del server:', error);
    }
  };

  const fetchEstimatedRewards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tc/estimated-rewards`, { params: { username: user } });
      setEstimatedRewards(response.data || { tc: 0, satoshi: 0 });
    } catch (error) {
      console.error('Errore durante il recupero delle ricompense stimate:', error);
    }
  };

  const addToMiningZone = async (dragonId) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/add-to-mining-zone`, { username: user, dragonId });
      fetchMiningZone();
      fetchDragons();
      fetchTotalServerMiningPower();
      fetchEstimatedRewards();
    } catch (error) {
      console.error('Errore durante l\'aggiunta del drago alla zona mining:', error);
      alert('Errore durante l\'aggiunta del drago alla zona mining');
    }
  };

  const removeFromMiningZone = async (dragonId) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/remove-from-mining-zone`, { username: user, dragonId });
      fetchMiningZone();
      fetchDragons();
      fetchTotalServerMiningPower();
      fetchEstimatedRewards();
    } catch (error) {
      console.error('Errore durante la rimozione del drago dalla zona mining:', error);
      alert('Errore durante la rimozione del drago dalla zona mining');
    }
  };

  const calculateTotalMiningPower = (dragonsInZone) => {
    let totalPower = 0;
    let totalBonus = 0;

    dragonsInZone.forEach(dragon => {
      totalBonus += dragon.bonus;
    });

    dragonsInZone.forEach(dragon => {
      totalPower += dragon.miningPower * (1 + totalBonus / 100);
    });

    setTotalMiningPower(totalPower);
  };

  const formatMiningPower = (power) => {
    if (power >= 1e21) return (power / 1e21).toFixed(2) + ' ZH';
    if (power >= 1e18) return (power / 1e18).toFixed(2) + ' EH';
    if (power >= 1e15) return (power / 1e15).toFixed(2) + ' PH';
    if (power >= 1e12) return (power / 1e12).toFixed(2) + ' TH';
    if (power >= 1e9) return (power / 1e9).toFixed(2) + ' GH';
    if (power >= 1e6) return (power / 1e6).toFixed(2) + ' MH';
    if (power >= 1e3) return (power / 1e3).toFixed(2) + ' KH';
    return power.toFixed(2) + ' H';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {!user ? (
        <div className="flex flex-col items-center gap-4 mt-10">
          <h1 className="text-3xl font-bold text-purple-400">Dragon Mining Valley</h1>
          <div className="flex gap-4">
            <a href="/login2">
              <button className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg">
                Entra nel magnifico mondo dei draghi!
              </button>
            </a>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Stats Panel */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="text-sm text-slate-400">My Power</h3>
                <p className="text-xl text-cyan-400">{formatMiningPower(totalMiningPower)}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="text-sm text-slate-400">Network Power</h3>
                <p className="text-xl text-green-400">{formatMiningPower(totalServerMiningPower)}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="text-sm text-slate-400">Your Reward</h3>
                <p className="text-xl text-pink-400">{estimatedRewards.tc} TC</p>
              </div>
            </div>
          </div>

          {/* Timer and Tabs */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <button
                  className={`px-4 py-2 rounded-lg ${selectedTab === 'daily' ? 'bg-purple-500' : 'bg-slate-700'}`}
                  onClick={() => setSelectedTab('daily')}
                >
                  Daily 4/7
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${selectedTab === 'weekly' ? 'bg-purple-500' : 'bg-slate-700'}`}
                  onClick={() => setSelectedTab('weekly')}
                >
                  Weekly 4/5
                </button>
              </div>
              <div className="text-cyan-400">
                Next reward in: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
              </div>
            </div>
          </div>

          {/* Dragons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Dragons */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Available Dragons</h2>
              <div className="grid gap-4">
                {dragons.map(dragon => (
                  <div key={dragon._id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden">
                        <img
                          src={getDragonImage(dragon.name)}
                          alt={dragon.name || 'Unknown Dragon'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{dragon.name}</h3>
                        <p className="text-sm text-cyan-400">{formatMiningPower(dragon.miningPower)}</p>
                        <p className="text-sm text-green-400">+{dragon.bonus}% Bonus</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToMiningZone(dragon._id)}
                      className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg"
                    >
                      Add to Mining
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mining Zone */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Mining Zone</h2>
              <div className="grid gap-4">
                {miningZone.map(dragon => (
                  <div key={dragon._id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden">
                        <img
                          src={getDragonImage(dragon.name)}
                          alt={dragon.name || 'Unknown Dragon'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{dragon.name}</h3>
                        <p className="text-sm text-cyan-400">{formatMiningPower(dragon.miningPower)}</p>
                        <p className="text-sm text-green-400">+{dragon.bonus}% Bonus</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromMiningZone(dragon._id)}
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {miningZone.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    No dragons mining yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;