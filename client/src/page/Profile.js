import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';  // Importa il contesto
import API_BASE_URL from '../config';

const ProfilePage = () => {
  const { user } = useContext(AuthContext); // Ottieni l'utente dal contesto
  const [profile, setProfile] = useState({});
  const [paypalAddress, setPaypalAddress] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('paypal'); // Stato per il metodo selezionato
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/auth/profile?username=${user}`)
        .then((response) => {
          setProfile(response.data.user);
          setPaypalAddress(response.data.user.paypalAddress || '');
          setBitcoinAddress(response.data.user.bitcoinAddress || '');
          setSelectedMethod(response.data.user.paymentMethod || 'paypal'); // Imposta il metodo di pagamento
        })
        .catch((error) => {
          console.error('Errore nel recupero del profilo:', error);
        });
    }
  }, [user]);

  const handleUpdate = () => {
    if (!user) {
      setMessage('Devi essere loggato per aggiornare il profilo');
      return;
    }

    axios.put(`${API_BASE_URL}/auth/profile`, {
      username: user,
      paypalAddress,
      bitcoinAddress,
      paymentMethod: selectedMethod, // Invia il metodo selezionato
    })
      .then((response) => {
        setMessage('Profilo aggiornato con successo!');
        setProfile(response.data.user);
      })
      .catch((error) => {
        console.error('Errore nell\'aggiornamento del profilo:', error);
        setMessage('Errore durante l\'aggiornamento del profilo');
      });
  };

  if (!user) {
    return <p>Devi essere loggato per visualizzare e aggiornare il tuo profilo.</p>;
  }

  return (
    <div>
      <h1>Profilo Utente</h1>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Nome:</strong> {profile.firstName} {profile.lastName}</p>

      <div>
        <label>
          Metodo di pagamento:
          <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
            <option value="paypal">PayPal</option>
            <option value="bitcoin">Bitcoin</option>
          </select>
        </label>
      </div>

      {selectedMethod === 'paypal' && (
        <div>
          <label>
            Indirizzo PayPal:
            <input
              type="email"
              value={paypalAddress}
              onChange={(e) => setPaypalAddress(e.target.value)}
            />
          </label>
        </div>
      )}

      {selectedMethod === 'bitcoin' && (
        <div>
          <label>
            Indirizzo Bitcoin:
            <input
              type="text"
              value={bitcoinAddress}
              onChange={(e) => setBitcoinAddress(e.target.value)}
            />
          </label>
        </div>
      )}

      <button onClick={handleUpdate}>Aggiorna Profilo</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ProfilePage;
