
import React, { useRef, useMemo } from 'react';
import { getCellColorClass, getSelectionBoxStyle, getMapTypeUnit } from './utils/mapUtils';

interface TableViewProps {
  rpm: number[];
  displayedLoad: number[];
  mapData: number[][];
  selectedCell: { row: number, col: number } | null;
  selectedCells: { row: number, col: number }[];
  pressureUnit: string;
  mapType: string;
  isDragging: boolean;
  dragStart: { x: number, y: number } | null;
  dragEnd: { x: number, y: number } | null;
  onCellClick: (row: number, col: number, isMultiSelect: boolean) => void;
  setExactValue: (value: number) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  tableRef: React.RefObject<HTMLTableElement>;
  vtecMapData?: number[][];
  showVtecMap: boolean;
}

const TableView: React.FC<TableViewProps> = ({
  rpm,
  displayedLoad,
  mapData,
  selectedCell,
  selectedCells,
  pressureUnit,
  mapType,
  isDragging,
  dragStart,
  dragEnd,
  onCellClick,
  setExactValue,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  tableRef,
  vtecMapData,
  showVtecMap
}) => {
  const minValue = useMemo(() => mapData.length > 0 ? Math.min(...mapData.flat()) : 0, [mapData]);
  const maxValue = useMemo(() => mapData.length > 0 ? Math.max(...mapData.flat()) : 0, [mapData]);
  const unit = useMemo(() => getMapTypeUnit(mapType), [mapType]);
  
  const getDisplayedLoadValue = (idx: number) => {
    if (!displayedLoad || idx >= displayedLoad.length || displayedLoad[idx] === undefined) {
      return "N/A";
    }
    return displayedLoad[idx].toFixed(0);
  };

  const displayData = showVtecMap && vtecMapData ? vtecMapData : mapData;

  return (
    <div className="relative h-full w-full overflow-auto flex flex-col">
      <div 
        className="flex-1 overflow-auto" 
        onMouseDown={onMouseDown} 
        onMouseMove={onMouseMove} 
        onMouseUp={onMouseUp}
      >
        {isDragging && dragStart && dragEnd && (
          <div style={getSelectionBoxStyle(isDragging, dragStart, dragEnd)} />
        )}
        
        <table ref={tableRef} className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-card sticky top-0 z-10">
              <th className="border-b p-2 text-muted-foreground font-medium text-center">{mapType} / RPM</th>
              {rpm.map((r, idx) => (
                <th key={idx} className="border-b p-2 text-muted-foreground font-medium text-center sticky top-0 bg-card">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-card/50' : 'bg-card/25'}>
                <td className="border-r p-2 text-center font-medium sticky left-0 bg-card text-muted-foreground">
                  {getDisplayedLoadValue(rowIdx)} {pressureUnit}
                </td>
                {row.map((cell, colIdx) => {
                  const isSelected = selectedCells.some(s => s.row === rowIdx && s.col === colIdx);
                  let cellClass;
                  
                  // Use original color scheme
                  if (cell < minValue + (maxValue - minValue) * 0.2) {
                    cellClass = "cell-value-low";
                  } else if (cell < minValue + (maxValue - minValue) * 0.4) {
                    cellClass = "cell-value-low-mid";
                  } else if (cell < minValue + (maxValue - minValue) * 0.6) {
                    cellClass = "cell-value-mid";
                  } else if (cell < minValue + (maxValue - minValue) * 0.8) {
                    cellClass = "cell-value-mid-high";
                  } else {
                    cellClass = "cell-value-high";
                  }
                  
                  return (
                    <td 
                      key={colIdx} 
                      className={`relative border border-honda-gray p-1 text-center cursor-pointer transition-colors
                        ${isSelected ? 'grid-highlight' : cellClass}`}
                      onClick={(e) => onCellClick(rowIdx, colIdx, e.ctrlKey || e.metaKey)}
                    >
                      <div>
                        <span>{cell.toFixed(1)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableView;
