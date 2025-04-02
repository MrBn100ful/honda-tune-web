import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Save, X, Upload, Percent, ChevronUp, ChevronDown, LucideBox, Move } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import FuelMap3D from './FuelMap3D';
import { ScrollArea } from "@/components/ui/scroll-area";

interface CellEditorProps {
  value: number;
  onSave: (value: number) => void;
  onCancel: () => void;
}

interface DraggableEditorProps {
  children: React.ReactNode;
  className?: string;
}

const DraggableEditor: React.FC<DraggableEditorProps> = ({ children, className }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editorRef.current && e.target === editorRef.current.querySelector('.drag-handle')) {
      setIsDragging(true);
      const rect = editorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={editorRef}
      className={`absolute z-50 shadow-lg ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="drag-handle bg-honda-gray/90 p-2 rounded-t-md flex items-center justify-between cursor-move">
        <span className="text-sm font-medium text-honda-light">Cell Editor</span>
        <Move size={16} className="text-honda-light/70" />
      </div>
      {children}
    </div>
  );
};

const MAP_TYPES = {
  FUEL: 'Fuel',
  AFR: 'AFR Target',
  IGNITION: 'Ignition',
  INJ_DUTY: 'Injector Duty',
  BOOST: 'Boost',
};

const generateMapData = (isVtec: boolean = false, mapType: string = MAP_TYPES.FUEL) => {
  const rpm = [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6400, 6800];
  const load = [200, 300, 400, 500, 600, 700, 800, 900, 1000];
  
  const data: number[][] = [];
  
  for (let i = 0; i < load.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < rpm.length; j++) {
      let value = 0;
      
      if (mapType === MAP_TYPES.FUEL) {
        let baseValue = isVtec ? 15 : 10;
        value = baseValue + (i * 0.8) + (j * 0.5);
        
        if (isVtec && j > 8) {
          value += (j - 8) * 0.3;
        }
      } 
      else if (mapType === MAP_TYPES.AFR) {
        let baseValue = 14.7;
        value = baseValue - (i * 0.2) - (j * 0.1);
        value = Math.max(value, 11.5);
      }
      else if (mapType === MAP_TYPES.IGNITION) {
        let baseValue = 15;
        value = baseValue + (j * 0.4) - (i * 0.6);
        value = Math.max(value, 5);
      }
      else if (mapType === MAP_TYPES.INJ_DUTY) {
        value = 20 + (i * 5) + (j * 3);
        value = Math.min(value, 85);
      }
      else if (mapType === MAP_TYPES.BOOST) {
        value = Math.max(0, -5 + (i * 0.8) + (j * 0.4));
      }
      
      value += Math.random() * 2 - 1;
      row.push(parseFloat(value.toFixed(1)));
    }
    data.push(row);
  }
  
  return { rpm, load, data };
};

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

const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
  let inMbar = value;
  if (fromUnit !== 'mbar') {
    if (fromUnit === 'kPa') {
      inMbar = value * 10;
    } else if (fromUnit === 'psi') {
      inMbar = value * 68.9476;
    }
  }
  
  if (toUnit === 'mbar') {
    return inMbar;
  } else if (toUnit === 'kPa') {
    return inMbar / 10;
  } else if (toUnit === 'psi') {
    return inMbar / 68.9476;
  }
  
  return value;
};

const getMapTypeUnit = (mapType: string): string => {
  switch (mapType) {
    case MAP_TYPES.FUEL:
      return 'ms';
    case MAP_TYPES.AFR:
      return 'λ';
    case MAP_TYPES.IGNITION:
      return '°';
    case MAP_TYPES.INJ_DUTY:
      return '%';
    case MAP_TYPES.BOOST:
      return 'PSI';
    default:
      return '';
  }
};

const getCellColorClass = (value: number, mapType: string, min: number, max: number) => {
  const range = max - min;
  const normalizedValue = (value - min) / range;
  
  if (mapType === MAP_TYPES.AFR) {
    if (normalizedValue > 0.8) return 'cell-value-low';
    if (normalizedValue > 0.6) return 'cell-value-low-mid';
    if (normalizedValue > 0.4) return 'cell-value-mid';
    if (normalizedValue > 0.2) return 'cell-value-mid-high';
    return 'cell-value-high';
  }
  
  if (normalizedValue < 0.2) return 'cell-value-low';
  if (normalizedValue < 0.4) return 'cell-value-low-mid';
  if (normalizedValue < 0.6) return 'cell-value-mid';
  if (normalizedValue < 0.8) return 'cell-value-mid-high';
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
  const [mapType, setMapType] = useState<string>(MAP_TYPES.FUEL);
  const [mapData, setMapData] = useState<number[][]>([]);
  const [rpm, setRpm] = useState<number[]>([]);
  const [load, setLoad] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [selectedCells, setSelectedCells] = useState<{ row: number, col: number }[]>([]);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [pressureUnit, setPressureUnit] = useState<'mbar' | 'kPa' | 'psi'>('mbar');
  const [displayedLoad, setDisplayedLoad] = useState<number[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [percentageAdjustment, setPercentageAdjustment] = useState<number>(5);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  
  useEffect(() => {
    const { rpm: newRpm, load: newLoad, data: newData } = generateMapData(isVtec, mapType);
    setRpm(newRpm);
    setLoad(newLoad);
    setMapData(newData);
    setDisplayedLoad(newLoad);
  }, [isVtec, mapType]);
  
  useEffect(() => {
    if (load.length === 0) return;
    
    const newDisplayedLoad = load.map(value => 
      pressureUnit === 'mbar' 
        ? value 
        : convertUnits(value, 'mbar', pressureUnit)
    );
    setDisplayedLoad(newDisplayedLoad);
  }, [pressureUnit, load]);
  
  const handleCellClick = (row: number, col: number, isMultiSelect: boolean = false) => {
    if (isMultiSelect || selectionMode) {
      const existingIndex = selectedCells.findIndex(cell => cell.row === row && cell.col === col);
      if (existingIndex > -1) {
        const newSelection = [...selectedCells];
        newSelection.splice(existingIndex, 1);
        setSelectedCells(newSelection);
      } else {
        setSelectedCells([...selectedCells, { row, col }]);
      }
    } else {
      setSelectedCells([]);
      setSelectedCell({ row, col });
    }
  };
  
  const adjustValue = (amount: number, isPercentage: boolean = false) => {
    if (selectedCells.length > 0) {
      const newMapData = [...mapData];
      selectedCells.forEach(({ row, col }) => {
        if (isPercentage) {
          const percentChange = amount;
          const currentValue = newMapData[row][col];
          const change = currentValue * (percentChange / 100);
          newMapData[row][col] = parseFloat((currentValue + change).toFixed(1));
        } else {
          newMapData[row][col] = parseFloat((newMapData[row][col] + amount).toFixed(1));
        }
      });
      setMapData(newMapData);
      toast.success(`Adjusted ${selectedCells.length} cells ${isPercentage ? 'by' : 'with'} ${isPercentage ? amount + '%' : amount}`);
    } else if (selectedCell) {
      const { row, col } = selectedCell;
      const newMapData = [...mapData];
      
      if (isPercentage) {
        const percentChange = amount;
        const currentValue = newMapData[row][col];
        const change = currentValue * (percentChange / 100);
        newMapData[row][col] = parseFloat((currentValue + change).toFixed(1));
      } else {
        newMapData[row][col] = parseFloat((newMapData[row][col] + amount).toFixed(1));
      }
      
      setMapData(newMapData);
    }
  };
  
  const setExactValue = (value: number) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newMapData = [...mapData];
    newMapData[row][col] = value;
    setMapData(newMapData);
    setSelectedCell(null);
  };
  
  const selectCellRange = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    const newSelection: { row: number, col: number }[] = [];
    
    if (startRow > endRow) [startRow, endRow] = [endRow, startRow];
    if (startCol > endCol) [startCol, endCol] = [endCol, startCol];
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        newSelection.push({ row: r, col: c });
      }
    }
    
    setSelectedCells(newSelection);
  };
  
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      toast.info("Multi-select mode enabled. Click cells to select multiple cells.");
    } else {
      toast.info("Multi-select mode disabled.");
      setSelectedCells([]);
    }
  };
  
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
  
  const minValue = mapData.length > 0 ? Math.min(...mapData.flat()) : 0;
  const maxValue = mapData.length > 0 ? Math.max(...mapData.flat()) : 0;
  
  const handleSaveMap = () => {
    const mapDataExport = {
      name: `${mapType} Map`,
      rpm: rpm,
      load: displayedLoad,
      data: mapData,
      vtecEnabled: isVtec,
      mapType: mapType,
      pressureUnit: pressureUnit
    };
    
    const blob = new Blob([JSON.stringify(mapDataExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapType.toLowerCase().replace(' ', '-')}-map.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${mapType} map saved successfully!`);
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
        setRpm(mapData.rpm || rpm);
        setLoad(mapData.load || load);
        setDisplayedLoad(mapData.load || load);
        if (mapData.mapType) setMapType(mapData.mapType);
        if (mapData.pressureUnit) setPressureUnit(mapData.pressureUnit as 'mbar' | 'kPa' | 'psi');
        toast.success("Map loaded successfully!");
      } catch (error) {
        console.error('Error loading map:', error);
        toast.error("Error loading map file");
      }
    };
    reader.readAsText(file);
  };

  const interpolateMap = () => {
    if (mapData.length < 3 || mapData[0].length < 3) {
      toast.error("Map is too small to interpolate");
      return;
    }
    
    const newMapData = [...mapData];
    
    const tempMap = mapData.map(row => [...row]);
    
    for (let i = 1; i < mapData.length - 1; i++) {
      for (let j = 1; j < mapData[i].length - 1; j++) {
        if (selectedCells.some(cell => cell.row === i && cell.col === j)) {
          continue;
        }
        
        const avg = (
          tempMap[i-1][j-1] + tempMap[i-1][j] + tempMap[i-1][j+1] +
          tempMap[i][j-1] + tempMap[i][j+1] +
          tempMap[i+1][j-1] + tempMap[i+1][j] + tempMap[i+1][j+1]
        ) / 8;
        
        newMapData[i][j] = parseFloat(avg.toFixed(1));
      }
    }
    
    setMapData(newMapData);
    toast.success("Map interpolated successfully");
  };

  const generateMapReport = () => {
    const report = {
      mapType,
      minValue,
      maxValue,
      average: parseFloat((mapData.flat().reduce((a, b) => a + b, 0) / mapData.flat().length).toFixed(2)),
      vtecEnabled: isVtec,
      cellCount: mapData.flat().length,
      rpm: {
        min: Math.min(...rpm),
        max: Math.max(...rpm),
        range: Math.max(...rpm) - Math.min(...rpm)
      },
      load: {
        min: Math.min(...displayedLoad),
        max: Math.max(...displayedLoad),
        unit: pressureUnit
      }
    };
    
    console.log('Map Report:', report);
    
    toast.info(`Map Report: Avg=${report.average}${getMapTypeUnit(mapType)}, Range=${report.minValue}-${report.maxValue}${getMapTypeUnit(mapType)}`);
  };

  const getDisplayedLoadValue = (idx: number) => {
    if (!displayedLoad || idx >= displayedLoad.length || displayedLoad[idx] === undefined) {
      return "N/A";
    }
    return displayedLoad[idx].toFixed(0);
  };

  return (
    <Card className="w-full h-full bg-honda-dark border-honda-gray overflow-hidden">
      <CardHeader className="pb-2 flex-none">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CardTitle className="text-honda-light">Tuning Maps</CardTitle>
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
            <Select value={mapType} onValueChange={setMapType}>
              <SelectTrigger className="w-[120px] h-8 text-sm bg-honda-gray border-honda-gray">
                <SelectValue placeholder="Map Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MAP_TYPES.FUEL}>Fuel</SelectItem>
                <SelectItem value={MAP_TYPES.AFR}>AFR Target</SelectItem>
                <SelectItem value={MAP_TYPES.IGNITION}>Ignition</SelectItem>
                <SelectItem value={MAP_TYPES.INJ_DUTY}>Injector Duty</SelectItem>
                <SelectItem value={MAP_TYPES.BOOST}>Boost</SelectItem>
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
                  <DialogTitle className="text-honda-light">Load Map</DialogTitle>
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
      <CardContent className="h-[calc(100%-60px)] pb-2 overflow-hidden flex flex-col">
        <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-1 flex-none">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectionMode}
                className={`${selectionMode ? 'bg-honda-accent text-white' : 'bg-honda-gray border-honda-gray text-honda-light'} hover:bg-honda-accent/80`}
              >
                {selectionMode ? 'Exit Selection' : 'Multi-Select'} ({selectedCells.length})
              </Button>
              
              {selectedCells.length > 0 && (
                <>
                  <div className="flex items-center">
                    <Label className="text-xs text-honda-light mr-2">Adj %:</Label>
                    <Input
                      type="number"
                      value={percentageAdjustment}
                      onChange={(e) => setPercentageAdjustment(Number(e.target.value))}
                      className="w-16 h-8 text-sm bg-honda-gray border-honda-gray text-honda-light"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustValue(-percentageAdjustment, true)}
                    className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                  >
                    <MinusCircle size={14} className="mr-1" />
                    {percentageAdjustment}%
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustValue(percentageAdjustment, true)}
                    className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                  >
                    <PlusCircle size={14} className="mr-1" />
                    {percentageAdjustment}%
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={interpolateMap}
                className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
              >
                Interpolate
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={generateMapReport}
                className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
              >
                Map Info
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 relative" style={{height: "calc(100% - 340px)"}}>
            <div ref={chartContainerRef} className="w-full">
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
                      <td className="grid-cell grid-header">
                        {getDisplayedLoadValue(rowIdx)}
                      </td>
                      {row.map((value, colIdx) => (
                        <td 
                          key={colIdx} 
                          className={`grid-cell ${getCellColorClass(value, mapType, minValue, maxValue)} ${
                            (selectedCell?.row === rowIdx && selectedCell?.col === colIdx) || 
                            selectedCells.some(cell => cell.row === rowIdx && cell.col === colIdx) 
                              ? 'grid-highlight' : ''
                          }`}
                          onClick={(e) => handleCellClick(rowIdx, colIdx, e.ctrlKey || e.metaKey)}
                        >
                          {value.toFixed(1)}{getMapTypeUnit(mapType)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>

          {showEditor && (selectedCells.length > 0 || selectedCell) && (
            <DraggableEditor className="bg-honda-dark border border-honda-gray/50 rounded-md shadow-lg">
              <div className="p-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => adjustValue(-1)}
                      className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                    >
                      -1
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => adjustValue(-0.1)}
                      className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                    >
                      -0.1
                    </Button>
                    
                    {selectedCell && (
                      <Input
                        type="number"
                        value={mapData[selectedCell.row][selectedCell.col]}
                        onChange={(e) => {
                          const newMapData = [...mapData];
                          newMapData[selectedCell.row][selectedCell.col] = parseFloat(e.target.value);
                          setMapData(newMapData);
                        }}
                        className="w-24 text-center bg-honda-gray border-honda-gray text-honda-light"
                        placeholder="Value"
                      />
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => adjustValue(0.1)}
                      className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                    >
                      +0.1
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => adjustValue(1)}
                      className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                    >
                      +1
                    </Button>
                  </div>
                  
                  {selectedCell && (
                    <div className="text-xs text-honda-light/70">
                      Selected: RPM: {rpm[selectedCell.col]}, Load: {getDisplayedLoadValue(selectedCell.row)} {pressureUnit}
                    </div>
                  )}
                  
                  {selectedCells.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-honda-light/70">
                        {selectedCells.length} cells selected
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => adjustValue(-percentageAdjustment, true)}
                          className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                        >
                          <MinusCircle size={14} className="mr-1" />
                          {percentageAdjustment}%
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => adjustValue(percentageAdjustment, true)}
                          className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                        >
                          <PlusCircle size={14} className="mr-1" />
                          {percentageAdjustment}%
                        </Button>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setSelectedCells([])}
                        className="bg-red-700 hover:bg-red-800"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DraggableEditor>
          )}

          <div className="h-[300px] flex-none mt-2">
            <h3 className="text-sm font-medium text-honda-light mb-1">3D View</h3>
            <FuelMap3D 
              mapData={mapData}
              rpm={rpm}
              load={displayedLoad}
              mapType={mapType}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuelMap;

const styles = `
  .cell-value-low {
    background-color: #22c55e;
    color: white;
  }
  .cell-value-low-mid {
    background-color: #84cc16;
    color: white;
  }
  .cell-value-mid {
    background-color: #eab308;
    color: black;
  }
  .cell-value-mid-high {
    background-color: #f97316;
    color: white;
  }
  .cell-value-high {
    background-color: #ef4444;
    color: white;
  }
  .grid-highlight {
    outline: 2px solid #ffffff;
    position: relative;
    z-index: 10;
  }
`;
