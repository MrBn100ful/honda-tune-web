import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RotateCcw } from "lucide-react";

const TuningSettings = () => {
  // General settings
  const [injectorSize, setInjectorSize] = useState(440);
  const [popcornMode, setPopcornMode] = useState(false);
  const [launchControl, setLaunchControl] = useState(true);
  const [launchRpm, setLaunchRpm] = useState(4200);
  const [revLimiter, setRevLimiter] = useState(8600);
  const [idleRpm, setIdleRpm] = useState(850);
  const [ecuType, setEcuType] = useState("p28");
  const [engineType, setEngineType] = useState("b16a");
  const [vtecEnabled, setVtecEnabled] = useState(true);
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

  const handleReset = () => {
    // Reset all values to their defaults
    setInjectorSize(440);
    setPopcornMode(false);
    setLaunchControl(true);
    setLaunchRpm(4200);
    setRevLimiter(8600);
    setIdleRpm(850);
    setEcuType("p28");
    setEngineType("b16a");
    setVtecEnabled(true);
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
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving settings...");
  };
  
  return (
    <Card className="w-full h-full bg-honda-dark border-honda-gray">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-honda-light">Tuning Settings</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw size={16} className="mr-1" /> Reset
            </Button>
            <Button variant="default" size="sm" className="bg-honda-red" onClick={handleSave}>
              <Save size={16} className="mr-1" /> Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="fuel">Fuel Settings</TabsTrigger>
            <TabsTrigger value="ignition">Ignition</TabsTrigger>
            <TabsTrigger value="launch">Launch Control</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ecu-type" className="text-honda-light">ECU Type</Label>
                  <Select value={ecuType} onValueChange={setEcuType}>
                    <SelectTrigger id="ecu-type" className="bg-honda-gray border-honda-gray">
                      <SelectValue placeholder="Select ECU Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p28">P28 (1996-1998 Civic)</SelectItem>
                      <SelectItem value="p72">P72 (1999-2000 Civic)</SelectItem>
                      <SelectItem value="p30">P30 (Integra)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="engine-type" className="text-honda-light">Engine Type</Label>
                  <Select value={engineType} onValueChange={setEngineType}>
                    <SelectTrigger id="engine-type" className="bg-honda-gray border-honda-gray">
                      <SelectValue placeholder="Select Engine Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b16a">B16A</SelectItem>
                      <SelectItem value="b18c">B18C</SelectItem>
                      <SelectItem value="d16z6">D16Z6</SelectItem>
                      <SelectItem value="k20a">K20A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="vtec" 
                    checked={vtecEnabled}
                    onCheckedChange={setVtecEnabled}
                  />
                  <Label htmlFor="vtec" className="text-honda-light">VTEC Enabled</Label>
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
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="map-sensor" className="text-honda-light">MAP Sensor Type</Label>
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fuel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="injector-size" className="text-honda-light">Injector Size (cc/min)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[injectorSize]}
                      max={1000}
                      min={240}
                      step={10}
                      onValueChange={(value) => setInjectorSize(value[0])}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-bold bg-honda-gray p-1 rounded text-honda-light">
                      {injectorSize}
                    </div>
                  </div>
                </div>
                
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
                      {targetAfrCruise}
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
                      {targetAfrWot}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fuel-pressure" className="text-honda-light">Fuel Pressure (psi)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[fuelPressure]}
                      max={60}
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
                
                <div>
                  <Label htmlFor="fuel-type" className="text-honda-light">Fuel Type</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger id="fuel-type" className="bg-honda-gray border-honda-gray">
                      <SelectValue placeholder="Select Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline (91-93 Octane)</SelectItem>
                      <SelectItem value="e85">E85</SelectItem>
                      <SelectItem value="ethanol">Ethanol</SelectItem>
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
          
          <TabsContent value="ignition" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
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
              </div>
              
              <div className="space-y-4">
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
            </div>
          </TabsContent>
          
          <TabsContent value="launch">
            <div className="flex items-center space-x-2 mb-4">
              <Switch 
                id="launch-control" 
                checked={launchControl}
                onCheckedChange={setLaunchControl}
              />
              <Label htmlFor="launch-control" className="text-honda-light">Enable Launch Control</Label>
            </div>
            
            {launchControl && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
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
                </div>
                
                <div className="space-y-4">
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
                      id="two-step" 
                      checked={twoStep}
                      onCheckedChange={setTwoStep}
                    />
                    <Label htmlFor="two-step" className="text-honda-light">Enable Two-Step</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="antilag" 
                      checked={antilag}
                      onCheckedChange={setAntilag}
                    />
                    <Label htmlFor="antilag" className="text-honda-light">Enable Anti-Lag at Launch</Label>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TuningSettings;
