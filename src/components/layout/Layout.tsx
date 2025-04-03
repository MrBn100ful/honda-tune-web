
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from "@/providers/ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDark ? 'bg-honda-dark text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar isConnected={isConnected} onConnectionChange={setIsConnected} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isConnected={isConnected} />
        <main className={`flex-1 overflow-hidden ${isDark ? 'bg-honda-dark/90' : 'bg-white/90'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
