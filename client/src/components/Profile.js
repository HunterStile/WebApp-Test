// client/src/components/Profile.js
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';  // Importa la base URL

function Profile() {
  const { user } = useContext(AuthContext);
  const [btcAddress, setBtcAddress] = useState('');

  useEffect(() => {
    if (user) {
      axios.post(`${API_BASE_URL}/crypto/create-address`, { username: user })  // Usa la base URL
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
      
    </div>
  );
}

export default Profile;
