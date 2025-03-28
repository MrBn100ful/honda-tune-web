
import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap, Settings } from "lucide-react";
import ConnectionStatus from '../tuning/ConnectionStatus';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-honda-gray border-b border-honda-red">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-honda-light mr-6">
          <span className="text-honda-red">Honda</span>Tune P28
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <ConnectionStatus />
        <Button variant="destructive" size="sm" className="bg-honda-red">
          <Zap size={18} className="mr-1" /> Flash ECU
        </Button>
        <Button variant="outline" size="icon">
          <Settings size={18} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
