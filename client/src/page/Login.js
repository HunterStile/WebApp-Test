// Auth.js
import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LockIcon, UserIcon, MailIcon, Globe, Type } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirmation: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    language: '',
    acceptedTerms: false,
    newsletterSubscription: false,
    captcha: '',
  });

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Resetta l'errore quando l'utente inizia a modificare i campi
    setError('');
  };

  const handleCaptchaChange = (value) => {
    setFormData(prev => ({ ...prev, captcha: value }));
  };

  const validateForm = () => {
    if (isRegister) {
      if (formData.password !== formData.passwordConfirmation) {
        alert('Le password non coincidono');
        return false;
      }
      if (!formData.captcha) {
        alert('Per favore completa il captcha');
        return false;
      }
      if (!formData.acceptedTerms) {
        alert('Devi accettare i termini e le condizioni');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');   // Reset error on new submission
    if (!validateForm()) return;

    try {
      if (isRegister) {
        await register({
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          country: formData.country,
          language: formData.language,
          acceptedTerms: formData.acceptedTerms,
          newsletterSubscription: formData.newsletterSubscription,
          captcha: formData.captcha
        });
        setIsRegister(false);
      } else {
        await login(formData.username, formData.password);
        navigate('/');
      }
    } catch (error) {
      // Gestione degli errori più dettagliata
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError(isRegister ? 'Errore durante la registrazione' : 'Login fallito');
        // Resetta il token reCAPTCHA
        setFormData({ ...formData, captcha: '' });
      }
      recaptchaRef.current.reset(); // Resetta il widget reCAPTCHA
    }
  };

  const languageOptions = [
    { value: 'it', label: 'Italiano' },
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
  ];

  return (
    <div className="container-auth">
      <div className="form-wrapper">
        <h2 className="form-title">{isRegister ? 'Registrati' : 'Login'}</h2>

        {/* Aggiungiamo il box per mostrare gli errori */}
        {error && (
          <div className="text-red-600 bg-red-50 px-3 py-3 mb-4 rounded-md text-center">
            {error}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <UserIcon className="icon" />
              <input
                type="text"
                name="username"
                required
                className="input"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-wrapper">
              <LockIcon className="icon" />
              <input
                type="password"
                name="password"
                required
                className="input"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            {isRegister && (
              <>
                <div className="input-wrapper">
                  <LockIcon className="icon" />
                  <input
                    type="password"
                    name="passwordConfirmation"
                    required
                    className="input"
                    placeholder="Conferma Password"
                    value={formData.passwordConfirmation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-wrapper">
                  <Type className="icon" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="input"
                    placeholder="Nome"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-wrapper">
                  <Type className="icon" />
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="input"
                    placeholder="Cognome"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-wrapper">
                  <MailIcon className="icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="input"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-wrapper">
                  <Globe className="icon" />
                  <input
                    type="text"
                    name="country"
                    required
                    className="input"
                    placeholder="Paese di residenza"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-wrapper">
                  <Globe className="icon" />
                  <select
                    name="language"
                    required
                    className="input"
                    value={formData.language}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleziona lingua</option>
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="captcha-wrapper">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6Le7rq4qAAAAAIscf8sTUGkNE8UTWBWNeTN4XEaQ"
                    onChange={handleCaptchaChange}
                  />
                </div>

                <div className="checkbox-wrapper">
                  <label>
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      required
                      checked={formData.acceptedTerms}
                      onChange={handleInputChange}
                    />
                    Accetto i termini, la privacy policy e i cookie
                  </label>
                </div>

                <div className="checkbox-wrapper">
                  <label>
                    <input
                      type="checkbox"
                      name="newsletterSubscription"
                      checked={formData.newsletterSubscription}
                      onChange={handleInputChange}
                    />
                    Iscriviti alla newsletter
                  </label>
                </div>
              </>
            )}
          </div>

          <button type="submit" className="submit-button">
            {isRegister ? 'Registrati' : 'Login'}
          </button>
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