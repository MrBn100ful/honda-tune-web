import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Save } from "lucide-react";
import {
  Area,
  AreaChart,
  Surface,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';

// Sample data for the fuel map
const generateMapData = () => {
  const rpm = [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6400, 6800];
  // Use mbar for load
  const load = [200, 300, 400, 500, 600, 700, 800, 900, 1000];
  
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

// Transform map data for 3D visualization
const transformDataFor3D = (mapData: number[][], rpm: number[], load: number[]) => {
  const result = [];
  
  for (let i = 0; i < load.length; i++) {
    for (let j = 0; j < rpm.length; j++) {
      result.push({
        rpm: rpm[j],
        load: load[i],
        value: mapData[i][j]
      });
    }
  }
  
  return result;
};

// Prepare surface data for recharts
const prepareSurfaceData = (data3d: any[], xSize: number, ySize: number) => {
  const result = [];
  
  for (let y = 0; y < ySize; y++) {
    const row = [];
    for (let x = 0; x < xSize; x++) {
      row.push(data3d[y * xSize + x].value);
    }
    result.push(row);
  }
  
  return result;
};

// Unit converters
const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
  // First convert to mbar as base unit
  let inMbar = value;
  if (fromUnit !== 'mbar') {
    if (fromUnit === 'kPa') {
      inMbar = value * 10;
    } else if (fromUnit === 'psi') {
      inMbar = value * 68.9476;
    }
  }
  
  // Then convert from mbar to target unit
  if (toUnit === 'mbar') {
    return inMbar;
  } else if (toUnit === 'kPa') {
    return inMbar / 10;
  } else if (toUnit === 'psi') {
    return inMbar / 68.9476;
  }
  
  return value; // Fallback
};

const { rpm, load, data } = generateMapData();

const getCellColorClass = (value: number) => {
  if (value < 33) return 'cell-value-low';
  if (value < 66) return 'cell-value-medium';
  return 'cell-value-high';
};

const FuelMap = () => {
  const [mapData, setMapData] = useState(data);
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [pressureUnit, setPressureUnit] = useState<'mbar' | 'kPa' | 'psi'>('mbar');
  const [displayedLoad, setDisplayedLoad] = useState(load);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Update displayed load when pressure unit changes
  useEffect(() => {
    const newDisplayedLoad = load.map(value => 
      pressureUnit === 'mbar' 
        ? value 
        : convertUnits(value, 'mbar', pressureUnit)
    );
    setDisplayedLoad(newDisplayedLoad);
  }, [pressureUnit]);
  
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
  
  // Prevent wheel event propagation within the chart container
  useEffect(() => {
    const currentRef = chartContainerRef.current;
    
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    if (currentRef) {
      currentRef.addEventListener('wheel', preventScroll, { passive: false });
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('wheel', preventScroll);
      }
    };
  }, []);
  
  // Data transformed for 3D visualization
  const data3d = transformDataFor3D(mapData, rpm, load);
  const surfaceData = prepareSurfaceData(data3d, rpm.length, load.length);
  
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
            <Select value={pressureUnit} onValueChange={(value) => setPressureUnit(value as 'mbar' | 'kPa' | 'psi')}>
              <SelectTrigger className="w-[90px] h-8 text-sm bg-honda-gray border-honda-gray">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mbar">mbar</SelectItem>
                <SelectItem value="kPa">kPa</SelectItem>
                <SelectItem value="psi">psi</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Save size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-64px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* 2D Table View */}
          <div className="overflow-auto">
            <div className="mb-2 text-sm font-medium text-honda-light">2D Table View</div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="grid-cell grid-header">RPM / Load ({pressureUnit})</th>
                  {rpm.map((r, idx) => (
                    <th key={idx} className="grid-cell grid-header">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="grid-cell grid-header">{displayedLoad[rowIdx].toFixed(0)}</td>
                    {row.map((value, colIdx) => (
                      <td 
                        key={colIdx} 
                        className={`grid-cell ${getCellColorClass(value)} ${
                          selectedCell?.row === rowIdx && selectedCell?.col === colIdx ? 'grid-highlight' : ''
                        }`}
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

          {/* 3D Visualization */}
          <div className="h-full flex flex-col">
            <div className="mb-2 text-sm font-medium text-honda-light">3D Visualization</div>
            <div 
              ref={chartContainerRef}
              className="bg-honda-gray rounded-md flex-1 overflow-hidden max-h-[calc(100%-24px)]"
              style={{ height: 'calc(100% - 24px)', maxHeight: 'calc(100% - 24px)' }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={rpm.map((r, idx) => {
                    const row: any = { rpm: r };
                    displayedLoad.forEach((l, i) => {
                      row[`load${i}`] = mapData[i][idx];
                    });
                    return row;
                  })}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <XAxis dataKey="rpm" label={{ value: 'RPM', position: 'bottom', offset: 0 }} />
                  <YAxis label={{ value: 'Value', angle: -90, position: 'left' }} domain={[0, 30]} />
                  <Tooltip />
                  {displayedLoad.map((l, i) => (
                    <Area
                      key={i}
                      type="monotone"
                      dataKey={`load${i}`}
                      stackId="1"
                      stroke={`hsl(${200 + i * 20}, 80%, 50%)`}
                      fill={`hsl(${200 + i * 20}, 80%, 60%)`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cell Editor */}
        {selectedCell && (
          <div className="mt-4 bg-honda-gray p-3 rounded-md">
            <h3 className="text-sm font-bold text-honda-light">Cell Editor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-honda-dark rounded p-2">
                <div className="text-xs text-honda-light">
                  RPM: <span className="font-bold">{rpm[selectedCell.col]}</span>
                </div>
                <div className="text-xs text-honda-light">
                  Load: <span className="font-bold">{displayedLoad[selectedCell.row].toFixed(0)} {pressureUnit}</span>
                </div>
                <div className="text-lg font-bold text-honda-red mt-1">
                  {mapData[selectedCell.row][selectedCell.col]}
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
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
              </div>
              
              <div className="flex flex-col justify-center">
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
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FuelMap;
