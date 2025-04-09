
// Define map type constants
export const MAP_TYPES = {
  FUEL: 'Fuel',
  AFR: 'AFR Target',
  IGNITION: 'Ignition',
  INJ_DUTY: 'Injector Duty',
  BOOST: 'Boost',
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
