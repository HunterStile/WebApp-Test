import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import dragonImages from '../utils/dragonImages';

function Home() {
  const { user } = useContext(AuthContext);
  const [dragons, setDragons] = useState([]);
  const [miningZone, setMiningZone] = useState([]);
  const [totalMiningPower, setTotalMiningPower] = useState(0);
  const [totalServerMiningPower, setTotalServerMiningPower] = useState(0);
  const [estimatedRewards, setEstimatedRewards] = useState({ tc: 0, satoshi: 0 });
  const [timer, setTimer] = useState(0); // Aggiungi lo stato per il timer

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
    <div className="home-container">
      <h1 className="title">Home Page</h1>
      
      {!user && (
        <div className="auth-buttons">
          <Link to="/register">
            <button className="button button-primary">Register</button>
          </Link>
          <Link to="/login2">
            <button className="button button-secondary">Login</button>
          </Link>
        </div>
      )}
      
      <Link to="/about">
        <button className="button button-gray">Go to About Page</button>
      </Link>

      {user && (
        <div>
          <section className="section">
            <h2 className="section-title">Your Dragons</h2>
            {dragons.length > 0 ? (
              <div className="dragon-list">
                {dragons.map(dragon => {
                  const imageName = dragon.name
                    ? `${dragon.name.toLowerCase().replace(/ /g, '-')}.png`
                    : 'default-dragon.png';
                  const image = dragonImages[imageName];
                  
                  return (
                    <div key={dragon._id} className="dragon-card">
                      <img 
                        src={image} 
                        alt={dragon.name || 'Unknown Dragon'} 
                        className="dragon-image"
                      />
                      <div className="dragon-info">
                        <p className="dragon-name">{dragon.name}</p>
                        <p>Power: {formatMiningPower(dragon.miningPower)}</p>
                        <p>Bonus: {dragon.bonus}%</p>
                      </div>
                      <button 
                        onClick={() => addToMiningZone(dragon._id)}
                        className="button button-primary"
                      >
                        Add to Mining Zone
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No dragons available.</p>
            )}
          </section>

          <section className="section">
            <h2 className="section-title">Mining Zone</h2>
            {miningZone.length > 0 ? (
              <div className="dragon-list">
                {miningZone.map(dragon => {
                  const imageName = dragon.name
                    ? `${dragon.name.toLowerCase().replace(/ /g, '-')}.png`
                    : 'default-dragon.png';
                  const image = dragonImages[imageName];
                  
                  return (
                    <div key={dragon._id} className="dragon-card">
                      <img 
                        src={image} 
                        alt={dragon.name || 'Unknown Dragon'} 
                        className="dragon-image"
                      />
                      <div className="dragon-info">
                        <p className="dragon-name">{dragon.name}</p>
                        <p>Mining Power: {formatMiningPower(dragon.miningPower)}</p>
                        <p>Bonus: {dragon.bonus}%</p>
                      </div>
                      <button 
                        onClick={() => removeFromMiningZone(dragon._id)}
                        className="button button-danger"
                      >
                        Remove from Mining Zone
                      </button>
                    </div>
                  );
                })}
                
                <div className="stats-box">
                  <p className="stats-item">
                    Total Mining Power: {formatMiningPower(totalMiningPower)}
                  </p>
                </div>
              </div>
            ) : (
              <p>No dragons in the mining zone.</p>
            )}
          </section>

          <div className="stats-box">
            <p className="stats-item">
              Total Server Mining Power: {formatMiningPower(totalServerMiningPower)}
            </p>
            <p className="stats-item">
              Next Rewards in: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
            </p>
            <p className="stats-item">
              Estimated Rewards: {estimatedRewards.tc} TC, {estimatedRewards.satoshi} Satoshi
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
