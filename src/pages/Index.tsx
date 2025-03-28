
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FuelMap from '@/components/tuning/FuelMap';
import DataLogging from '@/components/tuning/DataLogging';
import TuningSettings from '@/components/tuning/TuningSettings';

const Index = () => {
  const [activeView, setActiveView] = useState("maps");
  
  return (
    <Layout>
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full h-[calc(100vh-64px)]">
        <TabsList className="mb-4">
          <TabsTrigger value="maps">Maps</TabsTrigger>
          <TabsTrigger value="datalogging">Datalogging</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="maps" className="h-full mt-0">
          <FuelMap />
        </TabsContent>
        
        <TabsContent value="datalogging" className="h-full mt-0">
          <DataLogging />
        </TabsContent>
        
        <TabsContent value="settings" className="h-full mt-0">
          <TuningSettings />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Index;
