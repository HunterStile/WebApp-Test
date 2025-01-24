import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [paypalAddress, setPaypalAddress] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('paypal');
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/auth/profile?username=${user}`)
        .then((response) => {
          setProfile(response.data.user);
          setPaypalAddress(response.data.user.paypalAddress || '');
          setBitcoinAddress(response.data.user.bitcoinAddress || '');
          setSelectedMethod(response.data.user.paymentMethod || 'paypal');
        })
        .catch((error) => {
          console.error('Errore nel recupero del profilo:', error);
        });
    }
  }, [user]);

  const handleUpdate = () => {
    if (!user) {
      setMessage('Devi essere loggato per aggiornare il profilo');
      return;
    }

    axios.put(`${API_BASE_URL}/auth/profile`, {
      username: user,
      paypalAddress,
      bitcoinAddress,
      paymentMethod: selectedMethod,
    })
      .then((response) => {
        setMessage('Profilo aggiornato con successo!');
        setProfile(response.data.user);
      })
      .catch((error) => {
        console.error('Errore nell\'aggiornamento del profilo:', error);
        setMessage('Errore durante l\'aggiornamento del profilo');
      });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return <p>Devi essere loggato per visualizzare e aggiornare il tuo profilo.</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full m-auto max-w-custom p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="mb-12">
          <div className="flex space-x-8 border-b">
            <button className="text-green-600 pb-4 border-b-2 border-green-600 font-medium">
              Account Setting
            </button>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="mb-12">
          <h3 className="text-gray-700 mb-4">Your Profile Picture</h3>
          <div
            onClick={handleUploadClick}
            className="w-[104px] h-[104px] rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative bg-gray-50"
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 mb-1">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 22C3 17.0294 7.02944 13 12 13C16.9706 13 21 17.0294 21 22" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-xs text-gray-500">Upload your</span>
                <span className="text-xs text-gray-500">photo</span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                defaultValue={profile.username}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="text"
                defaultValue={profile.email}
                className="w-full p-3 border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="Please enter your fullname"
                className="w-full p-3 border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Language</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option>Select your Language</option>
                <option>English</option>
                <option>Italian</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <label className="block text-gray-700 mb-2">Method of Payment</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option>Select your payment method</option>
                <option>Bitcoin</option>
                <option>PayPal</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={paypalAddress}
                onChange={(e) => setPaypalAddress(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 mt-72">
          <button
            onClick={handleUpdate}
            className="bg-[#4EB37E] hover:bg-[#45a070] text-white px-6 py-2 rounded-md font-normal"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;