import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  className = '', 
  titleClassName = '', 
  valueClassName = '' 
}) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <h3 className={`text-gray-600 text-xl text-center mb-2 ${titleClassName}`}>
        {title}
      </h3>
      <p className={`text-4xl text-center font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
};

export default StatsCard;