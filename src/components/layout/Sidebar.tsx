import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Activity, Thermometer, Gauge, Droplet, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatalogValue {
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  category: string;
}

const datalogSections = [
  {
    title: "Engine Status",
    items: [
      { name: "RPM", unit: "rpm", icon: <Activity size={16} /> },
      { name: "MAP", unit: "kPa", icon: <Gauge size={16} /> },
      { name: "ECT", unit: "°C", icon: <Thermometer size={16} /> },
      { name: "IAT", unit: "°C", icon: <Thermometer size={16} /> }
    ]
  },
  {
    title: "Fuel System",
    items: [
      { name: "Injector Duty", unit: "%", icon: <Droplet size={16} /> },
      { name: "AFR", unit: "λ", icon: <Droplet size={16} /> },
      { name: "Fuel Pressure", unit: "kPa", icon: <Droplet size={16} /> }
    ]
  },
  {
    title: "Ignition",
    items: [
      { name: "Timing", unit: "°", icon: <Zap size={16} /> },
      { name: "Knock", unit: "count", icon: <AlertTriangle size={16} /> }
    ]
  }
];

const Sidebar = () => {
  const [datalogValues, setDatalogValues] = useState<Record<string, DatalogValue>>({});

  // Simulate real-time data updates
  useEffect(() => {
    const updateDatalogValues = () => {
      const newValues: Record<string, DatalogValue> = {};
      
      datalogSections.forEach(section => {
        section.items.forEach(item => {
          newValues[item.name] = {
            ...item,
            value: Math.random() * 100, // Simulated values
            category: section.title
          };
        });
      });

      setDatalogValues(newValues);
    };

    // Update every second
    const interval = setInterval(updateDatalogValues, 1000);
    updateDatalogValues(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-60 bg-honda-dark border-r border-honda-gray overflow-hidden hidden md:block">
      <div className="p-2 border-b border-honda-gray/50">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
          >
            Flash EEPROM
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-48px)] p-3">
        {datalogSections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="menu-section-title text-sm mb-2 px-3">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => {
                const value = datalogValues[item.name];
                return (
                  <Card key={itemIndex} className="p-2 bg-honda-gray/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2 text-honda-light/70">{item.icon}</span>
                        <div>
                          <div className="datalog-label">{item.name}</div>
                          <div className="datalog-value">
                            {value ? value.value.toFixed(1) : "---"}
                            <span className="datalog-unit ml-1">{item.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
