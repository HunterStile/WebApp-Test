// client/src/components/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tcBalance, setTcBalance] = useState(0);

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:3000/api/tc/balance?username=${user}`)
        .then(response => setTcBalance(response.data.tcBalance))
        .catch(error => console.error('Error fetching TC balance:', error));
    }
  }, [user]);

  const earnTc = async (amount) => {
    try {
      await axios.post('http://localhost:3000/api/tc/earn', { username: user, amount, action: 'completeTask' });
      setTcBalance(tcBalance + amount);
    } catch (error) {
      console.error('Error earning TC:', error);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Your TC Balance: {tcBalance}</p>
      <button onClick={() => earnTc(50)}>Earn 50 TC</button>
    </div>
  );
}

export default Dashboard;

