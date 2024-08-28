import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user, setTcBalance } = useContext(AuthContext);

  const earnTc = async (amount) => {
    try {
      await axios.post('http://localhost:3000/api/tc/earn', { username: user, amount, action: 'completeTask' });
      setTcBalance(prevBalance => prevBalance + amount);
    } catch (error) {
      console.error('Error earning TC:', error);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => earnTc(50)}>Earn 50 TC</button>
    </div>
  );
}

export default Dashboard;
