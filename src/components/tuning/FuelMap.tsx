
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, Edit, Save, PlusCircle, MinusCircle } from "lucide-react";

// Sample data for the fuel map
const generateMapData = () => {
  const rpm = [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6400, 6800];
  const load = [20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  const data: number[][] = [];
  
  for (let i = 0; i < load.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < rpm.length; j++) {
      // Generate a realistic fuel value that increases with RPM and load
      let value = 10 + (i * 0.8) + (j * 0.5);
      // Add some variation
      value += Math.random() * 2 - 1;
      row.push(parseFloat(value.toFixed(1)));
    }
    data.push(row);
  }
  
  return { rpm, load, data };
};

const { rpm, load, data } = generateMapData();

const FuelMap = () => {
  const [mapData, setMapData] = useState(data);
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [view, setView] = useState<'2d' | '3d'>('2d');
  
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };
  
  const adjustValue = (amount: number) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newMapData = [...mapData];
    newMapData[row][col] = parseFloat((newMapData[row][col] + amount).toFixed(1));
    setMapData(newMapData);
  };
  
  return (
    <Card className="w-full h-full bg-honda-dark border-honda-gray">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-honda-light">Fuel Map</CardTitle>
          <div className="flex items-center gap-2">
            <Select defaultValue="primary">
              <SelectTrigger className="w-[150px] h-8 text-sm bg-honda-gray border-honda-gray">
                <SelectValue placeholder="Map Selection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary Fuel Map</SelectItem>
                <SelectItem value="secondary">Low RPM Map</SelectItem>
                <SelectItem value="vtec">VTEC Engagement</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={view} onValueChange={(v) => setView(v as '2d' | '3d')} className="w-24">
              <TabsList className="h-8">
                <TabsTrigger value="2d" className="text-xs px-3 py-1">2D</TabsTrigger>
                <TabsTrigger value="3d" className="text-xs px-3 py-1">3D</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Save size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} className="w-full h-[calc(100%-32px)]">
          <TabsContent value="2d" className="mt-0 h-full">
            <div className="flex h-full">
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="grid-cell grid-header">RPM / Load</th>
                      {rpm.map((r, idx) => (
                        <th key={idx} className="grid-cell grid-header">{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {load.map((l, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="grid-cell grid-header">{l}%</td>
                        {mapData[rowIdx].map((value, colIdx) => (
                          <td 
                            key={colIdx} 
                            className={`grid-cell ${selectedCell?.row === rowIdx && selectedCell?.col === colIdx ? 'grid-highlight' : ''}`}
                            onClick={() => handleCellClick(rowIdx, colIdx)}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedCell && (
                <div className="w-48 ml-4 flex flex-col">
                  <div className="bg-honda-gray p-3 rounded-t-md">
                    <h3 className="text-sm font-bold text-honda-light">Cell Editor</h3>
                    <div className="mt-2 bg-honda-dark rounded p-2">
                      <div className="text-xs text-honda-light">
                        RPM: <span className="font-bold">{rpm[selectedCell.col]}</span>
                      </div>
                      <div className="text-xs text-honda-light">
                        Load: <span className="font-bold">{load[selectedCell.row]}%</span>
                      </div>
                      <div className="text-lg font-bold text-honda-red mt-1">
                        {mapData[selectedCell.row][selectedCell.col]}
                      </div>
                    </div>
                  </div>
                  <div className="bg-honda-gray p-3 rounded-b-md mt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => adjustValue(0.1)}>
                        <PlusCircle size={16} className="mr-1" /> 0.1
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => adjustValue(-0.1)}>
                        <MinusCircle size={16} className="mr-1" /> 0.1
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => adjustValue(1)}>
                        <PlusCircle size={16} className="mr-1" /> 1.0
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => adjustValue(-1)}>
                        <MinusCircle size={16} className="mr-1" /> 1.0
                      </Button>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={30} 
                      step={0.1}
                      value={mapData[selectedCell.row][selectedCell.col]}
                      onChange={(e) => {
                        const newMapData = [...mapData];
                        newMapData[selectedCell.row][selectedCell.col] = parseFloat(e.target.value);
                        setMapData(newMapData);
                      }}
                      className="w-full mt-3"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="3d" className="mt-0 h-full">
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 rounded-md bg-honda-gray">
                <h3 className="text-honda-light text-xl mb-4">3D Visualization</h3>
                <p className="text-honda-light mb-4">The 3D map visualization will be rendered here.</p>
                <p className="text-muted-foreground text-sm">
                  In a full implementation, this would display an interactive 3D surface plot of the fuel map data.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FuelMap;
