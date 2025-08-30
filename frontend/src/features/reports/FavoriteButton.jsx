import React, { useState, useEffect } from 'react';
import { useGetFavoriteStatusQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../../services/reportApi';
import { StarIcon } from '@heroicons/react/24/solid';

const FavoriteButton = ({ reportId }) => {
  const { data: status } = useGetFavoriteStatusQuery(reportId);
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (status) {
      setIsFavorite(status.isFavorite);
    }
  }, [status]);

  const handleToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(reportId).unwrap();
      } else {
        await addFavorite(reportId).unwrap();
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`p-2 rounded-full ${isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
      aria-label={isFavorite ? '取消收藏' : '收藏报表'}
    >
      <StarIcon className="w-6 h-6" />
    </button>
  );
};

export default FavoriteButton;