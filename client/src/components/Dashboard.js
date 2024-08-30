import React, { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user, setTcBalance } = useContext(AuthContext);

  const earnTc = async (amount) => {
    try {
      await axios.post(' https://nearby-moving-amoeba.ngrok-free.app/api/tc/earn', { username: user, amount, action: 'completeTask' });
      setTcBalance(prevBalance => prevBalance + amount);
    } catch (error) {
      console.error('Error earning TC:', error);
    }
  };

  const requestSatoshis = async (address) => {
    try {
      if (!address) {
        console.error('BTC address is required.');
        return;
      }

      // Richiede 100000 satoshi dal faucet
      const faucetResponse = await axios.post(' https://nearby-moving-amoeba.ngrok-free.app/api/crypto/request-faucet', {
        address: address,
        amount: 100000, // 100,000 satoshi
      });

      console.log('Faucet request successful:', faucetResponse.data.message);
    } catch (error) {
      console.error('Error requesting satoshis:', error);
    }
  };

  // Questo valore deve essere preso da un input dell'utente o dallo stato dell'applicazione
  const btcAddress = 'BypsXRmghH7BpXz7r1FMCZCxWj5PkSvqG5'; // Sostituisci con il valore reale

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => earnTc(50)}>Earn 50 TC</button>
      <button onClick={() => requestSatoshis(btcAddress)}>Request 100,000 Satoshis</button>
    </div>
  );
}

export default Dashboard;