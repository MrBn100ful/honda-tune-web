
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FuelMap from '@/components/tuning/FuelMap';
import TuningSettings from '@/components/tuning/TuningSettings';

const Index = () => {
  const [activeTab, setActiveTab] = useState("maps");
  
  return (
    <Layout>
      <div className="w-full h-[calc(100vh-64px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="maps">Maps</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="maps" className="h-[calc(100%-40px)]">
            <FuelMap />
          </TabsContent>
          
          <TabsContent value="settings" className="h-[calc(100%-40px)] p-4 overflow-hidden">
            <TuningSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
