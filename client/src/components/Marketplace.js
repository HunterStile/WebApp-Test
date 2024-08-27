// client/src/components/Marketplace.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Marketplace() {
  const { user } = useContext(AuthContext);
  const [tcBalance, setTcBalance] = useState(0);
  const [boxType, setBoxType] = useState(null);
  const [loading, setLoading] = useState(false);
  const boxCost = 10; // Costo per aprire una mistery box

  // Funzione per aprire una mistery box
  const openMysteryBox = async () => {
    if (tcBalance < boxCost) {
      alert('Insufficient TC');
      return;
    }

    setLoading(true);

    try {
      // Deduct TC and get the result
      await axios.post('http://localhost:3000/api/tc/earn', { username: user, amount: -boxCost, action: 'purchaseMysteryBox' });
      setTcBalance(tcBalance - boxCost);

      // Determine the type of box received
      const result = getRandomBoxType();
      setBoxType(result);
    } catch (error) {
      console.error('Error opening mystery box:', error);
    }

    setLoading(false);
  };

  // Funzione per ottenere un tipo di box casuale
  const getRandomBoxType = () => {
    const random = Math.random() * 100;
    if (random < 1) return 'legendary';
    if (random < 5) return 'epic';
    if (random < 14) return 'rare';
    if (random < 40) return 'uncommon';
    return 'common';
  };

  // Fetch user TC balance on component mount
  useState(() => {
    if (user) {
      axios.get(`http://localhost:3000/api/tc/balance?username=${user}`)
        .then(response => setTcBalance(response.data.tcBalance))
        .catch(error => console.error('Error fetching TC balance:', error));
    }
  }, [user]);

  return (
    <div>
      <h2>Marketplace</h2>
      <p>Your TC Balance: {tcBalance}</p>
      <button onClick={openMysteryBox} disabled={loading}>
        {loading ? 'Opening...' : `Open Mystery Box (${boxCost} TC)`}
      </button>
      {boxType && <p>You received a {boxType} box!</p>}
    </div>
  );
}

export default Marketplace;
