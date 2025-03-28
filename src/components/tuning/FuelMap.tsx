import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Save, X, Upload } from "lucide-react";
import {
  Area,
  AreaChart,
  Surface,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Sample data for the fuel map
const generateMapData = (isVtec: boolean = false) => {
  const rpm = [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6400, 6800];
  const load = [200, 300, 400, 500, 600, 700, 800, 900, 1000];
  
  const data: number[][] = [];
  
  for (let i = 0; i < load.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < rpm.length; j++) {
      // Generate different values for VTEC and non-VTEC
      let baseValue = isVtec ? 15 : 10; // Higher base for VTEC
      let value = baseValue + (i * 0.8) + (j * 0.5);
      
      // Add more aggressive values for VTEC at higher RPMs
      if (isVtec && j > 8) { // Above 4000 RPM
        value += (j - 8) * 0.3; // Progressive increase
      }
      
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
  const minValue = Math.min(...data.flat());
  const maxValue = Math.max(...data.flat());
  const range = maxValue - minValue;
  const normalizedValue = (value - minValue) / range;
  
  if (normalizedValue < 0.33) return 'cell-value-low';
  if (normalizedValue < 0.66) return 'cell-value-medium';
  return 'cell-value-high';
};

const CellEditor = ({ value, onSave, onCancel }: CellEditorProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onSave(numValue);
    }
  };

  return (
    <div className="absolute inset-0 bg-honda-dark border-2 border-honda-accent rounded-md p-2 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-xs text-honda-light">Edit Value</Label>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 text-honda-light/70 hover:text-honda-light"
          onClick={onCancel}
        >
          <X size={12} />
        </Button>
      </div>
      <Input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        className="h-6 text-xs bg-honda-gray border-honda-gray text-honda-light"
        autoFocus
      />
    </div>
  );
};

const FuelMap = () => {
  const [isVtec, setIsVtec] = useState(false);
  const [mapData, setMapData] = useState(data);
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [pressureUnit, setPressureUnit] = useState<'mbar' | 'kPa' | 'psi'>('mbar');
  const [displayedLoad, setDisplayedLoad] = useState(load);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Update map data when VTEC state changes
  useEffect(() => {
    const { data: newData } = generateMapData(isVtec);
    setMapData(newData);
  }, [isVtec]);
  
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
  
  const handleSaveMap = () => {
    const mapData = {
      name: "Fuel Map",
      rpm: rpm,
      load: displayedLoad,
      data: mapData,
      vtecEnabled: isVtec,
      vtecData: data
    };
    
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fuel-map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData = JSON.parse(e.target?.result as string);
        setIsVtec(mapData.vtecEnabled);
        setMapData(mapData.data);
        setDisplayedLoad(mapData.load);
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full h-full bg-honda-dark border-honda-gray">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CardTitle className="text-honda-light">Fuel Map</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={isVtec ? "default" : "outline"}
                size="sm"
                onClick={() => setIsVtec(true)}
                className={`${isVtec ? 'bg-honda-red hover:bg-honda-red/90 text-white' : 'bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark'}`}
              >
                High Cam
              </Button>
              <Button
                variant={!isVtec ? "default" : "outline"}
                size="sm"
                onClick={() => setIsVtec(false)}
                className={`${!isVtec ? 'bg-honda-gray hover:bg-honda-gray/90 text-white' : 'bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark'}`}
              >
                Low Cam
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                >
                  <Upload size={16} className="mr-2" />
                  Load Map
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-honda-dark border-honda-gray">
                <DialogHeader>
                  <DialogTitle className="text-honda-light">Load Fuel Map</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-honda-light/70">Select Map File</Label>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleLoadMap}
                      className="bg-honda-gray border-honda-gray text-honda-light"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveMap}
              className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
            >
              <Save size={16} className="mr-2" />
              Save Map
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-64px)]">
        <div className="grid grid-cols-1 gap-4 h-full">
          {/* Table View */}
          <div className="overflow-auto relative">
            <div className="mb-2 text-sm font-medium text-honda-light">Table View</div>
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

            {/* Cell Editor Panel */}
            {selectedCell && (
              <CellEditor
                value={mapData[selectedCell.row][selectedCell.col]}
                onSave={(newValue) => {
                  const newMapData = [...mapData];
                  newMapData[selectedCell.row][selectedCell.col] = newValue;
                  setMapData(newMapData);
                  setSelectedCell(null);
                }}
                onCancel={() => setSelectedCell(null)}
              />
            )}
          </div>

          {/* Table Visualization */}
          <div className="h-full flex flex-col">
            <div className="mb-2 text-sm font-medium text-honda-light">Table Visualization</div>
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
      </CardContent>
    </Card>
  );
};

export default FuelMap;
