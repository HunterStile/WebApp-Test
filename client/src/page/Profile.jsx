import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [paypalAddress, setPaypalAddress] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/auth/profile?username=${user}`)
        .then((response) => {
          const userData = response.data.user;
          setProfile(userData);
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setPaypalAddress(userData.paypalAddress || '');
          setBitcoinAddress(userData.bitcoinAddress || '');
          setSelectedMethod(userData.paymentMethod || 'paypal');
          setProfileImage(
            userData.profileImage 
            ? `${API_BASE_URL}/${userData.profileImage}` 
            : null
          );
        })
        .catch((error) => {
          console.error('Error fetching profile:', error);
        });
    }
  }, [user]);

  const handleUpdate = () => {
    if (!user) {
      setMessage('You must be logged in to update the profile');
      return;
    }

    axios.put(`${API_BASE_URL}/auth/profile`, {
      username: user,
      firstName,
      lastName,
      paypalAddress,
      bitcoinAddress,
      paymentMethod: selectedMethod,
    })
      .then((response) => {
        setMessage('Profile updated successfully!');
        setProfile(response.data.user);
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        setMessage('Error updating profile');
      });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);
      formData.append('username', user);

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/upload-profile-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setProfileImage(`${API_BASE_URL}/${response.data.imageUrl}`);
        setMessage('Profile image uploaded successfully');
      } catch (error) {
        console.error('Image upload error:', error);
        setMessage('Failed to upload image');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return <p>You must be logged in to view and update your profile.</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-bg">
      <div className="h-900 w-full m-auto max-w-1600 p-8 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-accent">
        {/* Profile Picture Section */}
        <div className="mb-10">
          <h3 className="text-gray-700 dark:text-dark-text mb-4 text-2xl font-semibold">Your Profile Picture:</h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-[104px] h-[104px] rounded-full border-2 border-dashed border-gray-300 dark:border-dark-accent flex flex-col items-center justify-center cursor-pointer overflow-hidden relative bg-gray-50 dark:bg-dark-bg"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 dark:text-gray-500 mb-1">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 22C3 17.0294 7.02944 13 12 13C16.9706 13 21 17.0294 21 22" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">Upload your</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">photo</span>
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

        <div class="border-t border-gray-300 my-4"></div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <label className="block text-gray-700 dark:text-dark-text mb-2">Username</label>
              <input
                type="text"
                value={profile.username}
                disabled
                className="w-full p-3 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-accent rounded-md text-gray-500 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-dark-text mb-2">Email</label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full p-3 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-accent rounded-md text-gray-500 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-dark-text mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-dark-accent rounded-md text-gray-700 dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-dark-text mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-dark-accent rounded-md text-gray-700 dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <label className="block text-gray-700 dark:text-dark-text mb-2">Method of Payment</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-dark-accent rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="paypal">PayPal</option>
                <option value="bitcoin">Bitcoin</option>
              </select>
            </div>

            {selectedMethod === 'paypal' ? (
              <div>
                <label className="block text-gray-700 dark:text-dark-text mb-2">PayPal Address</label>
                <input
                  type="text"
                  value={paypalAddress}
                  onChange={(e) => setPaypalAddress(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-dark-accent rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 dark:text-dark-text mb-2">Bitcoin Address</label>
                <input
                  type="text"
                  value={bitcoinAddress}
                  onChange={(e) => setBitcoinAddress(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-dark-accent rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mt-4 text-center text-green-600 dark:text-green-400">
            {message}
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-4 mt-72">
          <button
            onClick={handleUpdate}
            className="bg-[#4EB37E] hover:bg-[#45a070] dark:bg-[#3a8f64] dark:hover:bg-[#2f7553] text-white px-6 py-2 rounded-md font-normal"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;