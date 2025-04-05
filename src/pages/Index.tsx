
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FuelMap from '@/components/tuning/FuelMap';
import TuningSettings from '@/components/tuning/TuningSettings';
import DataLogging from '@/components/tuning/DataLogging';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState("maps");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if setup has been completed
    const setupCompleted = localStorage.getItem('ecuSetupCompleted');
    
    // Don't automatically set to settings tab on first load
    // Let the EmptyState component handle the navigation choice
    if (setupCompleted === "true") {
      setActiveTab("maps");
    }
  }, []);
  
  const handleStartSetup = () => {
    setActiveTab("settings");
    toast.info("Please configure your ECU settings");
  };
  
  return (
    <Layout>
      <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="mx-4 mt-2 flex-none">
            <TabsTrigger value="maps">Maps</TabsTrigger>
            <TabsTrigger value="datalog">Datalog</TabsTrigger>
            <TabsTrigger value="settings" data-value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="maps" className="h-[calc(100%-40px)] overflow-hidden">
            <FuelMap onStartSetup={handleStartSetup} />
          </TabsContent>
          
          <TabsContent value="datalog" className="h-[calc(100%-40px)] overflow-hidden p-4">
            <DataLogging />
          </TabsContent>
          
          <TabsContent value="settings" className="h-[calc(100%-40px)] overflow-hidden p-4">
            <TuningSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
