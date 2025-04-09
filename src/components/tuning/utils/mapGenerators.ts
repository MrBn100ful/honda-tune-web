
import { MAP_TYPES } from './mapTypes';
import { convertUnits } from './unitConversion';

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
        
        // Different base timing map for ignition
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

// Function to transform data for 3D visualization
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
