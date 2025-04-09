
// This is now an index file that reexports from smaller, more focused files
import { MAP_TYPES, getMapTypeUnit } from './mapTypes';
import { getCellColorClass, getSelectionBoxStyle } from './colorUtils';
import { 
  generateMapData, 
  generateBaseMap, 
  transformDataFor3D 
} from './mapGenerators';
import { convertUnits } from './unitConversion';
import { 
  handleSaveMap, 
  generateMapReport 
} from './mapOperations';
import { 
  getCellAtPosition, 
  selectCellsInRange, 
  adjustMapValues, 
  interpolateMap 
} from './cellSelection';

export {
  MAP_TYPES,
  getMapTypeUnit,
  getCellColorClass,
  getSelectionBoxStyle,
  generateMapData,
  generateBaseMap,
  transformDataFor3D,
  convertUnits,
  handleSaveMap,
  generateMapReport,
  getCellAtPosition,
  selectCellsInRange,
  adjustMapValues,
  interpolateMap
};
