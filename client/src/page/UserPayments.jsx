import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';  // Importa il contesto

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext); // Ottieni l'utente dal contesto
  
  const username = user;
  
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/payments/${username}`);
        setPayments(response.data);
      } catch (err) {
        setError('Errore nel recupero dei pagamenti');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [username]);
  
  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Pagamenti Effettuati</h1>
      {payments.length === 0 ? (
        <p>Nessun pagamento trovato.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Importo</th>
              <th>Valuta</th>
              <th>Metodo</th>
              <th>Stato</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.amount}</td>
                <td>{payment.currency}</td>
                <td>{payment.method}</td>
                <td>{payment.status}</td>
                <td>{new Date(payment.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserPayments;
