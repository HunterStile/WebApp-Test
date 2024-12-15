import React, { useState, useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

function AdminAuth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState(''); // Nuova chiave
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(username, password, secretKey);
        // Dopo la registrazione, torna alla pagina di login
        setIsRegister(false); // Cambia stato per passare al login
        setUsername(''); // Resetta il campo username
        setPassword(''); // Resetta il campo password
        setSecretKey(''); // Resetta la chiave segreta
        alert('Registrazione riuscita! Puoi effettuare il login.');
      } else {
        await login(username, password);
        navigate('/admin'); // Reindirizza al pannello admin
      }
    } catch (error) {
      alert('Operazione fallita');
    }
  };

  return (
    <div className="container-auth">
      <form className="form" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Registrati Admin' : 'Login Admin'}</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isRegister && (
          <input
            type="text"
            placeholder="Chiave Segreta"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
        )}
        <button type="submit">{isRegister ? 'Registrati' : 'Login'}</button>
        <button type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Passa a Login' : 'Passa a Registrati'}
        </button>
      </form>
    </div>
  );
}

export default AdminAuth;