import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LockIcon, UserIcon } from 'lucide-react';

function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Usa la funzione `register` dal contesto
        await register(username, password);
        setIsRegister(false); // Torna al form di login dopo la registrazione
      } else {
        // Usa la funzione `login` dal contesto
        await login(username, password);
        navigate('/'); // Reindirizza alla homepage dopo il login
      }
    } catch (error) {
      alert(isRegister ? 'Registrazione fallita' : 'Login fallito');
    }
  };

  return (
    <div className="container-auth">
      <div className="form-wrapper">
        <div>
          <h2 className="form-title">{isRegister ? 'Registrati' : 'Login'}</h2>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <UserIcon className="icon" />
              <input
                type="text"
                required
                className="input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-wrapper">
              <LockIcon className="icon" />
              <input
                type="password"
                required
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
  
          <div>
            <button type="submit" className="submit-button">
              {isRegister ? 'Registrati' : 'Login'}
            </button>
          </div>
        </form>
  
        <div className="toggle-text">
          <p>
            {isRegister ? 'Hai già un account?' : 'Non hai un account?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="toggle-button"
            >
              {isRegister ? 'Login' : 'Registrati'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
