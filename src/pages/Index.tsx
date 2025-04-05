
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import FuelMap from '@/components/tuning/FuelMap';
import TuningSettings from '@/components/tuning/TuningSettings';
import DataLogging from '@/components/tuning/DataLogging';

const Index = () => {
  const [activeTab, setActiveTab] = useState("maps");
  
  useEffect(() => {
    // Check if setup has been completed
    const setupCompleted = localStorage.getItem('ecuSetupCompleted');
    if (!setupCompleted) {
      setActiveTab("settings");
    }
  }, []);
  
  return (
    <Layout>
      <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="mx-4 mt-2 flex-none">
            <TabsTrigger value="maps">Maps</TabsTrigger>
            <TabsTrigger value="datalog">Datalog</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="maps" className="h-[calc(100%-40px)] overflow-hidden">
            <FuelMap />
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
