
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-honda-dark">
      <Navbar isConnected={isConnected} onConnectionChange={setIsConnected} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isConnected={isConnected} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
