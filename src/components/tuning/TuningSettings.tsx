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

// Engine data structure
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

// Transmission data structure
interface TransmissionData {
  type: string;
  code: string;
  gearRatios: number[];
  finalDrive: number;
}

// Engine database with converted torque values (lb-ft to Nm)
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

// Transmission database
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

// Initial setup dialog component
const SetupWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedEngine, setSelectedEngine] = useState("b16a");
  const [selectedTransmission, setSelectedTransmission] = useState("b-series-m5");
  const [injectorSize, setInjectorSize] = useState(240);
  
  const handleComplete = () => {
    onComplete({
      engine: selectedEngine,
      transmission: selectedTransmission,
      injectorSize: injectorSize
    });
    onClose();
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
  // Engine configuration
  const [engineType, setEngineType] = useState("b16a");
  const [selectedEngine, setSelectedEngine] = useState<EngineData>(ENGINES[0]);
  const [transmissionType, setTransmissionType] = useState("b-series-m5");
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionData>(TRANSMISSIONS[0]);
  
  // General settings
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
  
  // Fuel settings
  const [targetAfrCruise, setTargetAfrCruise] = useState(14.7);
  const [targetAfrWot, setTargetAfrWot] = useState(12.2);
  const [fuelPressure, setFuelPressure] = useState(3.0);
  const [fuelType, setFuelType] = useState("gasoline");
  const [accelEnrichment, setAccelEnrichment] = useState(true);
  
  // Ignition settings
  const [baseTiming, setBaseTiming] = useState(16);
  const [knockRetard, setKnockRetard] = useState(4);
  const [popcornRetard, setPopcornRetard] = useState(12);
  const [knockDetection, setKnockDetection] = useState(true);
  const [timingComp, setTimingComp] = useState(true);
  
  // Launch control settings
  const [launchFuelEnrichment, setLaunchFuelEnrichment] = useState(15);
  const [launchTimingRetard, setLaunchTimingRetard] = useState(8);
  const [twoStep, setTwoStep] = useState(true);
  const [antilag, setAntilag] = useState(false);

  // Connection settings
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
  
  // Setup wizard state
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  
  // Update settings when engine/transmission is changed
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
      // Initialize boost by gear limits based on number of gears
      setGearBoostLimits(Array(transmission.gearRatios.length).fill(0).map((_, i) => 
        Math.min(0.3 + i * 0.15, 1.0) // Progressive boost limits by gear (in bar)
      ));
    }
  }, [transmissionType]);

  // Check if this is the first load
  useEffect(() => {
    const setupCompleted = localStorage.getItem('ecuSetupCompleted');
    if (!setupCompleted) {
      setShowSetupWizard(true);
    } else {
      setHasCompletedSetup(true);
      // Load saved settings here if needed
    }
  }, []);

  const handleSetupComplete = (settings) => {
    setEngineType(settings.engine);
    setTransmissionType(settings.transmission);
    setInjectorSize(settings.injectorSize);
    setHasCompletedSetup(true);
    localStorage.setItem('ecuSetupCompleted', 'true');
    toast.success("Initial setup completed");
  };

  const handleReset = () => {
    // Reset all values to the defaults for the selected engine
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
        
        // Load engine settings
        if (settings.engine) {
          setEngineType(settings.engine.type);
          setInjectorSize(settings.engine.injectorSize);
          setVtecEnabled(settings.engine.vtecEnabled);
          setVtecPoint(settings.engine.vtecPoint);
          setRevLimiter(settings.engine.revLimiter);
          setIdleRpm(settings.engine.idleRpm);
        }
        
        // Load transmission settings
        if (settings.transmission) {
          setTransmissionType(settings.transmission.type);
          setBoostByGear(settings.transmission.boostByGear);
          if (settings.transmission.gearBoostLimits) {
            setGearBoostLimits(settings.transmission.gearBoostLimits);
          }
        }
        
        // Load fuel settings
        if (settings.fuel) {
          setTargetAfrCruise(settings.fuel.targetAfrCruise);
          setTargetAfrWot(settings.fuel.targetAfrWot);
          setFuelPressure(settings.fuel.fuelPressure);
          setFuelType(settings.fuel.fuelType);
          setAccelEnrichment(settings.fuel.accelEnrichment);
        }
        
        // Load ignition settings
        if (settings.ignition) {
          setBaseTiming(settings.ignition.baseTiming);
          setKnockRetard(settings.ignition.knockRetard);
          setPopcornRetard(settings.ignition.popcornRetard);
          setKnockDetection(settings.ignition.knockDetection);
          setTimingComp(settings.ignition.timingComp);
        }
        
        // Load launch settings
        if (settings.launch) {
          setLaunchControl(settings.launch.enabled);
          setLaunchRpm(settings.launch.rpm);
          setLaunchFuelEnrichment(settings.launch.fuelEnrichment);
          setLaunchTimingRetard(settings.launch.timingRetard);
          setTwoStep(settings.launch.twoStep);
          setAntilag(settings.launch.antilag);
        }
        
        // Load other settings
        if (settings.other) {
          setPopcornMode(settings.other.popcornMode);
          setMapSensor(settings.other.mapSensor);
          setIacEnabled(settings.other.iacEnabled);
        }

        // Load connection settings
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
  
  return (
    <React.Fragment>
      <Card className="w-full h-full bg-honda-dark border-honda-gray">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-honda-light">ECU Settings</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSetupWizard(true)} 
                className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
              >
                <Settings2 size={16} className="mr-1" /> Setup Wizard
              </Button>
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
          <Tabs defaultValue="engine">
            <TabsList>
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
                    <React.Fragment>
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
                    </React.Fragment>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transmission" className="pt-4">
              {/* Transmission content */}
            </TabsContent>
            
            <TabsContent value="fuel" className="pt-4">
              {/* Fuel content */}
            </TabsContent>
            
            <TabsContent value="ignition" className="pt-4">
              {/* Ignition content */}
            </TabsContent>
            
            <TabsContent value="launch" className="pt-4">
              {/* Launch Control content */}
            </TabsContent>
            
            <TabsContent value="boost" className="pt-4">
              {/* Boost Control content */}
            </TabsContent>
            
            <TabsContent value="connection" className="pt-4">
              {/* Connection content */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default TuningSettings;
