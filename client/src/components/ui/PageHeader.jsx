import React from 'react';

const PageHeader = ({ 
  title, 
  className = "flex justify-between items-center mb-8" 
}) => {
  return (
    <div className={className}>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
};

export default PageHeader;