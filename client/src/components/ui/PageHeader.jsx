import React from 'react';

const PageHeader = ({ 
  title, 
  className = "flex justify-between items-center mb-8",
  titleClassName = "text-xl font-semibold text-gray-900 dark:text-dark-text"
}) => {
  return (
    <div className={className}>
      <h1 className={titleClassName}>{title}</h1>
    </div>
  );
};

export default PageHeader;