import React from 'react';

const ShareButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="p-2 rounded-full text-blue-500"
    >
      ⎘
    </button>
  );
};

export default ShareButton;