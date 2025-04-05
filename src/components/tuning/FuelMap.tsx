
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
  interpolateMap as interpolate,
  generateMapReport as generateReport
} from './utils/mapUtils';

const FuelMap = () => {
  const [isVtec, setIsVtec] = useState(false);
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
  
  // Initialize on load
  useEffect(() => {
    const setupCompleted = localStorage.getItem('ecuSetupCompleted');
    
    // Always show empty state on first load, regardless of setup status
    setShowEmptyState(true);
    
    if (setupCompleted) {
      const ecuSettings = JSON.parse(localStorage.getItem('ecuSettings') || '{}');
      initializeMapFromSettings(ecuSettings);
    } else {
      setRpm([]);
      setLoad([]);
      setMapData([]);
      setVtecMapData([]);
      setDisplayedLoad([]);
    }
  }, []);

  // Prevent wheel scrolling in 3D view
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
    
    // Generate VTEC map if the engine has VTEC
    if (vtec) {
      // Create a slightly modified version for VTEC
      const vtecData = newMapData.map(row => 
        row.map(cell => cell * 1.15 + (Math.random() * 0.5))
      );
      setVtecMapData(vtecData);
    }
  };
  
  const handleStartSetup = () => {
    localStorage.removeItem('ecuSetupCompleted');
    window.location.href = '#settings';
    document.querySelector('[data-value="settings"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  };
  
  const handleCellClick = (row: number, col: number, isMultiSelect: boolean = false) => {
    if (isDragging) return;
    
    // If negative indices, clear selection
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
    const newMapData = adjustMapValues(mapData, selectedCells, null, amount, isPercentage);
    setMapData(newMapData);
    
    // Also adjust VTEC map if applicable
    if (isVtec && vtecMapData.length > 0) {
      const newVtecMapData = adjustMapValues(vtecMapData, selectedCells, null, amount, isPercentage);
      setVtecMapData(newVtecMapData);
    }
  };
  
  const setExactValue = (value: number) => {
    // This function is no longer used since we removed direct editing
  };
  
  const handleInterpolateMap = () => {
    const newMapData = interpolate(mapData, selectedCells);
    setMapData(newMapData);
    
    if (isVtec && vtecMapData.length > 0) {
      const newVtecMapData = interpolate(vtecMapData, selectedCells);
      setVtecMapData(newVtecMapData);
    }
  };
  
  const handleGenerateMapReport = () => {
    generateReport(mapData, mapType, rpm, displayedLoad, isVtec, pressureUnit);
    
    if (isVtec && vtecMapData.length > 0) {
      generateReport(vtecMapData, `${mapType} VTEC`, rpm, displayedLoad, isVtec, pressureUnit);
    }
  };
  
  const handleSaveMap = () => {
    saveMap(mapType, rpm, displayedLoad, mapData, isVtec, pressureUnit);
    
    if (isVtec && vtecMapData.length > 0) {
      saveMap(`${mapType} VTEC`, rpm, displayedLoad, vtecMapData, isVtec, pressureUnit);
    }
  };

  const handleLoadMapClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    
    // Clear the input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };
  
  if (showEmptyState) {
    return <EmptyState handleStartSetup={handleStartSetup} handleLoadMap={handleLoadMap} fileInputRef={fileInputRef} />;
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
        handleSaveMap={handleSaveMap}
        onLoadClick={handleLoadMapClick}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Table View */}
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
          />
        </div>
        
        {/* 3D View */}
        <div className="h-1/3 p-2" ref={chartContainerRef}>
          <div className="w-full h-full bg-card rounded-lg overflow-hidden">
            <FuelMap3D 
              mapData={mapData} 
              rpm={rpm} 
              load={load}
              mapType={mapType}
            />
          </div>
        </div>
      </div>
      
      {/* Hidden file input for map loading */}
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
