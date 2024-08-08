// client/src/components/Home.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Assicurati che il percorso sia corretto

function Home() {
  const { user } = useContext(AuthContext); // Ottieni il valore dell'utente dal contesto

  return (
    <div>
      <h1>Home Page</h1>
      {!user && ( // Mostra il tasto di registrazione solo se l'utente non è autenticato
        <Link to="/register">
          <button>Register</button>
        </Link>
      )}
      <Link to="/login">
        <button>Login</button>
      </Link>
      <Link to="/about">
        <button>Go to About Page</button>
      </Link>
    </div>
  );
}

export default Home;
