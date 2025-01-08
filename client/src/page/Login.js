import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import homeimage from "../assets/images/home1.png"

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
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      if (isRegister) {
        await register(formData);
        setIsRegister(false);
      } else {
        await login(formData.username, formData.password);
        navigate('/');
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
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center bg-white order-2 md:order-1">
        <div className="w-full max-w-md">
          <div className="rounded-[18px] w-full flex flex-col items-center gap-1.5 bg-gray-100 p-4 md:p-6 shadow-xs">
            <div className="flex flex-col items-center w-full">
              <h1 className="text-6xl md:text-6xl font-semibold mb-6 md:mb-8 text-[#1e1e1e] text-center">
                {isRegister ? 'Sign up' : 'Log in'}
              </h1>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 w-full">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 w-full">
                {isRegister && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
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
                        className="w-full p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
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
                  className="w-full p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                />

                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
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
                      className="w-full p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                    />

                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-[#CDE1DE] border-0 placeholder-gray-500"
                    />

                    <select
                      name="language"
                      required
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-[#CDE1DE] border-0 text-gray-500"
                    >
                      <option value="">Select Language</option>
                      {languageOptions.map(option => (
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
                          className="rounded border-gray-300"
                        />
                        <span>I accept the terms and conditions</span>
                      </label>

                      <label className="flex items-center space-x-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          name="newsletterSubscription"
                          checked={formData.newsletterSubscription}
                          onChange={handleInputChange}
                          className="rounded border-gray-300"
                        />
                        <span>Subscribe to newsletter</span>
                      </label>
                    </div>

                    <div className="w-full flex justify-center">
                      <div className="transform scale-90 md:scale-100">
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey="6Le7rq4qAAAAAIscf8sTUGkNE8UTWBWNeTN4XEaQ"
                          onChange={handleCaptchaChange}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-center w-full">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors shadow-[0_0_10px_rgba(28,75,67,0.5)]"
                  >
                    {isRegister ? 'Create Account' : 'Login'}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-gray-600">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
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
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center order-1 md:order-2">
        <img
          src={homeimage}
          alt="Welcome illustration"
          className="max-w-full md:max-w-md w-full object-contain"
        />
      </div>
    </div>
  );
}

export default Auth;