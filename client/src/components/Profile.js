// client/src/components/Profile.js
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function Profile() {
  const { user } = useContext(AuthContext);
  const [btcAddress, setBtcAddress] = useState('');
  const [btcBalance, setBtcBalance] = useState(0);

  useEffect(() => {
    if (user) {
      axios.post('http://localhost:3000/api/crypto/create-address', { username: user })
        .then(response => setBtcAddress(response.data.btcAddress))
        .catch(error => console.error('Error fetching or creating BTC address:', error));
    }
  }, [user]);

  return (
    <div>
      <h2>Profile</h2>
      {btcAddress ? (
        <>
          <p>Your BTC Address: {btcAddress}</p>
        </>
      ) : (
        <p>Generating your BTC address...</p>
      )}
      <p>Your BTC Balance: {btcBalance} BTC</p>
    </div>
  );
}

export default Profile;
