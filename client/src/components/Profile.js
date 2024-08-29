// client/src/components/Profile.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function Profile() {
  const { user } = useContext(AuthContext);
  const [btcAddress, setBtcAddress] = useState('');
  const [btcBalance, setBtcBalance] = useState(0);

  const generateAddress = () => {
    axios.post('http://localhost:3000/api/crypto/create-address', { username: user })
      .then(response => setBtcAddress(response.data.btcAddress))
      .catch(error => console.error('Error creating BTC address:', error));
  };

  return (
    <div>
      <h2>Profile</h2>
      {btcAddress ? (
        <>
          <p>Your BTC Address: {btcAddress}</p>
        </>
      ) : (
        <button onClick={generateAddress}>Generate BTC Address</button>
      )}
      <p>Your BTC Balance: {btcBalance} BTC</p>
    </div>
  );
}

export default Profile;
