import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardCheck, ChefHat, BarChart2, Droplet, CheckCircle, AlertCircle, Home, ArrowLeft, Leaf } from 'lucide-react';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  });

  const countryOptions = [
    { value: 'AF', label: 'Afghanistan' },
    { value: 'IT', label: 'Italia' },
    // ... rest of the country options remain the same
  ].sort((a, b) => a.label.localeCompare(b.label));

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (isRegister) {
      if (formData.password !== formData.passwordConfirmation) {
        setError('Le password non coincidono');
        return false;
      }
      if (!formData.acceptedTerms) {
        setError('Devi accettare i termini e le condizioni');
        return false;
      }
      // Validazione campi obbligatori per la registrazione
      const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email', 'language', 'country'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          setError('Tutti i campi sono obbligatori');
          return false;
        }
      }
    } else {
      // Validazione campi obbligatori per il login
      if (!formData.username || !formData.password) {
        setError('Username e password sono obbligatori');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

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
        });
        setSuccess('Account creato con successo! Reindirizzamento al login...');
        setTimeout(() => {
          setIsRegister(false);
          setSuccess('');
        }, 2000);
      } else {
        await login(formData.username, formData.password);
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(isRegister ? 'Errore durante la registrazione' : 'Login fallito');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const languageOptions = [
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header per navigazione */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 h-8 w-8 rounded-md flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="font-bold text-primary-800 text-xl">HACCP Sistema</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Torna alla home</span>
          </Link>
        </div>
      </header>

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        {/* Form Section */}
        <div className="w-full md:w-full lg:w-1/2 flex items-center justify-center order-2 md:order-1">
          <div className="w-full max-w-2xl mx-auto px-4 py-8 md:px-8">
            <div className="flex flex-col items-center gap-1.5 rounded-lg bg-white p-6 md:p-8 shadow-md">
              <div className="flex flex-col items-center w-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 mt-4 md:mb-8 md:mt-6 text-primary-800 text-center">
                  {isRegister ? 'Registrazione' : 'Accesso'}
                </h1>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 w-full flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 w-full flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 sm:mx-9 ">
                    {isRegister && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            name="firstName"
                            required
                            placeholder="Nome"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="lastName"
                            required
                            placeholder="Cognome"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    )}

                    <input
                      type="text"
                      name="username"
                      required
                      placeholder="Nome utente"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 placeholder-gray-500"
                    />

                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 placeholder-gray-500"
                    />

                    {isRegister && (
                      <>
                        <input
                          type="password"
                          name="passwordConfirmation"
                          required
                          placeholder="Conferma Password"
                          value={formData.passwordConfirmation}
                          onChange={handleInputChange}
                          className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 placeholder-gray-500"
                        />

                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 placeholder-gray-500"
                        />

                        <select
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-gray-500"
                        >
                          <option value="">Seleziona Paese</option>
                          {countryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <select
                          name="language"
                          required
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full h-[50px] p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-gray-500"
                        >
                          <option value="">Seleziona Lingua</option>
                          {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              name="acceptedTerms"
                              checked={formData.acceptedTerms}
                              onChange={handleInputChange}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span>Accetto i termini e le condizioni</span>
                          </label>

                          <label className="flex items-center space-x-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              name="newsletterSubscription"
                              checked={formData.newsletterSubscription}
                              onChange={handleInputChange}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span>Iscriviti alla newsletter</span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-center w-full">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="md:w-1/2 mt-5 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {isRegister
                            ? 'Creazione account...'
                            : 'Accesso in corso...'}
                        </>
                      ) : isRegister ? (
                        'Crea Account'
                      ) : (
                        'Accedi'
                      )}
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-center text-gray-600">
                  {isRegister
                    ? 'Hai già un account?'
                    : "Non hai un account?"}{' '}
                  <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    {isRegister ? 'Accedi' : 'Registrati'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Illustration Section - Ripristinato */}
        <div className="hidden lg:w-1/2 p-8 lg:flex lg:items-center lg:justify-center bg-primary-50 order-1 lg:order-3">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary-800 mb-4">Sistema HACCP</h2>
              <p className="text-gray-600">Gestione sicura della qualità alimentare</p>
            </div>
            
            <svg 
              viewBox="0 0 800 600" 
              className="mx-auto w-full max-w-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Circle */}
              <circle cx="400" cy="300" r="250" fill="#f0f9ff" />
              
              {/* Document Icon - Represents Documentation */}
              <g transform="translate(300, 180) scale(1.2)">
                <rect x="0" y="0" width="160" height="200" rx="10" fill="#ffffff" stroke="#3b82f6" strokeWidth="4" />
                <rect x="20" y="30" width="120" height="10" rx="2" fill="#dbeafe" />
                <rect x="20" y="50" width="120" height="10" rx="2" fill="#dbeafe" />
                <rect x="20" y="70" width="80" height="10" rx="2" fill="#dbeafe" />
                <rect x="20" y="100" width="120" height="10" rx="2" fill="#dbeafe" />
                <rect x="20" y="120" width="120" height="10" rx="2" fill="#dbeafe" />
                <rect x="20" y="140" width="60" height="10" rx="2" fill="#dbeafe" />
                
                {/* Checkmarks */}
                <circle cx="35" cy="175" r="15" fill="#16a34a" />
                <path d="M28 175 L33 180 L42 170" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                <circle cx="85" cy="175" r="15" fill="#16a34a" />
                <path d="M78 175 L83 180 L92 170" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                <circle cx="135" cy="175" r="15" fill="#16a34a" />
                <path d="M128 175 L133 180 L142 170" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
              
              {/* HACCP Logo Elements */}
              <g transform="translate(400, 170)">
                <circle cx="0" cy="0" r="80" fill="#3b82f6" opacity="0.2" />
                <path d="M-50,0 L50,0 M0,-50 L0,50" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                <circle cx="0" cy="0" r="20" fill="#3b82f6" />
              </g>
              
              {/* Chef Hat - Represents Food Industry */}
              <g transform="translate(560, 240) scale(0.15)">
                <path d="M300,500 C100,500 0,400 0,300 C0,200 100,150 150,150 C150,50 200,0 300,0 C400,0 450,50 450,150 C500,150 600,200 600,300 C600,400 500,500 300,500 Z" fill="#ffffff" stroke="#475569" strokeWidth="20" />
                <rect x="200" y="450" width="200" height="100" rx="10" fill="#ffffff" stroke="#475569" strokeWidth="20" />
              </g>
              
              {/* Water Drop - Represents Cleanliness */}
              <g transform="translate(250, 280) scale(0.8)">
                <path d="M0,0 C0,0 -50,-100 -50,-150 C-50,-200 0,-200 0,-150 C0,-200 50,-200 50,-150 C50,-100 0,0 0,0 Z" fill="#38bdf8" />
              </g>
              
              {/* Chart - Represents Analysis and Monitoring */}
              <g transform="translate(450, 440) scale(0.8)">
                <rect x="-60" y="-80" width="120" height="80" rx="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                <rect x="-50" y="-70" width="20" height="60" fill="#a5b4fc" />
                <rect x="-20" y="-50" width="20" height="40" fill="#818cf8" />
                <rect x="10" y="-60" width="20" height="50" fill="#6366f1" />
                <rect x="40" y="-40" width="20" height="30" fill="#4f46e5" />
              </g>
              
              {/* Temperature Icon - Critical Control Points */}
              <g transform="translate(320, 420) scale(0.6)">
                <circle cx="0" cy="0" r="40" fill="#ffffff" stroke="#f43f5e" strokeWidth="5" />
                <rect x="-5" y="-30" width="10" height="45" rx="5" fill="#f43f5e" />
                <circle cx="0" cy="20" r="15" fill="#f43f5e" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;