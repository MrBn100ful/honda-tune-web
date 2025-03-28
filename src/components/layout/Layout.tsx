import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen bg-honda-dark">
      <Navbar isConnected={isConnected} onConnectionChange={setIsConnected} />
      <div className="flex">
        <Sidebar isConnected={isConnected} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
