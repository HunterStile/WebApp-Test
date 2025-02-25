import React, { useState } from 'react';
import Header from '../components/Header';
import contactus from '../assets/images/contactus.png';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Messaggio inviato con successo! Ti risponderemo presto.'
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error(data.error || 'Errore nell\'invio del messaggio');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Si è verificato un errore. Riprova più tardi.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App min-h-screen bg-white text-black transition-colors duration-300">
      <Header />
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-7xl bg-white text-gray-900 p-8 rounded-lg flex gap-x-12">
          <div className="w-1/2">
            <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
            <p className="mb-6">We are here for you! How can we help?</p>

            {status.message && (
              <div className={`mb-6 p-4 rounded-md ${
                status.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="message" className="block font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800'
                } text-white font-medium rounded-md px-4 py-2 transition-colors w-full sm:w-auto`}
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>
          <div className="w-1/2 flex justify-center items-center">
            <img
              src={contactus}
              alt="Contact form illustration"
              className="max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;