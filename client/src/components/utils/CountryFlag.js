import React from 'react';

// Utility function to get correct flag image name
const importFlag = (countryCode) => {
  try {
    // Convert country code to lowercase for consistency
    const formattedCode = countryCode.toLowerCase();
    return require(`../../assets/images/flags/${formattedCode}.png`);
  } catch (error) {
    // Default flag or placeholder if country flag not found
    return require('../../assets/images/flags/default-flag.png');
  }
};

const CountryFlag = ({ country, className = '' }) => {
  return (
    <div className="relative w-6 h-4">
      <img
        src={importFlag(country)}
        alt={`${country} flag`}
        className={`w-full h-full object-contain rounded-sm ${className}`}
        title={country}
      />
    </div>
  );
};

export default CountryFlag;