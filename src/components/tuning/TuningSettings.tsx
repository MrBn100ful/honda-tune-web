import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RotateCcw, Upload, Download, Settings2 } from "lucide-react";
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

const TuningSettings = () => {
  // Engine configuration
  const [engineType, setEngineType] = useState("b16a");
  const [selectedEngine, setSelectedEngine] = useState<EngineData>(ENGINES[0]);
  const [transmissionType, setTransmissionType] = useState("b-series-m5");
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionData>(TRANSMISSIONS[0]);
  
  // General settings
  const [injectorSize, setInjectorSize] = useState(240);
  const [boostByGear, setBoostByGear] = useState(false);
  const [gearBoostLimits, setGearBoostLimits] = useState<number[]>([5, 8, 10, 12, 15, 15]);
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
  const [fuelPressure, setFuelPressure] = useState(45);
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
        Math.min(5 + i * 2, 15) // Progressive boost limits by gear
      ));
    }
  }, [transmissionType]);

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
    setFuelPressure(45);
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
        
        toast.success("Settings loaded successfully");
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error("Error loading settings file");
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <Card className="w-full h-full bg-honda-dark border-honda-gray">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-honda-light">ECU Settings</CardTitle>
          <div className="flex gap-2">
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
                    <SelectContent>
                      {ENGINES.map(engine => (
                        <SelectItem key={engine.code} value={engine.code}>
                          {engine.name} ({engine.displacement}L)
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
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="map-sensor" className="text-honda-light">MAP Sensor Type</Label>
                  <Select value={mapSensor} onValueChange={setMapSensor}>
                    <SelectTrigger id="map-sensor" className="bg-honda-gray border-honda-gray">
                      <SelectValue placeholder="Select MAP Sensor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2bar">2 Bar (29 PSI)</SelectItem>
                      <SelectItem value="3bar">3 Bar (44 PSI)</SelectItem>
                      <SelectItem value="4bar">4 Bar (58 PSI)</SelectItem>
                      <SelectItem value="5bar">5 Bar (73 PSI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-honda-light">Rev Limiter (RPM)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[revLimiter]}
                      max={9500}
                      min={6000}
                      step={100}
                      onValueChange={(value) => setRevLimiter(value[0])}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                      {revLimiter}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-honda-light">Idle RPM</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[idleRpm]}
                      max={1500}
                      min={600}
                      step={50}
                      onValueChange={(value) => setIdleRpm(value[0])}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                      {idleRpm}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="iac" 
                    checked={iacEnabled}
                    onCheckedChange={setIacEnabled}
                  />
                  <Label htmlFor="iac" className="text-honda-light">IAC Control Enabled</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="popcorn" 
                    checked={popcornMode}
                    onCheckedChange={setPopcornMode}
                  />
                  <Label htmlFor="popcorn" className="text-honda-light">Popcorn Mode (Anti-Lag)</Label>
                </div>
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
                          {trans.type} ({trans.gearRatios.length}-Speed)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedTransmission && (
                  <div className="rounded-md border border-honda-gray p-4">
                    <h3 className="text-sm font-medium text-honda-light mb-2">Gear Ratios</h3>
                    <div className="space-y-2">
                      {selectedTransmission.gearRatios.map((ratio, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-honda-light/70">Gear {idx + 1}:</div>
                          <div className="text-honda-light font-medium">{ratio.toFixed(2)}:1</div>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-honda-gray/30 mt-2">
                        <div className="text-honda-light/70">Final Drive:</div>
                        <div className="text-honda-light font-medium">{selectedTransmission.finalDrive.toFixed(2)}:1</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="boost-by-gear" 
                    checked={boostByGear}
                    onCheckedChange={setBoostByGear}
                  />
                  <Label htmlFor="boost-by-gear" className="text-honda-light">Enable Boost by Gear</Label>
                </div>
              </div>
              
              {boostByGear && selectedTransmission && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-honda-light">Boost Target by Gear (PSI)</h3>
                  
                  {selectedTransmission.gearRatios.map((_, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label className="text-honda-light">Gear {idx + 1} Max Boost</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[gearBoostLimits[idx] || 0]}
                          max={30}
                          min={0}
                          step={0.5}
                          onValueChange={(value) => {
                            const newLimits = [...gearBoostLimits];
                            newLimits[idx] = value[0];
                            setGearBoostLimits(newLimits);
                          }}
                          className="flex-1"
                        />
                        <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                          {(gearBoostLimits[idx] || 0).toFixed(1)} PSI
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Create progressive boost curve
                      const maxGears = selectedTransmission.gearRatios.length;
                      const newLimits = Array(maxGears).fill(0).map((_, i) => {
                        // Start lower in 1st gear, ramp up progressively
                        return Math.min(5 + (i * 2), 15);
                      });
                      setGearBoostLimits(newLimits);
                    }}
                    className="mt-2 bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                  >
                    <Settings2 size={14} className="mr-1" />
                    Progressive Curve
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="fuel" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="target-afr" className="text-honda-light">Target AFR (Cruise)</Label>
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
                  <Label htmlFor="fuel-pressure" className="text-honda-light">Fuel Pressure (psi)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[fuelPressure]}
                      max={90}
                      min={30}
                      step={1}
                      onValueChange={(value) => setFuelPressure(value[0])}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                      {fuelPressure}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="fuel-type" className="text-honda-light">Fuel Type</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger id="fuel-type" className="bg-honda-gray border-honda-gray">
                      <SelectValue placeholder="Select Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline-87">Regular (87 Octane)</SelectItem>
                      <SelectItem value="gasoline">Premium (91-93 Octane)</SelectItem>
                      <SelectItem value="e85">E85</SelectItem>
                      <SelectItem value="ethanol">Pure Ethanol</SelectItem>
                      <SelectItem value="race">Race Fuel (100+ Octane)</SelectItem>
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
                
                <div className="rounded-md border border-honda-gray p-4">
                  <h3 className="text-sm font-medium text-honda-light mb-2">Injector Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-honda-light/70">Size:</div>
                    <div className="text-honda-light font-medium">{injectorSize} cc/min</div>
                    
                    <div className="text-honda-light/70">Flow Rate:</div>
                    <div className="text-honda-light font-medium">{(injectorSize / 10.5).toFixed(1)} lb/hr</div>
                    
                    <div className="text-honda-light/70">Max Theoretical HP:</div>
                    <div className="text-honda-light font-medium">
                      {Math.round(injectorSize * selectedEngine.cylinders * 0.07)} hp <span className="text-xs text-honda-light/50">(E85)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ignition" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="timing-base" className="text-honda-light">Base Timing (degrees)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[baseTiming]}
                      max={25}
                      min={10}
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
                  <Label htmlFor="knock-retard" className="text-honda-light">Knock Retard (degrees)</Label>
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
                
                {popcornMode && (
                  <div>
                    <Label htmlFor="popcorn-retard" className="text-honda-light">Popcorn Mode Retard (degrees)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
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
              
              <div className="space-y-6">
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
                  <Label htmlFor="timing-comp" className="text-honda-light">Temperature Compensation</Label>
                </div>
                
                <div className="rounded-md border border-honda-gray p-4">
                  <h3 className="text-sm font-medium text-honda-light mb-2">Ignition Settings Info</h3>
                  <p className="text-xs text-honda-light/70 mb-2">
                    Base timing represents the static timing setting. Actual ignition timing will vary based on
                    the timing map, temperature, and load conditions.
                  </p>
                  <p className="text-xs text-honda-light/70">
                    Knock detection will automatically retard timing when knock is detected to protect the engine.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="launch" className="pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch 
                id="launch-control" 
                checked={launchControl}
                onCheckedChange={setLaunchControl}
              />
              <Label htmlFor="launch-control" className="text-honda-light">Enable Launch Control</Label>
            </div>
            
            {launchControl && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="launch-rpm" className="text-honda-light">Launch RPM</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[launchRpm]}
                        max={6000}
                        min={2000}
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
                    <Label htmlFor="launch-fuel" className="text-honda-light">Launch Fuel Enrichment (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[launchFuelEnrichment]}
                        max={30}
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
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="two-step" 
                      checked={twoStep}
                      onCheckedChange={setTwoStep}
                    />
                    <Label htmlFor="two-step" className="text-honda-light">Enable Two-Step</Label>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="launch-retard" className="text-honda-light">Launch Timing Retard (degrees)</Label>
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
                      id="antilag" 
                      checked={antilag}
                      onCheckedChange={setAntilag}
                    />
                    <Label htmlFor="antilag" className="text-honda-light">Enable Anti-Lag at Launch</Label>
                  </div>
                  
                  <div className="rounded-md border border-honda-gray p-4">
                    <h3 className="text-sm font-medium text-honda-light mb-2">Launch Control Info</h3>
                    <p className="text-xs text-honda-light/70">
                      Launch control helps optimize traction from a standing start. Two-step allows for a two-stage rev limiter:
                      one limit for launch and a higher limit for normal driving.
                    </p>
                    <p className="text-xs text-honda-light/70 mt-2">
                      Anti-lag maintains turbo spool during launch by retarding timing and adding fuel, which
                      creates combustion in the exhaust manifold. This can be hard on components.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="boost" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="boost-target" className="text-honda-light">Base Boost Target (PSI)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[15]}
                      max={30}
                      min={0}
                      step={0.5}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                      15.0
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="boost-by-rpm" 
                    defaultChecked={true}
                  />
                  <Label htmlFor="boost-by-rpm" className="text-honda-light">Dynamic Boost by RPM</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="boost-by-gear" 
                    checked={boostByGear}
                    onCheckedChange={setBoostByGear}
                  />
                  <Label htmlFor="boost-by-gear" className="text-honda-light">Boost by Gear</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="boost-comp" 
                    defaultChecked={true}
                  />
                  <Label htmlFor="boost-comp" className="text-honda-light">Boost Temperature Compensation</Label>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="rounded-md border border-honda-gray p-4">
                  <h3 className="text-sm font-medium text-honda-light mb-2">Boost Control System</h3>
                  <p className="text-xs text-honda-light/70">
                    Boost control is managed by electronic wastegate control. The map-based boost target
                    is modulated by temperature, gear, and RPM for optimal performance and safety.
                  </p>
                  <p className="text-xs text-honda-light/70 mt-2">
                    Use the Boost Map tab to set detailed boost targets based on RPM and load conditions.
                  </p>
                </div>
                
                <div className="rounded-md border border-honda-gray p-4">
                  <h3 className="text-sm font-medium text-honda-light mb-2">Warning</h3>
                  <p className="text-xs text-red-400">
                    Setting high boost targets may exceed the capabilities of the stock engine and turbo system.
                    Ensure your fuel system and engine internals are upgraded appropriately for high boost applications.
                  </p>
                </div>
                
                <div>
                  <Button 
                    className="mr-2 bg-honda-gray hover:bg-honda-gray/90"
                    onClick={() => toast.info("Boost Map Editor would open here")}
                  >
                    Edit Boost Map
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
                    onClick={() => toast.info("Wastegate Calibration would open here")}
                  >
                    Wastegate Calibration
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TuningSettings;
