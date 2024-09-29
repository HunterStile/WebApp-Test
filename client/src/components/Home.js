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
    } catch (error) {
      console.error('Errore durante l\'aggiunta del drago alla zona mining:', error);
      alert('Errore durante l\'aggiunta del drago alla zona mining');
    }
  };

  const calculateTotalMiningPower = (dragonsInZone) => {
    let totalPower = 0;
    dragonsInZone.forEach(dragon => {
      totalPower += dragon.miningPower * (1 + dragon.bonus);
    });
    setTotalMiningPower(totalPower);
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
                <span>{dragon.name} - Power: {dragon.miningPower}, Bonus: {dragon.bonus * 100}%</span>
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
                <div key={dragon.id}>
                  <span>{dragon.type} - Mining Power: {dragon.miningPower}, Bonus: {dragon.bonus * 100}%</span>
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
