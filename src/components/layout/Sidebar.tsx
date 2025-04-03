
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Thermometer, Activity, Timer, Droplet, Zap, AlertTriangle, GaugeIcon, Wind, Tally4 } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

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
  history: number[];
  color: string;
  warningThreshold?: number;
}

const MAX_HISTORY_LENGTH = 120; // 2 minutes of data at 1-second intervals

const Sidebar = ({ isConnected }: SidebarProps) => {
  const { theme } = useTheme();
  const [values, setValues] = useState<Record<string, DatalogValue>>({
    rpm: { 
      value: 2450, 
      unit: 'rpm', 
      icon: <Gauge size={14} />, 
      label: 'RPM', 
      min: 0, 
      max: 8000, 
      category: 'Engine', 
      history: [],
      color: '#e62628',
    },
    ect: { 
      value: 185, 
      unit: '°F', 
      icon: <Thermometer size={14} />, 
      label: 'ECT', 
      min: 0, 
      max: 250, 
      category: 'Engine', 
      history: [],
      color: '#00a2ff',
      warningThreshold: 220,
    },
    map: { 
      value: 12.5, 
      unit: 'psi', 
      icon: <Activity size={14} />, 
      label: 'MAP', 
      min: 0, 
      max: 30, 
      category: 'Engine', 
      history: [],
      color: '#ff9e00',
    },
    iat: { 
      value: 95, 
      unit: '°F', 
      icon: <Timer size={14} />, 
      label: 'IAT', 
      min: 0, 
      max: 200, 
      category: 'Engine', 
      history: [],
      color: '#00d2ff',
    },
    afr: { 
      value: 14.7, 
      unit: 'λ', 
      icon: <Droplet size={14} />, 
      label: 'AFR', 
      min: 10, 
      max: 20, 
      category: 'Fuel', 
      history: [],
      color: '#0077c8',
      warningThreshold: 12,
    },
    injDuty: { 
      value: 65, 
      unit: '%', 
      icon: <Droplet size={14} />, 
      label: 'Injector Duty', 
      min: 0, 
      max: 100, 
      category: 'Fuel', 
      history: [],
      color: '#7b61ff',
    },
    timing: { 
      value: 28, 
      unit: '°', 
      icon: <Zap size={14} />, 
      label: 'Timing', 
      min: 0, 
      max: 50, 
      category: 'Ignition', 
      history: [],
      color: '#ffd700',
    },
    knock: { 
      value: 2, 
      unit: 'count', 
      icon: <AlertTriangle size={14} />, 
      label: 'Knock', 
      min: 0, 
      max: 10, 
      category: 'Ignition', 
      history: [],
      color: '#ff3e00',
      warningThreshold: 5,
    },
    tps: { 
      value: 45, 
      unit: '%', 
      icon: <GaugeIcon size={14} />, 
      label: 'TPS', 
      min: 0, 
      max: 100, 
      category: 'Engine', 
      history: [],
      color: '#00c853',
    },
    speed: { 
      value: 45, 
      unit: 'mph', 
      icon: <Wind size={14} />, 
      label: 'Speed', 
      min: 0, 
      max: 180, 
      category: 'Vehicle', 
      history: [],
      color: '#9747ff',
    },
    boost: { 
      value: 8.2, 
      unit: 'psi', 
      icon: <Gauge size={14} />, 
      label: 'Boost', 
      min: 0, 
      max: 25, 
      category: 'Engine', 
      history: [],
      color: '#ff5722',
    },
    oilTemp: { 
      value: 210, 
      unit: '°F', 
      icon: <Thermometer size={14} />, 
      label: 'Oil Temp', 
      min: 0, 
      max: 300, 
      category: 'Vehicle', 
      history: [],
      color: '#e91e63',
      warningThreshold: 260,
    },
    gear: { 
      value: 3, 
      unit: '', 
      icon: <Tally4 size={14} />, 
      label: 'Gear', 
      min: 0, 
      max: 6, 
      category: 'Vehicle', 
      history: [],
      color: '#4caf50',
    }
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
          const newValue = Math.max(value.min, Math.min(value.max, value.value + change));
          value.value = newValue;
          // Add to history
          value.history = [...value.history, newValue].slice(-MAX_HISTORY_LENGTH);
        });
        return newValues;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const renderValue = (key: string, data: DatalogValue) => {
    const isWarning = data.warningThreshold && 
      (data.value > data.warningThreshold || (key === 'afr' && data.value < data.warningThreshold));
    
    return (
      <div key={key} className="flex items-center justify-between text-sm group">
        <div className="flex items-center gap-2 text-honda-light/70 dark:text-honda-light/70">
          <span style={{ color: data.color }}>{data.icon}</span>
          <span>{data.label}</span>
        </div>
        <span 
          className={`transition-all duration-300 group-hover:text-honda-accent ${
            isWarning ? 'text-honda-red' : theme === 'dark' ? 'text-honda-light' : 'text-honda-dark'
          }`}
          style={{ color: isWarning ? '#e62628' : data.color }}
        >
          {data.value.toFixed(key === 'afr' || key === 'boost' ? 1 : 0)}
          <span className="ml-1 text-xs text-honda-light/50 dark:text-honda-light/50">{data.unit}</span>
        </span>
      </div>
    );
  };

  const categories = {
    Engine: ['rpm', 'ect', 'map', 'iat', 'tps', 'boost'],
    Vehicle: ['speed', 'oilTemp', 'gear'],
    Fuel: ['afr', 'injDuty'],
    Ignition: ['timing', 'knock']
  };

  return (
    <div className={`w-64 border-r border-honda-gray/50 ${theme === 'dark' ? 'bg-honda-dark' : 'bg-white'} flex flex-col`}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isConnected ? (
            Object.entries(categories).map(([category, keys]) => (
              <Card key={category} className={`${theme === 'dark' ? 'bg-honda-dark' : 'bg-gray-50'} border-honda-gray/50`}>
                <CardHeader className="p-3">
                  <CardTitle className={`text-sm ${theme === 'dark' ? 'text-honda-light' : 'text-honda-dark'}`}>{category}</CardTitle>
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
