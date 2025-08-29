import React from 'react';

const Spinner = ({ size = 'default' }) => {
  // 根据尺寸设置不同的类名
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.default;
  
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${spinnerSize}`}></div>
    </div>
  );
};

export default Spinner;