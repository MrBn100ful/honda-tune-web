import { toast } from "sonner";
import { MousePointer, X, Save } from "lucide-react";

export const MAP_TYPES = {
  FUEL: 'Fuel',
  AFR: 'AFR Target',
  IGNITION: 'Ignition',
  INJ_DUTY: 'Injector Duty',
  BOOST: 'Boost',
};

export const generateMapData = (isVtec: boolean = false, mapType: string = MAP_TYPES.FUEL) => {
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

export const transformDataFor3D = (mapData: number[][], rpm: number[], load: number[]) => {
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

export const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
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

export const getMapTypeUnit = (mapType: string): string => {
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

export const getCellColorClass = (value: number, mapType: string, min: number, max: number) => {
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

export const generateBaseMap = (settings: any, mapType: string, pressureUnit: 'bar' | 'kPa') => {
  let rpmRange: number[] = [];
  let loadRange: number[] = [];
  
  const engine = settings.engine || 'b16a';
  const isVtec = engine.includes('vtec') || ['b16a', 'b18c', 'k20a'].includes(engine);
  
  const maxRpm = isVtec ? 9200 : 7600;
  const rpmStep = 400;
  for (let rpm = 800; rpm <= maxRpm; rpm += rpmStep) {
    rpmRange.push(rpm);
  }
  
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
        const normalizedLoad = loadRange[i] / maxLoad;
        const normalizedRpm = rpmRange[j] / maxRpm;
        
        const baseFuel = 3.0;
        
        if (normalizedRpm < 0.15) {
          value = baseFuel * (0.8 + normalizedLoad * 0.5);
        } else if (normalizedRpm < 0.4) {
          value = baseFuel * (0.9 + normalizedLoad * 1.5);
        } else if (normalizedRpm < 0.7) {
          value = baseFuel * (1.0 + normalizedLoad * 2.0);
        } else {
          value = baseFuel * (1.1 + normalizedLoad * 2.5);
        }
        
        if (isVtec && normalizedRpm > 0.6) {
          const vtecEffect = (normalizedRpm - 0.6) * 1.3;
          value += baseFuel * vtecEffect;
        }
      } 
      else if (mapType === MAP_TYPES.AFR) {
        const normalizedLoad = loadRange[i] / maxLoad;
        const normalizedRpm = rpmRange[j] / maxRpm;
        
        let baseAfr = 14.7;
        
        if (normalizedLoad < 0.3 && normalizedRpm < 0.4) {
          value = baseAfr + (0.3 - normalizedLoad) * 1.0;
        } else if (normalizedLoad < 0.6) {
          value = baseAfr;
        } else {
          value = baseAfr - (normalizedLoad - 0.6) * 4.0;
          if (normalizedRpm > 0.7) {
            value -= (normalizedRpm - 0.7) * 0.8;
          }
        }
        
        value = Math.max(value, 11.5);
        value = Math.min(value, 15.5);
      }
      else if (mapType === MAP_TYPES.IGNITION) {
        const normalizedLoad = loadRange[i] / maxLoad;
        const normalizedRpm = rpmRange[j] / maxRpm;
        
        let baseTiming = 10;
        
        if (normalizedLoad < 0.4) {
          value = baseTiming + 20 - normalizedLoad * 15;
        } else if (normalizedLoad < 0.7) {
          value = baseTiming + 14 - normalizedLoad * 10;
        } else {
          value = baseTiming + 7 - normalizedLoad * 10;
        }
        
        if (normalizedRpm < 0.2) {
          value -= 2;
        } else if (normalizedRpm > 0.7) {
          value -= (normalizedRpm - 0.7) * 5;
        }
        
        value = Math.max(value, 0);
        value = Math.min(value, 40);
      }
      else if (mapType === MAP_TYPES.INJ_DUTY) {
        const normalizedLoad = loadRange[i] / maxLoad;
        const normalizedRpm = rpmRange[j] / maxRpm;
        
        if (normalizedRpm < 0.15) {
          value = 3 + normalizedLoad * 15;
        } else if (normalizedLoad < 0.5) {
          value = 10 + normalizedLoad * 40;
        } else {
          value = 30 + normalizedLoad * 65;
        }
        
        value += normalizedRpm * 20;
        
        value = Math.min(value, 95);
      }
      else if (mapType === MAP_TYPES.BOOST) {
        if (settings.turbo || settings.supercharged) {
          const normalizedLoad = loadRange[i] / maxLoad;
          const normalizedRpm = rpmRange[j] / maxRpm;
          
          if (normalizedRpm < 0.3) {
            value = 0;
          } else {
            value = normalizedLoad * 15;
            value *= (normalizedRpm - 0.3) * 1.4;
            value = Math.max(value, 0);
            value = Math.min(value, 20);
          }
        } else {
          value = 0;
        }
      }
      
      const variation = (Math.random() * 0.4) - 0.2;
      value = parseFloat((value + variation).toFixed(1));
      row.push(value);
    }
    newMapData.push(row);
  }
  
  const newDisplayedLoad = loadRange.map(value => 
    pressureUnit === 'kPa' 
      ? value 
      : convertUnits(value, 'kPa', pressureUnit)
  );
  
  return { 
    rpm: rpmRange, 
    load: loadRange, 
    mapData: newMapData, 
    isVtec, 
    displayedLoad: newDisplayedLoad 
  };
};

export const handleSaveMap = (mapType: string, rpm: number[], displayedLoad: number[], mapData: number[][], isVtec: boolean, pressureUnit: 'bar' | 'kPa') => {
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

export const getCellAtPosition = (tableRef: React.RefObject<HTMLTableElement>, rpmLength: number, x: number, y: number): { row: number, col: number } | null => {
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
      if (i % (rpmLength + 1) === 0) continue;
      
      const row = Math.floor(i / (rpmLength + 1));
      const col = (i % (rpmLength + 1)) - 1;
      if (col >= 0) {
        return { row, col };
      }
    }
  }
  return null;
};

export const getSelectionBoxStyle = (isDragging: boolean, dragStart: {x: number, y: number} | null, dragEnd: {x: number, y: number} | null) => {
  if (!isDragging || !dragStart || !dragEnd) return null;
  
  const left = Math.min(dragStart.x, dragEnd.x);
  const top = Math.min(dragStart.y, dragEnd.y);
  const width = Math.abs(dragEnd.x - dragStart.x);
  const height = Math.abs(dragEnd.y - dragStart.y);
  
  return {
    position: 'fixed' as const,
    left,
    top,
    width,
    height,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    pointerEvents: 'none' as const,
    zIndex: 10
  };
};

export const interpolateMap = (mapData: number[][], selectedCells: {row: number, col: number}[]) => {
  if (mapData.length < 3 || mapData[0].length < 3) {
    toast.error("Map is too small to interpolate");
    return mapData;
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
  
  toast.success("Map interpolated successfully");
  return newMapData;
};

export const generateMapReport = (mapData: number[][], mapType: string, rpm: number[], displayedLoad: number[], isVtec: boolean, pressureUnit: 'bar' | 'kPa') => {
  const minValue = mapData.length > 0 ? Math.min(...mapData.flat()) : 0;
  const maxValue = mapData.length > 0 ? Math.max(...mapData.flat()) : 0;
  
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
  return report;
};

export const selectCellsInRange = (startCell: { row: number, col: number }, endCell: { row: number, col: number }, existingSelectedCells: { row: number, col: number }[]) => {
  const minRow = Math.min(startCell.row, endCell.row);
  const maxRow = Math.max(startCell.row, endCell.row);
  const minCol = Math.min(startCell.col, endCell.col);
  const maxCol = Math.max(startCell.col, endCell.col);
  
  const newSelectedCells: { row: number, col: number }[] = [];
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const isAlreadySelected = existingSelectedCells.some(
        cell => cell.row === row && cell.col === col
      );
      
      if (!isAlreadySelected) {
        newSelectedCells.push({ row, col });
      }
    }
  }
  
  return [...existingSelectedCells, ...newSelectedCells];
};

export const adjustMapValues = (
  mapData: number[][], 
  selectedCells: { row: number, col: number }[], 
  selectedCell: { row: number, col: number } | null, 
  amount: number, 
  isPercentage: boolean = false
) => {
  const newMapData = [...mapData];
  
  if (selectedCells.length > 0) {
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
    toast.success(`Adjusted ${selectedCells.length} cells ${isPercentage ? 'by' : 'with'} ${isPercentage ? amount + '%' : amount}`);
  } else if (selectedCell) {
    const { row, col } = selectedCell;
    
    if (isPercentage) {
      const percentChange = amount;
      const currentValue = newMapData[row][col];
      const change = currentValue * (percentChange / 100);
      newMapData[row][col] = parseFloat((currentValue + change).toFixed(1));
    } else {
      newMapData[row][col] = parseFloat((newMapData[row][col] + amount).toFixed(1));
    }
  }
  
  return newMapData;
};

export const toggleSelectionMode = (selectionMode: boolean, setSelectionMode: (mode: boolean) => void, setSelectedCells: (cells: { row: number, col: number }[]) => void) => {
  setSelectionMode(!selectionMode);
  if (!selectionMode) {
    toast.info("Multi-select mode enabled. Click and drag to select multiple cells.", {
      duration: 3000,
    });
  } else {
    toast.info("Multi-select mode disabled.");
    setSelectedCells([]);
  }
};
