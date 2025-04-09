
// Color utility functions
export const getCellColorClass = (value: number, min: number, max: number) => {
  const range = max - min;
  const normalizedValue = (value - min) / range;
  
  // Restore original green-to-red color scheme
  if (normalizedValue < 0.2) return 'cell-value-low';
  if (normalizedValue < 0.4) return 'cell-value-low-mid';
  if (normalizedValue < 0.6) return 'cell-value-mid';
  if (normalizedValue < 0.8) return 'cell-value-mid-high';
  return 'cell-value-high';
};

export const getSelectionBoxStyle = (
  isDragging: boolean, 
  dragStart: {x: number, y: number} | null, 
  dragEnd: {x: number, y: number} | null
) => {
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
