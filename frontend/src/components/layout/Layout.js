import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Alert from './Alert';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Alert />
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;