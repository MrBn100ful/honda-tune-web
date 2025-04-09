import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import FuelMap3D from './FuelMap3D';
import TableView from './TableView';
import MapControls from './MapControls';
import EmptyState from './EmptyState';
import { 
  MAP_TYPES, 
  generateBaseMap, 
  handleSaveMap as saveMap, 
  getCellAtPosition, 
  selectCellsInRange, 
  adjustMapValues, 
  interpolateMap,
  generateMapReport
} from './utils/mapUtils';

interface FuelMapProps {
  onStartSetup?: () => void;
}

const FuelMap: React.FC<FuelMapProps> = ({ onStartSetup }) => {
  const [isVtec, setIsVtec] = useState(false);
  const [showVtecMap, setShowVtecMap] = useState(false);
  const [mapType, setMapType] = useState<string>(MAP_TYPES.FUEL);
  const [mapData, setMapData] = useState<number[][]>([]);
  const [vtecMapData, setVtecMapData] = useState<number[][]>([]);
  const [rpm, setRpm] = useState<number[]>([]);
  const [load, setLoad] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number, col: number }[]>([]);
  const [pressureUnit, setPressureUnit] = useState<'bar' | 'kPa'>('kPa');
  const [displayedLoad, setDisplayedLoad] = useState<number[]>([]);
  const [percentageAdjustment, setPercentageAdjustment] = useState<number>(5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number, y: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [showEmptyState, setShowEmptyState] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const setupCompleted = localStorage.getItem('ecuSetupCompleted');
    
    if (setupCompleted === "true") {
      setShowEmptyState(false);
      const ecuSettings = JSON.parse(localStorage.getItem('ecuSettings') || '{}');
      initializeMapFromSettings(ecuSettings);
    } else {
      setShowEmptyState(true);
      setRpm([]);
      setLoad([]);
      setMapData([]);
      setVtecMapData([]);
      setDisplayedLoad([]);
    }
  }, []);

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

  const initializeMapFromSettings = (settings: any) => {
    const { rpm: rpmRange, load: loadRange, mapData: newMapData, isVtec: vtec, displayedLoad: newDisplayedLoad } = 
      generateBaseMap(settings, mapType, pressureUnit);
    
    setRpm(rpmRange);
    setLoad(loadRange);
    setMapData(newMapData);
    setIsVtec(vtec);
    setDisplayedLoad(newDisplayedLoad);
    
    if (vtec) {
      let vtecData;
      
      if (mapType === MAP_TYPES.FUEL) {
        vtecData = newMapData.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const rpmFactor = colIndex / row.length;
            const increase = 1.15 + (rpmFactor * 0.2);
            return cell * increase + (Math.random() * 0.5);
          })
        );
      } else if (mapType === MAP_TYPES.IGNITION) {
        vtecData = newMapData.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const rpmFactor = colIndex / row.length;
            return cell + (5 * rpmFactor) + (Math.random() * 0.5);
          })
        );
      } else {
        vtecData = newMapData.map(row => 
          row.map(cell => cell * 1.15 + (Math.random() * 0.5))
        );
      }
      
      setVtecMapData(vtecData);
    }
  };

  const handleStartSetup = () => {
    localStorage.removeItem('ecuSetupCompleted');
    
    if (onStartSetup) {
      onStartSetup();
    } else {
      window.location.href = '#settings';
      document.querySelector('[data-value="settings"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    }
    
    toast.info("Please configure your ECU settings");
  };

  const handleCellClick = (row: number, col: number, isMultiSelect: boolean = false) => {
    if (isDragging) return;
    
    if (row < 0 || col < 0) {
      setSelectedCells([]);
      return;
    }
    
    const existingIndex = selectedCells.findIndex(cell => cell.row === row && cell.col === col);
    if (existingIndex > -1) {
      const newSelection = [...selectedCells];
      newSelection.splice(existingIndex, 1);
      setSelectedCells(newSelection);
    } else {
      if (isMultiSelect) {
        setSelectedCells([...selectedCells, { row, col }]);
      } else {
        setSelectedCells([{ row, col }]);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
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
    
    const startCell = getCellAtPosition(tableRef, rpm.length, dragStart.x, dragStart.y);
    const endCell = getCellAtPosition(tableRef, rpm.length, dragEnd.x, dragEnd.y);
    
    if (startCell && endCell) {
      const newSelectedCells = selectCellsInRange(startCell, endCell, selectedCells);
      setSelectedCells(newSelectedCells);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const adjustValue = (amount: number, isPercentage: boolean = false) => {
    const currentMapData = showVtecMap && isVtec ? vtecMapData : mapData;
    const newMapData = adjustMapValues(currentMapData, selectedCells, null, amount, isPercentage);
    
    if (showVtecMap && isVtec) {
      setVtecMapData(newMapData);
    } else {
      setMapData(newMapData);
    }
  };

  const setExactValue = (value: number) => {
  };

  const handleInterpolateMap = () => {
    const currentMapData = showVtecMap && isVtec ? vtecMapData : mapData;
    const newMapData = interpolateMap(currentMapData, selectedCells);
    
    if (showVtecMap && isVtec) {
      setVtecMapData(newMapData);
    } else {
      setMapData(newMapData);
    }
  };

  const handleGenerateMapReport = () => {
    const currentMapData = showVtecMap && isVtec ? vtecMapData : mapData;
    const currentMapType = showVtecMap && isVtec ? `${mapType} VTEC` : mapType;
    
    generateMapReport(currentMapData, currentMapType, rpm, displayedLoad, isVtec, pressureUnit);
  };

  const handleSaveMapClick = () => {
    if (showVtecMap && isVtec) {
      saveMap(`${mapType} VTEC`, rpm, displayedLoad, vtecMapData, isVtec, pressureUnit);
    } else {
      saveMap(mapType, rpm, displayedLoad, mapData, isVtec, pressureUnit);
    }
  };

  const handleLoadMapClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      toast.error("File input reference not available");
      console.error("fileInputRef is not available");
    }
  };

  const handleLoadMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData = JSON.parse(e.target?.result as string);
        setIsVtec(mapData.vtecEnabled || false);
        setMapData(mapData.data || []);
        setRpm(mapData.rpm || rpm);
        setLoad(mapData.load || load);
        setDisplayedLoad(mapData.load || load);
        if (mapData.mapType) setMapType(mapData.mapType);
        if (mapData.pressureUnit) setPressureUnit(mapData.pressureUnit as 'bar' | 'kPa');
        setShowEmptyState(false);
        
        if (mapData.vtecEnabled) {
          const vtecData = mapData.data.map((row: number[]) => 
            row.map((cell: number) => cell * 1.15 + (Math.random() * 0.5))
          );
          setVtecMapData(vtecData);
        }
        
        toast.success("Map loaded successfully!");
      } catch (error) {
        console.error('Error loading map:', error);
        toast.error("Error loading map file");
      }
    };
    reader.readAsText(file);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const toggleVtecMap = () => {
    if (isVtec) {
      setShowVtecMap(!showVtecMap);
      if (showVtecMap) {
        toast.info("Showing standard map");
      } else {
        toast.info("Showing VTEC map");
      }
    } else {
      toast.info("VTEC is not enabled for this engine");
    }
  };

  const clearSelection = () => {
    setSelectedCells([]);
    toast.info("Selection cleared");
  };

  if (showEmptyState) {
    return (
      <EmptyState 
        handleStartSetup={handleStartSetup} 
        handleLoadMap={handleLoadMap} 
        fileInputRef={fileInputRef} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MapControls
        mapType={mapType}
        setMapType={setMapType}
        selectedCellsCount={selectedCells.length}
        adjustValue={adjustValue}
        percentageAdjustment={percentageAdjustment}
        setPercentageAdjustment={setPercentageAdjustment}
        interpolateMap={handleInterpolateMap}
        generateMapReport={handleGenerateMapReport}
        handleSaveMap={handleSaveMapClick}
        onLoadClick={handleLoadMapClick}
        clearSelection={clearSelection}
        isVtec={isVtec}
        showVtecMap={showVtecMap}
        toggleVtecMap={toggleVtecMap}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="h-2/3 overflow-auto border-b">
          <TableView 
            rpm={rpm}
            displayedLoad={displayedLoad}
            mapData={mapData}
            selectedCell={null}
            selectedCells={selectedCells}
            pressureUnit={pressureUnit}
            mapType={mapType}
            isDragging={isDragging}
            dragStart={dragStart}
            dragEnd={dragEnd}
            onCellClick={handleCellClick}
            setExactValue={setExactValue}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            tableRef={tableRef}
            vtecMapData={isVtec ? vtecMapData : undefined}
            showVtecMap={showVtecMap}
          />
        </div>
        
        <div className="h-1/3 p-2" ref={chartContainerRef}>
          <div className="w-full h-full bg-card rounded-lg overflow-hidden">
            <FuelMap3D 
              mapData={showVtecMap && isVtec ? vtecMapData : mapData} 
              rpm={rpm} 
              load={load}
              mapType={mapType}
            />
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleLoadMap}
      />
    </div>
  );
};

export default FuelMap;
