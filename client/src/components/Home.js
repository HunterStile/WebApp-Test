import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';

function Home() {
  const { user } = useContext(AuthContext);
  const [dragons, setDragons] = useState([]);
  const [miningZone, setMiningZone] = useState([]);
  const [totalMiningPower, setTotalMiningPower] = useState(0);
  const [totalServerMiningPower, setTotalServerMiningPower] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchDragons();
      fetchMiningZone();
      fetchTotalServerMiningPower(); // Aggiunta per recuperare la potenza di mining totale del server
    }
  }, [user]);

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

  const addToMiningZone = async (dragonId) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/add-to-mining-zone`, { username: user, dragonId });
      fetchMiningZone(); // Aggiorna la zona mining
      fetchDragons(); // Aggiorna l'inventario
      fetchTotalServerMiningPower(); // Aggiorna la potenza totale di mining del server
    } catch (error) {
      console.error('Errore durante l\'aggiunta del drago alla zona mining:', error);
      alert('Errore durante l\'aggiunta del drago alla zona mining');
    }
  };

  const removeFromMiningZone = async (dragonId) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/remove-from-mining-zone`, { username: user, dragonId });
      fetchMiningZone(); // Aggiorna la zona mining
      fetchDragons(); // Aggiorna l'inventario
      fetchTotalServerMiningPower(); // Aggiorna la potenza totale di mining del server
    } catch (error) {
      console.error('Errore durante la rimozione del drago dalla zona mining:', error);
      alert('Errore durante la rimozione del drago dalla zona mining');
    }
  };
  
  const calculateTotalMiningPower = (dragonsInZone) => {
    let totalPower = 0;
    let totalBonus = 0;
  
    // Calcola il bonus totale
    dragonsInZone.forEach(dragon => {
      totalBonus += dragon.bonus;
    });
  
    // Applica il bonus totale alla potenza di ogni drago
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
    <div>
      <h1>Home Page</h1>
      {!user && (
        <>
          <Link to="/register">
            <button>Register</button>
          </Link>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </>
      )}
      <Link to="/about">
        <button>Go to About Page</button>
      </Link>

      {user && (
        <>
          <h2>Your Dragons</h2>
          {dragons.length > 0 ? (
            dragons.map(dragon => (
              <div key={dragon._id}>
                <span>{dragon.name} - Power: {formatMiningPower(dragon.miningPower)}, Bonus: {dragon.bonus}%</span>
                <button onClick={() => addToMiningZone(dragon._id)}>
                  Add to Mining Zone
                </button>
              </div>
            ))
          ) : (
            <p>No dragons available.</p>
          )}

          <h2>Mining Zone</h2>
          {miningZone.length > 0 ? (
            <>
              {miningZone.map(dragon => (
                <div key={dragon._id}>
                  <span>{dragon.name} - Mining Power: {formatMiningPower(dragon.miningPower)}, Bonus: {dragon.bonus}%</span>
                  <button onClick={() => removeFromMiningZone(dragon._id)}>Remove from Mining Zone</button>
                </div>
              ))}
              <h3>Total Mining Power: {formatMiningPower(totalMiningPower)}</h3>
            </>
          ) : (
            <p>No dragons in the mining zone.</p>
          )}

          {/* Visualizza la potenza totale di mining del server */}
          <h3>Total Server Mining Power: {formatMiningPower(totalServerMiningPower)}</h3>
        </>
      )}
    </div>
  );
}

export default Home;
