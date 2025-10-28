import React from 'react';

const FavoriteButton = ({ isFavorite, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-full ${isFavorite ? 'text-yellow-500' : 'text-gray-500'}`}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  );
};

export default FavoriteButton;