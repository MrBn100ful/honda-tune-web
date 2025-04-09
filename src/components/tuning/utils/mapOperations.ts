
import { toast } from "sonner";

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

export const generateMapReport = (mapData: number[][], mapType: string, rpm: number[], displayedLoad: number[], isVtec: boolean, pressureUnit: 'bar' | 'kPa') => {
  const minValue = mapData.length > 0 ? Math.min(...mapData.flat()) : 0;
  const maxValue = mapData.length > 0 ? Math.max(...mapData.flat()) : 0;
  const unit = getMapTypeUnit(mapType);
  
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
  
  toast.info(`Map Report: Avg=${report.average}${unit}, Range=${report.minValue}-${report.maxValue}${unit}`);
  return report;
};

const getMapTypeUnit = (mapType: string): string => {
  switch (mapType) {
    case 'Fuel': return 'ms';
    case 'AFR Target': return 'λ';
    case 'Ignition': return '°';
    case 'Injector Duty': return '%';
    case 'Boost': return 'PSI';
    default: return '';
  }
};
