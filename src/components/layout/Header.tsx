
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wifi, Zap, Settings, Map, Activity, Wrench } from "lucide-react";
import ConnectionStatus from '../tuning/ConnectionStatus';

const Header = () => {
  const [activeTab, setActiveTab] = useState("maps");
  
  return (
    <header className="flex justify-between items-center p-4 bg-honda-gray border-b border-honda-red">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-honda-light mr-6">
          <span className="text-honda-red">Honda</span>Tune P28
        </h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList>
            <TabsTrigger value="maps" onClick={() => window.location.hash = "maps"}>
              <Map size={16} className="mr-1" /> Maps
            </TabsTrigger>
            <TabsTrigger value="datalogging" onClick={() => window.location.hash = "datalogging"}>
              <Activity size={16} className="mr-1" /> Datalogging
            </TabsTrigger>
            <TabsTrigger value="settings" onClick={() => window.location.hash = "settings"}>
              <Wrench size={16} className="mr-1" /> Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
