import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import homeimage from "../assets/images/home1.png"

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
    captcha: '',
  });

  const countryOptions = [
    { value: 'AF', label: 'Afghanistan' },
    { value: 'AL', label: 'Albania' },
    { value: 'DZ', label: 'Algeria' },
    { value: 'AD', label: 'Andorra' },
    { value: 'AO', label: 'Angola' },
    { value: 'AR', label: 'Argentina' },
    { value: 'AM', label: 'Armenia' },
    { value: 'AU', label: 'Australia' },
    { value: 'AT', label: 'Austria' },
    { value: 'AZ', label: 'Azerbaijan' },
    { value: 'BS', label: 'Bahamas' },
    { value: 'BH', label: 'Bahrain' },
    { value: 'BD', label: 'Bangladesh' },
    { value: 'BE', label: 'Belgium' },
    { value: 'BR', label: 'Brazil' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'CA', label: 'Canada' },
    { value: 'CL', label: 'Chile' },
    { value: 'CN', label: 'China' },
    { value: 'CO', label: 'Colombia' },
    { value: 'HR', label: 'Croatia' },
    { value: 'CU', label: 'Cuba' },
    { value: 'CY', label: 'Cyprus' },
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'DK', label: 'Denmark' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'EG', label: 'Egypt' },
    { value: 'EE', label: 'Estonia' },
    { value: 'FI', label: 'Finland' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'GR', label: 'Greece' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'HU', label: 'Hungary' },
    { value: 'IS', label: 'Iceland' },
    { value: 'IN', label: 'India' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'IR', label: 'Iran' },
    { value: 'IQ', label: 'Iraq' },
    { value: 'IE', label: 'Ireland' },
    { value: 'IL', label: 'Israel' },
    { value: 'IT', label: 'Italy' },
    { value: 'JP', label: 'Japan' },
    { value: 'KR', label: 'Korea, South' },
    { value: 'KW', label: 'Kuwait' },
    { value: 'LV', label: 'Latvia' },
    { value: 'LB', label: 'Lebanon' },
    { value: 'LI', label: 'Liechtenstein' },
    { value: 'LT', label: 'Lithuania' },
    { value: 'LU', label: 'Luxembourg' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'MT', label: 'Malta' },
    { value: 'MX', label: 'Mexico' },
    { value: 'MC', label: 'Monaco' },
    { value: 'MA', label: 'Morocco' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'NO', label: 'Norway' },
    { value: 'PK', label: 'Pakistan' },
    { value: 'PE', label: 'Peru' },
    { value: 'PH', label: 'Philippines' },
    { value: 'PL', label: 'Poland' },
    { value: 'PT', label: 'Portugal' },
    { value: 'QA', label: 'Qatar' },
    { value: 'RO', label: 'Romania' },
    { value: 'RU', label: 'Russia' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'SG', label: 'Singapore' },
    { value: 'SK', label: 'Slovakia' },
    { value: 'SI', label: 'Slovenia' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'ES', label: 'Spain' },
    { value: 'SE', label: 'Sweden' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'TW', label: 'Taiwan' },
    { value: 'TH', label: 'Thailand' },
    { value: 'TR', label: 'Turkey' },
    { value: 'UA', label: 'Ukraine' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'US', label: 'United States' },
    { value: 'UY', label: 'Uruguay' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'VN', label: 'Vietnam' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleCaptchaChange = (value) => {
    setFormData(prev => ({ ...prev, captcha: value }));
  };

  const validateForm = () => {
    if (isRegister) {
      if (formData.password !== formData.passwordConfirmation) {
        setError('Le password non coincidono');
        return false;
      }
      if (!formData.captcha) {
        setError('Per favore completa il captcha');
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
          captcha: formData.captcha
        });
        setSuccess('Account created successfully! Redirecting to login...');
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
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-full lg:w-1/2 flex items-center justify-center bg-white order-2 md:order-1">
        <div className="w-full max-w-2xl mx-auto px-4 py-8 md:px-8">
          <div className="flex flex-col items-center gap-1.5 rounded-[18px] bg-gray-100 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col items-center w-full">
              <h1 className="text-3xl md:text-6xl font-semibold mb-4 mt-4 md:mb-8 md:mt-6 text-[#1e1e1e] text-center">
                {isRegister ? 'Sign up' : 'Log in'}
              </h1>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 w-full">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 w-full">
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
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="lastName"
                          required
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                  />

                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                  />

                  {isRegister && (
                    <>
                      <input
                        type="password"
                        name="passwordConfirmation"
                        required
                        placeholder="Confirm Password"
                        value={formData.passwordConfirmation}
                        onChange={handleInputChange}
                        className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                      />

                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                      />

                      <select
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 text-gray-500"
                      >
                        <option value="">Select Country</option>
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
                        className="w-full h-[50px] p-3 rounded-lg bg-[#CDE1DE] border-0 text-gray-500"
                      >
                        <option value="">Select Language</option>
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
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span>I accept the terms and conditions</span>
                        </label>

                        <label className="flex items-center space-x-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            name="newsletterSubscription"
                            checked={formData.newsletterSubscription}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span>Subscribe to newsletter</span>
                        </label>
                      </div>

                      <div className="w-full flex justify-center">
                        <div className="transform scale-75">
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="6Le7rq4qAAAAAIscf8sTUGkNE8UTWBWNeTN4XEaQ"
                            onChange={handleCaptchaChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-center w-full">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="md:w-1/2 mt-5 py-3 px-4 bg-[#1F2421] text-white rounded-lg hover:bg-gray-800 font-medium transition-colors shadow-[0_0_10px_rgba(28,75,67,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                          ? 'Creating Account...'
                          : 'Logging in...'}
                      </>
                    ) : isRegister ? (
                      'Create Account'
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>

              </form>

              <p className="mt-6 text-center text-gray-600">
                {isRegister
                  ? 'Already have an account?'
                  : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-[#1C4B43] hover:underline"
                >
                  {isRegister ? 'Log in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden lg:w-1/2 lg:p-8 lg:flex lg:items-center lg:justify-center order-1 lg:order-3">
        <img
          src={homeimage}
          alt="Welcome illustration"
          className="min-w-[110%] lg:max-w-md w-full object-contain"
        />
      </div>
    </div>
  );
}

export default Auth;