// client/src/components/Home.js
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

  useEffect(() => {
    if (user) {
      fetchDragons();
      fetchMiningZone();
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

  const addToMiningZone = async (dragonId) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/add-to-mining-zone`, { username: user, dragonId });
      fetchMiningZone(); // Aggiorna la zona mining
      fetchDragons(); // Aggiorna l'inventario
    } catch (error) {
      console.error('Errore durante l\'aggiunta del drago alla zona mining:', error);
      alert('Errore durante l\'aggiunta del drago alla zona mining');
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

  const removeFromMiningZone = async (dragonId) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/remove-from-mining-zone`, { username: user, dragonId });
      fetchMiningZone(); // Aggiorna la zona mining
      fetchDragons(); // Aggiorna l'inventario
    } catch (error) {
      console.error('Errore durante la rimozione del drago dalla zona mining:', error);
      alert('Errore durante la rimozione del drago dalla zona mining');
    }
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
              <div key={dragon._id}> {/* Assicurati di usare dragon._id se è il campo corretto */}
                <span>{dragon.name} - Power: {dragon.miningPower}, Bonus: {dragon.bonus}%</span>
                <button onClick={() => addToMiningZone(dragon._id)}> {/* Assicurati di usare dragon._id qui */}
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
                  <span>{dragon.name} - Mining Power: {dragon.miningPower}, Bonus: {dragon.bonus}%</span>
                  <button onClick={() => removeFromMiningZone(dragon._id)}>Remove from Mining Zone</button>
                </div>
              ))}
              <h3>Total Mining Power: {totalMiningPower}</h3>
            </>
          ) : (
            <p>No dragons in the mining zone.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
