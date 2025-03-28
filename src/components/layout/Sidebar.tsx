import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Thermometer, Activity, Timer, Droplet, Zap, AlertTriangle, GaugeIcon } from "lucide-react";

interface SidebarProps {
  isConnected: boolean;
}

interface DatalogValue {
  value: number;
  unit: string;
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
  category: string;
}

const Sidebar = ({ isConnected }: SidebarProps) => {
  const [values, setValues] = useState<Record<string, DatalogValue>>({
    rpm: { value: 2450, unit: 'rpm', icon: <Gauge size={14} />, label: 'RPM', min: 0, max: 8000, category: 'Engine' },
    ect: { value: 185, unit: '°F', icon: <Thermometer size={14} />, label: 'ECT', min: 0, max: 250, category: 'Engine' },
    map: { value: 12.5, unit: 'psi', icon: <Activity size={14} />, label: 'MAP', min: 0, max: 30, category: 'Engine' },
    iat: { value: 95, unit: '°F', icon: <Timer size={14} />, label: 'IAT', min: 0, max: 200, category: 'Engine' },
    afr: { value: 14.7, unit: 'λ', icon: <Droplet size={14} />, label: 'AFR', min: 10, max: 20, category: 'Fuel' },
    injDuty: { value: 65, unit: '%', icon: <Droplet size={14} />, label: 'Injector Duty', min: 0, max: 100, category: 'Fuel' },
    timing: { value: 28, unit: '°', icon: <Zap size={14} />, label: 'Timing', min: 0, max: 50, category: 'Ignition' },
    knock: { value: 2, unit: 'count', icon: <AlertTriangle size={14} />, label: 'Knock', min: 0, max: 10, category: 'Ignition' },
    tps: { value: 45, unit: '%', icon: <GaugeIcon size={14} />, label: 'TPS', min: 0, max: 100, category: 'Engine' }
  });

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setValues(prev => {
        const newValues = { ...prev };
        Object.keys(newValues).forEach(key => {
          const value = newValues[key];
          // Simulate small random changes
          const change = (Math.random() - 0.5) * 2;
          value.value = Math.max(value.min, Math.min(value.max, value.value + change));
        });
        return newValues;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const renderValue = (key: string, data: DatalogValue) => (
    <div key={key} className="flex items-center justify-between text-sm group">
      <div className="flex items-center gap-2 text-honda-light/70">
        {data.icon}
        <span>{data.label}</span>
      </div>
      <span className="text-honda-light transition-all duration-300 group-hover:text-honda-accent">
        {data.value.toFixed(1)}
        <span className="ml-1 text-xs text-honda-light/50">{data.unit}</span>
      </span>
    </div>
  );

  const categories = {
    Engine: ['rpm', 'ect', 'map', 'iat', 'tps'],
    Fuel: ['afr', 'injDuty'],
    Ignition: ['timing', 'knock']
  };

  return (
    <div className="w-64 border-r border-honda-gray/50 bg-honda-dark flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isConnected ? (
            Object.entries(categories).map(([category, keys]) => (
              <Card key={category} className="bg-honda-gray/50 border-honda-gray">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm text-honda-light">{category}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {keys.map(key => renderValue(key, values[key]))}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-honda-light/50">
              <p>Connect to view datalog information</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
