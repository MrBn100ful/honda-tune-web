
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RotateCcw, Upload, Download, Settings2, Cpu, Gauge, BarChart2, Fuel, Zap, Flag, Database, Cable } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface EngineData {
  name: string;
  code: string;
  displacement: number;
  cylinders: number;
  defaultInjectorSize: number;
  defaultRevLimit: number;
  vtecSupported: boolean;
  vtecPoint?: number;
  maxHP?: number;
  maxTorque?: number;
}

interface TransmissionData {
  type: string;
  code: string;
  gearRatios: number[];
  finalDrive: number;
}

const ENGINES: EngineData[] = [
  {
    name: "B16A VTEC",
    code: "b16a",
    displacement: 1.6,
    cylinders: 4,
    defaultInjectorSize: 240,
    defaultRevLimit: 8400,
    vtecSupported: true,
    vtecPoint: 5500,
    maxHP: 160,
    maxTorque: 203
  },
  {
    name: "B18C Type R",
    code: "b18c",
    displacement: 1.8,
    cylinders: 4,
    defaultInjectorSize: 290,
    defaultRevLimit: 8500,
    vtecSupported: true,
    vtecPoint: 5700,
    maxHP: 200,
    maxTorque: 241
  },
  {
    name: "K20A Type R",
    code: "k20a",
    displacement: 2.0,
    cylinders: 4,
    defaultInjectorSize: 310,
    defaultRevLimit: 8600,
    vtecSupported: true,
    vtecPoint: 5800,
    maxHP: 220,
    maxTorque: 291
  },
  {
    name: "F20C S2000",
    code: "f20c",
    displacement: 2.0,
    cylinders: 4,
    defaultInjectorSize: 330,
    defaultRevLimit: 9000,
    vtecSupported: true,
    vtecPoint: 6000,
    maxHP: 240,
    maxTorque: 282
  },
  {
    name: "K24A",
    code: "k24a",
    displacement: 2.4,
    cylinders: 4,
    defaultInjectorSize: 350,
    defaultRevLimit: 7800,
    vtecSupported: true,
    vtecPoint: 5400,
    maxHP: 190,
    maxTorque: 312
  },
  {
    name: "D16Z6 VTEC",
    code: "d16z6",
    displacement: 1.6,
    cylinders: 4,
    defaultInjectorSize: 240,
    defaultRevLimit: 7200,
    vtecSupported: true,
    vtecPoint: 4800,
    maxHP: 125,
    maxTorque: 187
  },
  {
    name: "H22A Prelude",
    code: "h22a",
    displacement: 2.2,
    cylinders: 4,
    defaultInjectorSize: 310,
    defaultRevLimit: 8000,
    vtecSupported: true,
    vtecPoint: 5200,
    maxHP: 200,
    maxTorque: 291
  },
  {
    name: "D15B Non-VTEC",
    code: "d15b",
    displacement: 1.5,
    cylinders: 4,
    defaultInjectorSize: 190,
    defaultRevLimit: 6800,
    vtecSupported: false,
    maxHP: 105,
    maxTorque: 176
  }
];

const TRANSMISSIONS: TransmissionData[] = [
  {
    type: "Manual 5-Speed (B-series)",
    code: "b-series-m5",
    gearRatios: [3.23, 1.9, 1.36, 1.03, 0.79],
    finalDrive: 4.25
  },
  {
    type: "Manual 6-Speed (K-series)",
    code: "k-series-m6",
    gearRatios: [3.27, 2.13, 1.52, 1.15, 0.92, 0.74],
    finalDrive: 4.39
  },
  {
    type: "Manual 6-Speed (S2000)",
    code: "s2000-m6",
    gearRatios: [3.13, 2.05, 1.48, 1.16, 0.97, 0.81],
    finalDrive: 4.1
  },
  {
    type: "Auto 4-Speed",
    code: "auto-4",
    gearRatios: [2.76, 1.55, 1.03, 0.71],
    finalDrive: 4.36
  },
  {
    type: "Auto 5-Speed",
    code: "auto-5",
    gearRatios: [2.68, 1.62, 1.04, 0.76, 0.55],
    finalDrive: 4.44
  }
];

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (settings: { engine: string; transmission: string; injectorSize: number }) => void;
}

const SetupWizard = ({ isOpen, onClose, onComplete }: SetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedEngine, setSelectedEngine] = useState("b16a");
  const [selectedTransmission, setSelectedTransmission] = useState("b-series-m5");
  const [injectorSize, setInjectorSize] = useState(240);
  const [fuelPressure, setFuelPressure] = useState("3.0");
  
  const handleComplete = () => {
    const settings = {
      engine: selectedEngine,
      transmission: selectedTransmission,
      injectorSize: injectorSize,
      fuelPressure: parseFloat(fuelPressure),
      cylinderCount: ENGINES.find(e => e.code === selectedEngine)?.cylinders || 4
    };
    
    localStorage.setItem('ecuSettings', JSON.stringify(settings));
    localStorage.setItem('ecuSetupCompleted', 'true');
    
    onComplete(settings);
    onClose();
    
    toast.success("Setup completed successfully! Base maps have been generated.");
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <Card className="w-[90vw] max-w-[500px] max-h-[90vh] overflow-auto bg-honda-dark border-honda-gray">
        <CardHeader>
          <CardTitle className="text-honda-light">Honda ECU Setup Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-honda-light">Step 1: Select Your Engine</h3>
              <p className="text-honda-light/80 text-sm mb-4">Choose the engine type you're working with:</p>
              
              <div className="space-y-2">
                <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                  <SelectTrigger className="bg-honda-gray border-honda-gray">
                    <SelectValue placeholder="Select Engine Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGINES.map(engine => (
                      <SelectItem key={engine.code} value={engine.code}>
                        <div className="flex items-center">
                          <Cpu className="mr-2 h-4 w-4" />
                          <span>{engine.name} ({engine.displacement}L)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedEngine && (
                  <div className="rounded-md border border-honda-gray p-4 mt-4">
                    <h4 className="text-sm font-medium text-honda-light mb-2">Engine Specs</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-honda-light/70">Displacement:</div>
                      <div className="text-honda-light font-medium">
                        {ENGINES.find(e => e.code === selectedEngine)?.displacement}L
                      </div>
                      
                      <div className="text-honda-light/70">Max Power:</div>
                      <div className="text-honda-light font-medium">
                        {ENGINES.find(e => e.code === selectedEngine)?.maxHP || "-"} HP 
                        ({ENGINES.find(e => e.code === selectedEngine)?.maxHP 
                          ? Math.round(ENGINES.find(e => e.code === selectedEngine)?.maxHP * 0.7457) 
                          : "-"} kW)
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-honda-red">Next Step</Button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-honda-light">Step 2: Select Your Transmission</h3>
              <p className="text-honda-light/80 text-sm mb-4">Choose the transmission type:</p>
              
              <div className="space-y-2">
                <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
                  <SelectTrigger className="bg-honda-gray border-honda-gray">
                    <SelectValue placeholder="Select Transmission Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map(trans => (
                      <SelectItem key={trans.code} value={trans.code}>
                        <div className="flex items-center">
                          <Gauge className="mr-2 h-4 w-4" />
                          <span>{trans.type} ({trans.gearRatios.length}-Speed)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedTransmission && (
                  <div className="rounded-md border border-honda-gray p-4 mt-4">
                    <h4 className="text-sm font-medium text-honda-light mb-2">Gear Ratios</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {TRANSMISSIONS.find(t => t.code === selectedTransmission)?.gearRatios.map((ratio, idx) => (
                        <React.Fragment key={idx}>
                          <div className="text-honda-light/70">Gear {idx + 1}:</div>
                          <div className="text-honda-light font-medium">{ratio.toFixed(2)}:1</div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button onClick={() => setStep(1)} variant="outline" className="border-honda-gray text-honda-light">Back</Button>
                <Button onClick={() => setStep(3)} className="bg-honda-red">Next Step</Button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-honda-light">Step 3: Injector Setup</h3>
              <p className="text-honda-light/80 text-sm mb-4">Configure your fuel injectors:</p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="injector-size" className="text-honda-light">Injector Size (cc/min)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[injectorSize]}
                      max={1000}
                      min={190}
                      step={10}
                      onValueChange={(value) => setInjectorSize(value[0])}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                      {injectorSize}
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border border-honda-gray p-4 mt-2">
                  <h4 className="text-sm font-medium text-honda-light mb-2">Injector Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-honda-light/70">Size:</div>
                    <div className="text-honda-light font-medium">{injectorSize} cc/min</div>
                    
                    <div className="text-honda-light/70">Flow Rate:</div>
                    <div className="text-honda-light font-medium">{(injectorSize / 14.4).toFixed(1)} g/s</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button onClick={() => setStep(2)} variant="outline" className="border-honda-gray text-honda-light">Back</Button>
                <Button onClick={handleComplete} className="bg-honda-red">Complete Setup</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TuningSettings = () => {
  const [engineType, setEngineType] = useState("b16a");
  const [selectedEngine, setSelectedEngine] = useState<EngineData>(ENGINES[0]);
  const [transmissionType, setTransmissionType] = useState("b-series-m5");
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionData>(TRANSMISSIONS[0]);
  
  const [injectorSize, setInjectorSize] = useState(240);
  const [boostByGear, setBoostByGear] = useState(false);
  const [gearBoostLimits, setGearBoostLimits] = useState<number[]>([0.3, 0.5, 0.7, 0.8, 1.0, 1.0]);
  const [popcornMode, setPopcornMode] = useState(false);
  const [launchControl, setLaunchControl] = useState(true);
  const [launchRpm, setLaunchRpm] = useState(4200);
  const [revLimiter, setRevLimiter] = useState(8400);
  const [idleRpm, setIdleRpm] = useState(850);
  const [vtecEnabled, setVtecEnabled] = useState(true);
  const [vtecPoint, setVtecPoint] = useState(5500);
  const [mapSensor, setMapSensor] = useState("3bar");
  const [iacEnabled, setIacEnabled] = useState(true);
  
  const [targetAfrCruise, setTargetAfrCruise] = useState(14.7);
  const [targetAfrWot, setTargetAfrWot] = useState(12.2);
  const [fuelPressure, setFuelPressure] = useState(3.0);
  const [fuelType, setFuelType] = useState("gasoline");
  const [accelEnrichment, setAccelEnrichment] = useState(true);
  
  const [baseTiming, setBaseTiming] = useState(16);
  const [knockRetard, setKnockRetard] = useState(4);
  const [popcornRetard, setPopcornRetard] = useState(12);
  const [knockDetection, setKnockDetection] = useState(true);
  const [timingComp, setTimingComp] = useState(true);
  
  const [launchFuelEnrichment, setLaunchFuelEnrichment] = useState(15);
  const [launchTimingRetard, setLaunchTimingRetard] = useState(8);
  const [twoStep, setTwoStep] = useState(true);
  const [antilag, setAntilag] = useState(false);

  const [rtpInputs, setRtpInputs] = useState([
    { pin: "A1", type: "analog", usage: "MAP Sensor", scaling: "3 bar" },
    { pin: "A2", type: "analog", usage: "TPS Sensor", scaling: "0-5V" },
    { pin: "A3", type: "analog", usage: "IAT Sensor", scaling: "Thermistor" },
    { pin: "A4", type: "analog", usage: "CLT Sensor", scaling: "Thermistor" },
    { pin: "D1", type: "digital", usage: "VSS Input", scaling: "Frequency" },
    { pin: "D2", type: "digital", usage: "Crank Trigger", scaling: "Falling Edge" },
    { pin: "D3", type: "digital", usage: "Cam Position", scaling: "Rising Edge" },
  ]);
  
  const [rtpOutputs, setRtpOutputs] = useState([
    { pin: "OUT1", type: "injector", usage: "Injector 1-2", current: "2A" },
    { pin: "OUT2", type: "injector", usage: "Injector 3-4", current: "2A" },
    { pin: "OUT3", type: "ignition", usage: "Ignition 1-4", current: "1A" },
    { pin: "OUT4", type: "solenoid", usage: "VTEC Solenoid", current: "1A" },
    { pin: "OUT5", type: "solenoid", usage: "Boost Control", current: "1A" },
    { pin: "OUT6", type: "relay", usage: "Fuel Pump", current: "5A" },
  ]);
  
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  
  useEffect(() => {
    const engine = ENGINES.find(e => e.code === engineType);
    if (engine) {
      setSelectedEngine(engine);
      setInjectorSize(engine.defaultInjectorSize);
      setRevLimiter(engine.defaultRevLimit);
      
      if (engine.vtecSupported) {
        setVtecEnabled(true);
        setVtecPoint(engine.vtecPoint || 5500);
      } else {
        setVtecEnabled(false);
      }
    }
  }, [engineType]);
  
  useEffect(() => {
    const transmission = TRANSMISSIONS.find(t => t.code === transmissionType);
    if (transmission) {
      setSelectedTransmission(transmission);
      setGearBoostLimits(Array(transmission.gearRatios.length).fill(0).map((_, i) => 
        Math.min(0.3 + i * 0.15, 1.0) // Progressive boost limits by gear (in bar)
      ));
    }
  }, [transmissionType]);

  useEffect(() => {
    // Clear localStorage for testing purposes
    // localStorage.removeItem('ecuSetupCompleted');
    // localStorage.removeItem('ecuSettings');
    
    const setupCompleted = localStorage.getItem('ecuSetupCompleted');
    if (setupCompleted) {
      setHasCompletedSetup(true);
      try {
        const savedSettings = JSON.parse(localStorage.getItem('ecuSettings') || '{}');
        if (savedSettings.engine) {
          setEngineType(savedSettings.engine);
        }
        if (savedSettings.transmission) {
          setTransmissionType(savedSettings.transmission);
        }
        if (savedSettings.injectorSize) {
          setInjectorSize(savedSettings.injectorSize);
        }
      } catch (e) {
        console.error("Error loading saved settings:", e);
      }
    } else {
      setShowSetupWizard(true);
    }
  }, []);

  const handleSetupComplete = (settings) => {
    setHasCompletedSetup(true);
    setEngineType(settings.engine);
    setTransmissionType(settings.transmission);
    setInjectorSize(settings.injectorSize);
    
    // Reload the page to update all components with the new settings
    window.location.reload();
  };

  const handleReset = () => {
    const engine = ENGINES.find(e => e.code === engineType);
    if (engine) {
      setInjectorSize(engine.defaultInjectorSize);
      setPopcornMode(false);
      setLaunchControl(true);
      setLaunchRpm(4200);
      setRevLimiter(engine.defaultRevLimit);
      setIdleRpm(850);
      setVtecEnabled(engine.vtecSupported);
      setVtecPoint(engine.vtecPoint || 5500);
    }
    
    setMapSensor("3bar");
    setIacEnabled(true);
    setTargetAfrCruise(14.7);
    setTargetAfrWot(12.2);
    setFuelPressure(3.0);
    setFuelType("gasoline");
    setAccelEnrichment(true);
    setBaseTiming(16);
    setKnockRetard(4);
    setPopcornRetard(12);
    setKnockDetection(true);
    setTimingComp(true);
    setLaunchFuelEnrichment(15);
    setLaunchTimingRetard(8);
    setTwoStep(true);
    setAntilag(false);
    setBoostByGear(false);
    
    toast.success("Settings reset to default values");
  };

  const handleSave = () => {
    const settingsData = {
      engine: {
        type: engineType,
        injectorSize,
        vtecEnabled,
        vtecPoint,
        revLimiter,
        idleRpm
      },
      transmission: {
        type: transmissionType,
        gearRatios: selectedTransmission.gearRatios,
        finalDrive: selectedTransmission.finalDrive,
        boostByGear,
        gearBoostLimits
      },
      fuel: {
        targetAfrCruise,
        targetAfrWot,
        fuelPressure,
        fuelType,
        accelEnrichment
      },
      ignition: {
        baseTiming,
        knockRetard,
        popcornRetard,
        knockDetection,
        timingComp
      },
      launch: {
        enabled: launchControl,
        rpm: launchRpm,
        fuelEnrichment: launchFuelEnrichment,
        timingRetard: launchTimingRetard,
        twoStep,
        antilag
      },
      other: {
        popcornMode,
        mapSensor,
        iacEnabled
      },
      connection: {
        inputs: rtpInputs,
        outputs: rtpOutputs
      }
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecu-settings-${engineType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Settings saved successfully");
  };
  
  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        if (settings.engine) {
          setEngineType(settings.engine.type);
          setInjectorSize(settings.engine.injectorSize);
          setVtecEnabled(settings.engine.vtecEnabled);
          setVtecPoint(settings.engine.vtecPoint);
          setRevLimiter(settings.engine.revLimiter);
          setIdleRpm(settings.engine.idleRpm);
        }
        
        if (settings.transmission) {
          setTransmissionType(settings.transmission.type);
          setBoostByGear(settings.transmission.boostByGear);
          if (settings.transmission.gearBoostLimits) {
            setGearBoostLimits(settings.transmission.gearBoostLimits);
          }
        }
        
        if (settings.fuel) {
          setTargetAfrCruise(settings.fuel.targetAfrCruise);
          setTargetAfrWot(settings.fuel.targetAfrWot);
          setFuelPressure(settings.fuel.fuelPressure);
          setFuelType(settings.fuel.fuelType);
          setAccelEnrichment(settings.fuel.accelEnrichment);
        }
        
        if (settings.ignition) {
          setBaseTiming(settings.ignition.baseTiming);
          setKnockRetard(settings.ignition.knockRetard);
          setPopcornRetard(settings.ignition.popcornRetard);
          setKnockDetection(settings.ignition.knockDetection);
          setTimingComp(settings.ignition.timingComp);
        }
        
        if (settings.launch) {
          setLaunchControl(settings.launch.enabled);
          setLaunchRpm(settings.launch.rpm);
          setLaunchFuelEnrichment(settings.launch.fuelEnrichment);
          setLaunchTimingRetard(settings.launch.timingRetard);
          setTwoStep(settings.launch.twoStep);
          setAntilag(settings.launch.antilag);
        }
        
        if (settings.other) {
          setPopcornMode(settings.other.popcornMode);
          setMapSensor(settings.other.mapSensor);
          setIacEnabled(settings.other.iacEnabled);
        }

        if (settings.connection) {
          if (settings.connection.inputs) setRtpInputs(settings.connection.inputs);
          if (settings.connection.outputs) setRtpOutputs(settings.connection.outputs);
        }
        
        toast.success("Settings loaded successfully");
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error("Error loading settings file");
      }
    };
    reader.readAsText(file);
  };

  const openSetupWizard = () => {
    setShowSetupWizard(true);
  };

  const forceOpenSetupWizard = () => {
    // Clear local storage to force setup wizard to open
    localStorage.removeItem('ecuSetupCompleted');
    localStorage.removeItem('ecuSettings');
    setHasCompletedSetup(false);
    setShowSetupWizard(true);
  };

  return (
    <>
      <SetupWizard 
        isOpen={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        onComplete={handleSetupComplete}
      />
      
      <Card className="w-full h-full bg-honda-dark border-honda-gray">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-honda-light">ECU Settings</CardTitle>
            <div className="flex items-center gap-3">
              {hasCompletedSetup && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openSetupWizard}
                  className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                >
                  <Settings2 size={16} className="mr-2" />
                  Reconfigure ECU
                </Button>
              )}
              
              <input
                type="file"
                id="load-settings"
                accept=".json"
                onChange={handleLoad}
                className="hidden"
              />
              <label htmlFor="load-settings">
                <Button variant="outline" size="sm" className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark cursor-pointer" asChild>
                  <span><Upload size={16} className="mr-1" /> Load</span>
                </Button>
              </label>
              <Button variant="outline" size="sm" onClick={handleReset} className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark">
                <RotateCcw size={16} className="mr-1" /> Reset
              </Button>
              <Button variant="default" size="sm" className="bg-honda-red" onClick={handleSave}>
                <Save size={16} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
          {!hasCompletedSetup && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-honda-light mb-3">Welcome to Honda ECU Tuner</h2>
                <p className="text-honda-light/80 mb-6">
                  Please set up your engine and transmission configuration to get started.
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-honda-red hover:bg-honda-red/90"
                onClick={forceOpenSetupWizard}
              >
                <Settings2 className="mr-2" size={20} />
                Start ECU Setup Wizard
              </Button>
            </div>
          )}
          
          {hasCompletedSetup && (
            <Tabs defaultValue="engine">
              <TabsList className="mb-4 border-b w-full flex overflow-x-auto">
                <TabsTrigger value="engine">Engine Setup</TabsTrigger>
                <TabsTrigger value="transmission">Transmission</TabsTrigger>
                <TabsTrigger value="fuel">Fuel</TabsTrigger>
                <TabsTrigger value="ignition">Ignition</TabsTrigger>
                <TabsTrigger value="launch">Launch Control</TabsTrigger>
                <TabsTrigger value="boost">Boost Control</TabsTrigger>
                <TabsTrigger value="connection">Connection</TabsTrigger>
              </TabsList>
              
              <TabsContent value="engine" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="engine-type" className="text-honda-light">Engine Type</Label>
                      <Select value={engineType} onValueChange={setEngineType}>
                        <SelectTrigger id="engine-type" className="bg-honda-gray border-honda-gray">
                          <SelectValue placeholder="Select Engine Type" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {ENGINES.map(engine => (
                            <SelectItem key={engine.code} value={engine.code}>
                              <div className="flex items-center">
                                <Cpu className="mr-2 h-4 w-4" />
                                <span>{engine.name} ({engine.displacement}L)</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedEngine && (
                      <div className="rounded-md border border-honda-gray p-4">
                        <h3 className="text-sm font-medium text-honda-light mb-2">Engine Specs</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-honda-light/70">Displacement:</div>
                          <div className="text-honda-light font-medium">{selectedEngine.displacement}L</div>
                          
                          <div className="text-honda-light/70">Cylinders:</div>
                          <div className="text-honda-light font-medium">{selectedEngine.cylinders}</div>
                          
                          <div className="text-honda-light/70">Max Power:</div>
                          <div className="text-honda-light font-medium">
                            {selectedEngine.maxHP || "-"} HP ({selectedEngine.maxHP ? Math.round(selectedEngine.maxHP * 0.7457) : "-"} kW)
                          </div>
                          
                          <div className="text-honda-light/70">Max Torque:</div>
                          <div className="text-honda-light font-medium">{selectedEngine.maxTorque || "-"} Nm</div>
                          
                          <div className="text-honda-light/70">VTEC:</div>
                          <div className="text-honda-light font-medium">{selectedEngine.vtecSupported ? "Yes" : "No"}</div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="injector-size" className="text-honda-light">Injector Size (cc/min)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[injectorSize]}
                          max={1000}
                          min={190}
                          step={10}
                          onValueChange={(value) => setInjectorSize(value[0])}
                          className="flex-1"
                        />
                        <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                          {injectorSize}
                        </div>
                      </div>
                    </div>
                    
                    {selectedEngine.vtecSupported && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="vtec" 
                            checked={vtecEnabled}
                            onCheckedChange={setVtecEnabled}
                          />
                          <Label htmlFor="vtec" className="text-honda-light">VTEC Enabled</Label>
                        </div>
                        
                        {vtecEnabled && (
                          <div>
                            <Label htmlFor="vtec-point" className="text-honda-light">VTEC Engagement (RPM)</Label>
                            <div className="flex items-center gap-4">
                              <Slider
                                value={[vtecPoint]}
                                max={7000}
                                min={3000}
                                step={100}
                                onValueChange={(value) => setVtecPoint(value[0])}
                                className="flex-1"
                              />
                              <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                                {vtecPoint}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="transmission" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="transmission-type" className="text-honda-light">Transmission Type</Label>
                      <Select value={transmissionType} onValueChange={setTransmissionType}>
                        <SelectTrigger id="transmission-type" className="bg-honda-gray border-honda-gray">
                          <SelectValue placeholder="Select Transmission Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSMISSIONS.map(trans => (
                            <SelectItem key={trans.code} value={trans.code}>
                              <div className="flex items-center">
                                <Gauge className="mr-2 h-4 w-4" />
                                <span>{trans.type} ({trans.gearRatios.length}-Speed)</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedTransmission && (
                      <div className="rounded-md border border-honda-gray p-4">
                        <h3 className="text-sm font-medium text-honda-light mb-2">Transmission Specs</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {selectedTransmission.gearRatios.map((ratio, idx) => (
                            <React.Fragment key={idx}>
                              <div className="text-honda-light/70">Gear {idx + 1}:</div>
                              <div className="text-honda-light font-medium">{ratio.toFixed(2)}:1</div>
                            </React.Fragment>
                          ))}
                          <div className="text-honda-light/70">Final Drive:</div>
                          <div className="text-honda-light font-medium">{selectedTransmission.finalDrive.toFixed(2)}:1</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="fuel" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="target-afr-cruise" className="text-honda-light">Target AFR (Cruise)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[targetAfrCruise]}
                          max={16}
                          min={13}
                          step={0.1}
                          onValueChange={(value) => setTargetAfrCruise(value[0])}
                          className="flex-1"
                        />
                        <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                          {targetAfrCruise.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="target-afr-wot" className="text-honda-light">Target AFR (WOT)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[targetAfrWot]}
                          max={14}
                          min={11}
                          step={0.1}
                          onValueChange={(value) => setTargetAfrWot(value[0])}
                          className="flex-1"
                        />
                        <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                          {targetAfrWot.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="fuel-pressure" className="text-honda-light">Fuel Pressure (bar)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[fuelPressure]}
                          max={5}
                          min={2}
                          step={0.1}
                          onValueChange={(value) => setFuelPressure(value[0])}
                          className="flex-1"
                        />
                        <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                          {fuelPressure.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fuel-type" className="text-honda-light">Fuel Type</Label>
                      <Select value={fuelType} onValueChange={setFuelType}>
                        <SelectTrigger id="fuel-type" className="bg-honda-gray border-honda-gray">
                          <SelectValue placeholder="Select Fuel Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasoline">Gasoline (91-93 Octane)</SelectItem>
                          <SelectItem value="e85">E85</SelectItem>
                          <SelectItem value="race">Racing Fuel (100+ Octane)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="accel-enrichment" 
                        checked={accelEnrichment}
                        onCheckedChange={setAccelEnrichment}
                      />
                      <Label htmlFor="accel-enrichment" className="text-honda-light">Acceleration Enrichment</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ignition" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="base-timing" className="text-honda-light">Base Timing (Degrees)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[baseTiming]}
                          max={30}
                          min={8}
                          step={1}
                          onValueChange={(value) => setBaseTiming(value[0])}
                          className="flex-1"
                        />
                        <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                          {baseTiming}°
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="knock-retard" className="text-honda-light">Knock Retard (Degrees)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[knockRetard]}
                          max={10}
                          min={1}
                          step={0.5}
                          onValueChange={(value) => setKnockRetard(value[0])}
                          className="flex-1"
                        />
                        <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                          {knockRetard}°
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="knock-detection" 
                        checked={knockDetection}
                        onCheckedChange={setKnockDetection}
                      />
                      <Label htmlFor="knock-detection" className="text-honda-light">Knock Detection</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="timing-comp" 
                        checked={timingComp}
                        onCheckedChange={setTimingComp}
                      />
                      <Label htmlFor="timing-comp" className="text-honda-light">IAT Timing Compensation</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="launch" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="launch-control" 
                        checked={launchControl}
                        onCheckedChange={setLaunchControl}
                      />
                      <Label htmlFor="launch-control" className="text-honda-light">Launch Control</Label>
                    </div>
                    
                    {launchControl && (
                      <>
                        <div>
                          <Label htmlFor="launch-rpm" className="text-honda-light">Launch RPM</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[launchRpm]}
                              max={6000}
                              min={3000}
                              step={100}
                              onValueChange={(value) => setLaunchRpm(value[0])}
                              className="flex-1"
                            />
                            <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                              {launchRpm}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="launch-fuel" className="text-honda-light">Fuel Enrichment (%)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[launchFuelEnrichment]}
                              max={25}
                              min={0}
                              step={1}
                              onValueChange={(value) => setLaunchFuelEnrichment(value[0])}
                              className="flex-1"
                            />
                            <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                              {launchFuelEnrichment}%
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="launch-timing" className="text-honda-light">Timing Retard (°)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[launchTimingRetard]}
                              max={15}
                              min={0}
                              step={1}
                              onValueChange={(value) => setLaunchTimingRetard(value[0])}
                              className="flex-1"
                            />
                            <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                              {launchTimingRetard}°
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="two-step" 
                            checked={twoStep}
                            onCheckedChange={setTwoStep}
                          />
                          <Label htmlFor="two-step" className="text-honda-light">Two-Step</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="antilag" 
                            checked={antilag}
                            onCheckedChange={setAntilag}
                          />
                          <Label htmlFor="antilag" className="text-honda-light">Anti-Lag</Label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="boost" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="boost-by-gear" 
                        checked={boostByGear}
                        onCheckedChange={setBoostByGear}
                      />
                      <Label htmlFor="boost-by-gear" className="text-honda-light">Boost By Gear</Label>
                    </div>
                    
                    {boostByGear && selectedTransmission && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-honda-light">Boost Limits By Gear (bar)</h4>
                        {selectedTransmission.gearRatios.map((_, idx) => (
                          <div key={idx}>
                            <Label htmlFor={`gear-${idx+1}-boost`} className="text-honda-light">Gear {idx+1}</Label>
                            <div className="flex items-center gap-4">
                              <Slider
                                id={`gear-${idx+1}-boost`}
                                value={[gearBoostLimits[idx] || 0]}
                                max={1.5}
                                min={0.3}
                                step={0.1}
                                onValueChange={(value) => {
                                  const newLimits = [...gearBoostLimits];
                                  newLimits[idx] = value[0];
                                  setGearBoostLimits(newLimits);
                                }}
                                className="flex-1"
                              />
                              <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                                {(gearBoostLimits[idx] || 0).toFixed(1)} bar
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="map-sensor" className="text-honda-light">MAP Sensor</Label>
                      <Select value={mapSensor} onValueChange={setMapSensor}>
                        <SelectTrigger id="map-sensor" className="bg-honda-gray border-honda-gray">
                          <SelectValue placeholder="Select MAP Sensor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2bar">2 Bar</SelectItem>
                          <SelectItem value="3bar">3 Bar</SelectItem>
                          <SelectItem value="4bar">4 Bar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="popcorn-mode" 
                        checked={popcornMode}
                        onCheckedChange={setPopcornMode}
                      />
                      <Label htmlFor="popcorn-mode" className="text-honda-light">Popcorn Mode</Label>
                    </div>
                    
                    {popcornMode && (
                      <div>
                        <Label htmlFor="popcorn-retard" className="text-honda-light">Popcorn Mode Retard (°)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="popcorn-retard"
                            value={[popcornRetard]}
                            max={20}
                            min={5}
                            step={1}
                            onValueChange={(value) => setPopcornRetard(value[0])}
                            className="flex-1"
                          />
                          <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                            {popcornRetard}°
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="connection" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-honda-light mb-4">Input Pins</h3>
                    <div className="rounded-md border border-honda-gray p-4 mb-4">
                      <div className="overflow-auto max-h-[300px]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-honda-gray">
                              <th className="text-left text-honda-light/70 p-2">Pin</th>
                              <th className="text-left text-honda-light/70 p-2">Type</th>
                              <th className="text-left text-honda-light/70 p-2">Usage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rtpInputs.map((input, idx) => (
                              <tr key={idx} className="border-b border-honda-gray/30">
                                <td className="p-2 text-honda-light">{input.pin}</td>
                                <td className="p-2 text-honda-light">{input.type}</td>
                                <td className="p-2 text-honda-light">
                                  {input.usage} <span className="text-xs text-honda-light/60">({input.scaling})</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-honda-light mb-4">Output Pins</h3>
                    <div className="rounded-md border border-honda-gray p-4 mb-4">
                      <div className="overflow-auto max-h-[300px]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-honda-gray">
                              <th className="text-left text-honda-light/70 p-2">Pin</th>
                              <th className="text-left text-honda-light/70 p-2">Type</th>
                              <th className="text-left text-honda-light/70 p-2">Usage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rtpOutputs.map((output, idx) => (
                              <tr key={idx} className="border-b border-honda-gray/30">
                                <td className="p-2 text-honda-light">{output.pin}</td>
                                <td className="p-2 text-honda-light">{output.type}</td>
                                <td className="p-2 text-honda-light">
                                  {output.usage} <span className="text-xs text-honda-light/60">({output.current})</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TuningSettings;
