
export const getCellAtPosition = (
  tableRef: React.RefObject<HTMLTableElement>, 
  rpmLength: number, 
  x: number, 
  y: number
): { row: number, col: number } | null => {
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

export const selectCellsInRange = (
  startCell: { row: number, col: number }, 
  endCell: { row: number, col: number }, 
  existingSelectedCells: { row: number, col: number }[]
) => {
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

// Added to handle the toast import issue
import { toast } from "sonner";

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
