// client/src/components/Dashboard.js
import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';  // Importa la base URL

function Dashboard() {
  const { user, setTcBalance } = useContext(AuthContext);
  const [btcAddress, setBtcAddress] = useState(''); // Stato per l'indirizzo BTC

  const earnTc = async (amount) => {
    try {
      await axios.post(`${API_BASE_URL}/tc/earn`, { username: user, amount, action: 'completeTask' });  // Usa la base URL
      setTcBalance(prevBalance => prevBalance + amount);
    } catch (error) {
      console.error('Error earning TC:', error);
    }
  };

  const requestSatoshis = async () => {
    try {
      if (!btcAddress) {
        console.error('BTC address is required.');
        return;
      }

      // Richiede 100000 satoshi dal faucet
      const faucetResponse = await axios.post(`${API_BASE_URL}/crypto/request-faucet`, {
        address: btcAddress,
        amount: 100000, // 100,000 satoshi
      });

      console.log('Faucet request successful:', faucetResponse.data.message);
    } catch (error) {
      console.error('Error requesting satoshis:', error);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => earnTc(50)}>Earn 50 TC</button>
      <div>
        <label htmlFor="btcAddress">BTC Address:</label>
        <input
          id="btcAddress"
          type="text"
          value={btcAddress}
          onChange={(e) => setBtcAddress(e.target.value)} // Aggiorna lo stato con il valore dell'input
        />
        <button onClick={requestSatoshis}>Request 100,000 Satoshis</button>
      </div>
    </div>
  );
}

export default Dashboard;