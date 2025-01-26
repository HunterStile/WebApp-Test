import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  className = '', 
  titleClassName = '', 
  valueClassName = '' 
}) => {
  return (
    <div className={`bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-accent ${className}`}>
      <h3 className={`text-gray-600 dark:text-dark-text text-xl text-center mb-2 ${titleClassName}`}>
        {title}
      </h3>
      <p className={`text-4xl text-center font-bold dark:text-dark-text ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
};

export default StatsCard;