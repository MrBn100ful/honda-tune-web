import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, Database, BarChart, Activity, Gauge, Thermometer, Droplet, CornerRightDown, AlertTriangle } from "lucide-react";

const sections = [
  {
    title: "Primary Tables",
    items: [
      { name: "Fuel Map", icon: <Droplet size={16} /> },
      { name: "Ignition Map", icon: <Zap size={16} /> },
      { name: "VTEC Map", icon: <ChevronRight size={16} /> },
      { name: "Limiters", icon: <AlertTriangle size={16} /> }
    ]
  },
  {
    title: "Secondary Tables",
    items: [
      { name: "Injector Scaling", icon: <Database size={16} /> },
      { name: "Launch Control", icon: <CornerRightDown size={16} /> },
      { name: "Temperature Comp", icon: <Thermometer size={16} /> }
    ]
  },
  {
    title: "Data Monitoring",
    items: [
      { name: "Real-time Data", icon: <Activity size={16} /> },
      { name: "Gauges", icon: <Gauge size={16} /> },
      { name: "Graphs", icon: <BarChart size={16} /> }
    ]
  }
];

import { Zap } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-60 bg-honda-dark border-r border-honda-gray overflow-hidden hidden md:block">
      <ScrollArea className="h-full p-3">
        {sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="menu-section-title text-sm mb-2 px-3">{section.title}</h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <Button 
                  key={itemIndex} 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start menu-item hover:bg-honda-gray"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
