import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-6xl font-extrabold text-blue-600 mb-2">404</h2>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">页面未找到</h3>
          <p className="text-gray-600 mb-6">
            您访问的页面不存在或已被移除。
          </p>
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;