// client/src/components/Home.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importa AuthContext

function Home() {
  const { user } = useContext(AuthContext); // Usa il contesto per ottenere l'utente

  return (
    <div>
      <h1>Home Page</h1>
      {!user && (
        <>
          <Link to="/register">
            <button>Register</button>
          </Link>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </>
      )}
      <Link to="/about">
        <button>Go to About Page</button>
      </Link>
    </div>
  );
}

export default Home;
