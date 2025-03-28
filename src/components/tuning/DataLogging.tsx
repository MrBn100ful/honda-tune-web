
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, Save, Maximize2 } from "lucide-react";

// Generate fake data logging information
const generateDataPoints = (count: number) => {
  const now = Date.now();
  const data = [];
  
  let rpm = 800;
  let afr = 14.7;
  let temp = 180;
  let tps = 0;
  
  for (let i = 0; i < count; i++) {
    // Add some realistic variation to the values
    if (i > 0) {
      // Simulate a rev up scenario
      if (i > count / 2 && i < count * 0.8) {
        rpm += (Math.random() * 300) - 50;
        tps += (Math.random() * 5);
      } else {
        rpm += (Math.random() * 100) - 50;
        tps = Math.max(0, tps - (Math.random() * 5));
      }
      
      // Clamp values to realistic ranges
      rpm = Math.max(800, Math.min(8000, rpm));
      tps = Math.max(0, Math.min(100, tps));
      
      // AFR changes with throttle position
      const targetAfr = tps > 80 ? 12.5 : tps > 40 ? 13.5 : 14.7;
      afr = afr + ((targetAfr - afr) * 0.1) + (Math.random() * 0.4 - 0.2);
      
      // Temperature slowly rises
      temp += Math.random() * 0.2;
    }
    
    data.push({
      time: now - (count - i) * 1000,
      rpm: Math.round(rpm),
      afr: parseFloat(afr.toFixed(1)),
      temp: Math.round(temp),
      tps: Math.round(tps),
      knock: Math.random() > 0.95 ? Math.random() * 5 : 0,
      fuel: Math.round(10 + (rpm / 1000) * (tps / 20))
    });
  }
  
  return data;
};

const initialData = generateDataPoints(100);

const DataLogging = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [data, setData] = useState(initialData);
  const [lastValues, setLastValues] = useState(initialData[initialData.length - 1]);
  
  useEffect(() => {
    if (!isLogging) return;
    
    const interval = setInterval(() => {
      // Get the last 100 data points
      const newData = [...data.slice(-99)];
      
      // Generate a new data point based on the last one
      const last = newData[newData.length - 1];
      
      // Simulate RPM
      let rpm = last.rpm;
      if (Math.random() > 0.7) {
        rpm += Math.floor(Math.random() * 300) - 150;
      }
      rpm = Math.max(800, Math.min(8000, rpm));
      
      // Simulate throttle change
      let tps = last.tps;
      if (Math.random() > 0.8) {
        tps += Math.floor(Math.random() * 10) - 5;
      }
      tps = Math.max(0, Math.min(100, tps));
      
      // AFR follows throttle with some delay
      const targetAfr = tps > 80 ? 12.5 : tps > 40 ? 13.5 : 14.7;
      const afr = last.afr + ((targetAfr - last.afr) * 0.1) + (Math.random() * 0.4 - 0.2);
      
      // Temperature slowly rises
      const temp = last.temp + (Math.random() * 0.2);
      
      // Generate new point
      const newPoint = {
        time: Date.now(),
        rpm: Math.round(rpm),
        afr: parseFloat(afr.toFixed(1)),
        temp: Math.round(temp),
        tps: Math.round(tps),
        knock: Math.random() > 0.95 ? Math.random() * 5 : 0,
        fuel: Math.round(10 + (rpm / 1000) * (tps / 20))
      };
      
      newData.push(newPoint);
      setData(newData);
      setLastValues(newPoint);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isLogging, data]);
  
  const toggleLogging = () => {
    setIsLogging(!isLogging);
  };
  
  const formatTime = (time: number) => {
    const date = new Date(time);
    return `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().substring(0, 2)}`;
  };
  
  return (
    <Card className="w-full h-full bg-honda-dark border-honda-gray">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-honda-light">Data Logging</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant={isLogging ? "destructive" : "default"} 
              size="sm" 
              onClick={toggleLogging}
              className={isLogging ? "bg-honda-red" : ""}
            >
              {isLogging ? <Pause size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
              {isLogging ? "Stop Logging" : "Start Logging"}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Save size={16} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Maximize2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <GaugeCard title="RPM" value={lastValues.rpm} max={8000} suffix="rpm" color="#e62628" />
          <GaugeCard title="AFR" value={lastValues.afr} max={20} suffix=":1" color="#0077c8" 
            warning={lastValues.afr < 12 || lastValues.afr > 15.5} />
          <GaugeCard title="TPS" value={lastValues.tps} max={100} suffix="%" color="#00c853" />
        </div>
        
        <Tabs defaultValue="rpm" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="rpm">RPM</TabsTrigger>
            <TabsTrigger value="afr">AFR</TabsTrigger>
            <TabsTrigger value="multi">Multi-Parameter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rpm" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTime} 
                    tick={{ fill: '#aaa' }}
                    stroke="#555"
                  />
                  <YAxis 
                    domain={[0, 8000]} 
                    tick={{ fill: '#aaa' }}
                    stroke="#555"
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} rpm`, 'RPM']}
                    labelFormatter={formatTime}
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                    itemStyle={{ color: '#e62628' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rpm" 
                    stroke="#e62628" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="afr" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTime} 
                    tick={{ fill: '#aaa' }}
                    stroke="#555"
                  />
                  <YAxis 
                    domain={[10, 16]} 
                    tick={{ fill: '#aaa' }}
                    stroke="#555"
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}:1`, 'AFR']}
                    labelFormatter={formatTime}
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                    itemStyle={{ color: '#0077c8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="afr" 
                    stroke="#0077c8" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="multi" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTime} 
                    tick={{ fill: '#aaa' }}
                    stroke="#555"
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 8000]} 
                    tick={{ fill: '#aaa' }}
                    stroke="#555"
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[10, 16]} 
                    tick={{ fill: '#aaa' }}
                    stroke="#555"
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'rpm') return [`${value} rpm`, 'RPM'];
                      if (name === 'afr') return [`${value}:1`, 'AFR'];
                      if (name === 'tps') return [`${value}%`, 'TPS'];
                      return [value, name];
                    }}
                    labelFormatter={formatTime}
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="rpm" 
                    stroke="#e62628" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="afr" 
                    stroke="#0077c8" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="tps" 
                    stroke="#00c853" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface GaugeCardProps {
  title: string;
  value: number;
  max: number;
  suffix: string;
  color: string;
  warning?: boolean;
}

const GaugeCard = ({ title, value, max, suffix, color, warning = false }: GaugeCardProps) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className={`bg-honda-gray rounded-md p-3 ${warning ? 'border border-honda-red' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm text-honda-light">{title}</h3>
        <span className={`text-xl font-bold ${warning ? 'text-honda-red' : 'text-white'}`}>
          {value}{suffix}
        </span>
      </div>
      <div className="w-full bg-honda-dark rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

export default DataLogging;
