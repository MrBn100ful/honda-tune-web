import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Save, X, Upload, Percent, ChevronUp, ChevronDown, LucideBox, Move, Grid3X3, MousePointer, Eraser, Info, Maximize, Minimize, AlertTriangle, Settings, FileUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import FuelMap3D from './FuelMap3D';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "../ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [pressureUnit, setPressureUnit] = useState<'bar' | 'kPa'>('kPa');
  const [displayedLoad, setDisplayedLoad] = useState<number[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [percentageAdjustment, setPercentageAdjustment] = useState<number>(5);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number, y: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [isProjectSetup, setIsProjectSetup] = useState<boolean>(false);
  const [showEmptyState, setShowEmptyState] = useState<boolean>(true);
  const [setupOption, setSetupOption] = useState<'wizard' | 'load' | null>(null);
  
  useEffect(() => {
    const setupCompleted = localStorage.getItem('ecuSetupCompleted');
    setIsProjectSetup(!!setupCompleted);
    
    if (setupCompleted) {
      const ecuSettings = JSON.parse(localStorage.getItem('ecuSettings') || '{}');
      generateBaseMap(ecuSettings);
      setShowEmptyState(false);
    } else {
      setRpm([]);
      setLoad([]);
      setMapData([]);
      setDisplayedLoad([]);
      setShowEmptyState(true);
    }
  }, []);

  const generateBaseMap = (settings: any) => {
    let rpmRange: number[] = [];
    let loadRange: number[] = [];
    
    const engine = settings.engine || 'b16a';
    const isVtec = engine.includes('vtec') || ['b16a', 'b18c', 'k20a'].includes(engine);
    
    // More realistic RPM range
    const maxRpm = isVtec ? 9200 : 7600;
    const rpmStep = 400;
    for (let rpm = 800; rpm <= maxRpm; rpm += rpmStep) {
      rpmRange.push(rpm);
    }
    
    // More realistic load range (kPa)
    const loadStep = 10;
    const maxLoad = 100;
    for (let load = 20; load <= maxLoad; load += loadStep) {
      loadRange.push(load);
    }
    
    const newMapData: number[][] = [];
    for (let i = 0; i < loadRange.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < rpmRange.length; j++) {
        let value = 0;
        
        if (mapType === MAP_TYPES.FUEL) {
          // Realistic base fuel map values (in ms)
          const normalizedLoad = loadRange[i] / maxLoad;
          const normalizedRpm = rpmRange[j] / maxRpm;
          
          // Base fuel at idle is around 2.5-3.5ms for most engines
          const baseFuel = 3.0;
          
          // Increase with load, modified by RPM
          if (normalizedRpm < 0.15) {
            // Idle region
            value = baseFuel * (0.8 + normalizedLoad * 0.5);
          } else if (normalizedRpm < 0.4) {
            // Low-mid RPM, more sensitive to load
            value = baseFuel * (0.9 + normalizedLoad * 1.5);
          } else if (normalizedRpm < 0.7) {
            // Mid RPM, efficiency zone
            value = baseFuel * (1.0 + normalizedLoad * 2.0);
          } else {
            // High RPM, needs more fuel
            value = baseFuel * (1.1 + normalizedLoad * 2.5);
          }
          
          // VTEC adjustments
          if (isVtec && normalizedRpm > 0.6) {
            // VTEC engagement typically around 5500 RPM
            const vtecEffect = (normalizedRpm - 0.6) * 1.3;
            value += baseFuel * vtecEffect;
          }
        } 
        else if (mapType === MAP_TYPES.AFR) {
          // Realistic AFR values
          const normalizedLoad = loadRange[i] / maxLoad;
          const normalizedRpm = rpmRange[j] / maxRpm;
          
          // Start at stoichiometric (14.7:1)
          let baseAfr = 14.7;
          
          // Idle and cruise - lean
          if (normalizedLoad < 0.3 && normalizedRpm < 0.4) {
            value = baseAfr + (0.3 - normalizedLoad) * 1.0;
          }
          // Partial throttle - near stoichiometric
          else if (normalizedLoad < 0.6) {
            value = baseAfr;
          }
          // High load - richer
          else {
            value = baseAfr - (normalizedLoad - 0.6) * 4.0;
            // Even richer at high RPM and load
            if (normalizedRpm > 0.7) {
              value -= (normalizedRpm - 0.7) * 0.8;
            }
          }
          
          // Clamp to realistic values
          value = Math.max(value, 11.5);
          value = Math.min(value, 15.5);
        }
        else if (mapType === MAP_TYPES.IGNITION) {
          // Realistic ignition timing values
          const normalizedLoad = loadRange[i] / maxLoad;
          const normalizedRpm = rpmRange[j] / maxRpm;
          
          // Base timing around 10-12 degrees
          let baseTiming = 10;
          
          // Low load - more advance
          if (normalizedLoad < 0.4) {
            value = baseTiming + 20 - normalizedLoad * 15;
          }
          // Medium load - moderate advance
          else if (normalizedLoad < 0.7) {
            value = baseTiming + 14 - normalizedLoad * 10;
          }
          // High load - reduced advance to prevent knock
          else {
            value = baseTiming + 7 - normalizedLoad * 10;
          }
          
          // RPM adjustments
          if (normalizedRpm < 0.2) {
            // Idle region - less advance
            value -= 2;
          } else if (normalizedRpm > 0.7) {
            // High RPM - slightly reduced advance
            value -= (normalizedRpm - 0.7) * 5;
          }
          
          // Clamp to realistic values
          value = Math.max(value, 0);
          value = Math.min(value, 40);
        }
        else if (mapType === MAP_TYPES.INJ_DUTY) {
          // Realistic injector duty cycle
          const normalizedLoad = loadRange[i] / maxLoad;
          const normalizedRpm = rpmRange[j] / maxRpm;
          
          // Idle is around 3-10%
          if (normalizedRpm < 0.15) {
            value = 3 + normalizedLoad * 15;
          }
          // Cruise is around 10-30%
          else if (normalizedLoad < 0.5) {
            value = 10 + normalizedLoad * 40;
          }
          // Higher loads
          else {
            value = 30 + normalizedLoad * 65;
          }
          
          // RPM effect (higher RPM means less time to inject)
          value += normalizedRpm * 20;
          
          // Clamp to realistic values
          value = Math.min(value, 95); // Never want 100% duty cycle
        }
        else if (mapType === MAP_TYPES.BOOST) {
          // Only relevant for boosted engines
          if (settings.turbo || settings.supercharged) {
            const normalizedLoad = loadRange[i] / maxLoad;
            const normalizedRpm = rpmRange[j] / maxRpm;
            
            // No boost at low RPM
            if (normalizedRpm < 0.3) {
              value = 0;
            }
            // Boost builds
            else {
              // Base boost based on load
              value = normalizedLoad * 15;
              
              // Boost builds with RPM
              value *= (normalizedRpm - 0.3) * 1.4;
              
              // Clamp to realistic values
              value = Math.max(value, 0);
              value = Math.min(value, 20); // 20 PSI is a lot!
            }
          } else {
            value = 0; // No boost for NA engines
          }
        }
        
        // Add small variations for realism
        const variation = (Math.random() * 0.4) - 0.2;
        value = parseFloat((value + variation).toFixed(1));
        row.push(value);
      }
      newMapData.push(row);
    }
    
    setRpm(rpmRange);
    setLoad(loadRange);
    setMapData(newMapData);
    setIsVtec(isVtec);
    
    const newDisplayedLoad = loadRange.map(value => 
      pressureUnit === 'kPa' 
        ? value 
        : convertUnits(value, 'kPa', pressureUnit)
    );
    setDisplayedLoad(newDisplayedLoad);
  };
  
  const handleStartSetup = () => {
    localStorage.removeItem('ecuSetupCompleted');
    window.location.href = '#settings';
    document.querySelector('[data-value="settings"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  };
  
  const getCellAtPosition = (x: number, y: number): { row: number, col: number } | null => {
    if (!tableRef.current) return null;
    
    const cells = tableRef.current.querySelectorAll('td');
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const rect = cell.getBoundingClientRect();
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        if (i % (rpm.length + 1) === 0) continue;
        
        const row = Math.floor(i / (rpm.length + 1));
        const col = (i % (rpm.length + 1)) - 1;
        if (col >= 0) {
          return { row, col };
        }
      }
    }
    return null;
  };
  
  const handleCellClick = (row: number, col: number, isMultiSelect: boolean = false) => {
    if (isDragging) return;
    
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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !selectionMode) return;
    
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedCells([]);
      setSelectedCell(null);
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragEnd({ x: e.clientX, y: e.clientY });
    
    e.preventDefault();
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragEnd({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      return;
    }
    
    const startCell = getCellAtPosition(dragStart.x, dragStart.y);
    const endCell = getCellAtPosition(dragEnd.x, dragEnd.y);
    
    if (startCell && endCell) {
      selectCellsInRange(startCell, endCell);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };
  
  const selectCellsInRange = (startCell: { row: number, col: number }, endCell: { row: number, col: number }) => {
    const minRow = Math.min(startCell.row, endCell.row);
    const maxRow = Math.max(startCell.row, endCell.row);
    const minCol = Math.min(startCell.col, endCell.col);
    const maxCol = Math.max(startCell.col, endCell.col);
    
    const newSelectedCells: { row: number, col: number }[] = [];
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const isAlreadySelected = selectedCells.some(
          cell => cell.row === row && cell.col === col
        );
        
        if (!isAlreadySelected) {
          newSelectedCells.push({ row, col });
        }
      }
    }
    
    setSelectedCells([...selectedCells, ...newSelectedCells]);
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
      toast.info("Multi-select mode enabled. Click and drag to select multiple cells.", {
        duration: 3000,
        icon: <MousePointer size={16} />,
      });
    } else {
      toast.info("Multi-select mode disabled.", {
        icon: <X size={16} />,
      });
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
    toast.success(`${mapType} map saved successfully!`, {
      icon: <Save size={16} />,
    });
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
        if (mapData.pressureUnit) setPressureUnit(mapData.pressureUnit as 'bar' | 'kPa');
        setShowEmptyState(false);
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

  const getSelectionBoxStyle = () => {
    if (!isDragging || !dragStart || !dragEnd) return null;
