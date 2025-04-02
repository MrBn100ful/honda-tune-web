
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
        <FuelMap />
      </div>
    </Layout>
  );
};

export default Index;

