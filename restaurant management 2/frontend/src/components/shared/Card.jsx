import React from 'react';

const Card = ({ children, className = '', hover = false, glass = false }) => {
  return (
    <div 
      className={`
        ${glass ? 'glass' : 'bg-white'}
        rounded-2xl shadow-elegant p-6 
        transition-all duration-300
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
