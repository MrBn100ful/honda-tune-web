
import React, { useState } from 'react';
import { Settings, Upload, Circle, Plug, AlertTriangle, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AboutDialog } from "@/components/layout/AboutDialog";

interface NavbarProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const Navbar = ({ isConnected, onConnectionChange }: NavbarProps) => {
  const [baudRate, setBaudRate] = useState("9600");
  const [rtpType, setRtpType] = useState("Cobra RTP");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showFlashWarning, setShowFlashWarning] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    onConnectionChange(true);
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    // Simulate disconnection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onConnectionChange(false);
    setIsConnecting(false);
  };

  const handleFlashClick = () => {
    if (!isConnected) {
      setShowFlashWarning(true);
    }
  };

  return (
    <div className="h-14 border-b border-honda-gray/50 bg-honda-dark flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-honda-light">WebTune - OBD1</h1>
        <div className="flex items-center gap-2">
          <Circle 
            size={8} 
            className={`${isConnected ? 'text-green-500' : 'text-red-500'}`} 
            fill="currentColor"
          />
          <span className="text-sm text-honda-light/70">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="ml-4 text-xs italic text-honda-light/60 max-w-md">
          This is a front-end demo of what a modern ECU tuning software could look like. This will never do anything real.
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Dialog open={showFlashWarning} onOpenChange={setShowFlashWarning}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFlashClick}
              className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
            >
              <Upload size={16} className="mr-2" />
              Flash EEPROM
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-honda-dark border-honda-gray">
            <DialogHeader>
              <DialogTitle className="text-honda-light flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" />
                Not Connected
              </DialogTitle>
              <DialogDescription className="text-honda-light/70">
                Please connect to the EEPROM programer before attempting to flash the EEPROM.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowFlashWarning(false)}
                className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting}
          className={`${
            isConnected 
              ? 'bg-red-900/50 border-red-900/50 text-red-200 hover:bg-red-900/70' 
              : 'bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark'
          }`}
        >
          <Plug size={16} className={`mr-2 ${isConnecting ? 'animate-pulse' : ''}`} />
          {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
        </Button>
        <AboutDialog />
        <ThemeToggle />
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
            >
              <Settings size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-honda-dark border-honda-gray">
            <DialogHeader>
              <DialogTitle className="text-honda-light">Connection Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-honda-light/70">Baud Rate</label>
                <Select value={baudRate} onValueChange={setBaudRate}>
                  <SelectTrigger className="bg-honda-gray border-honda-gray text-honda-light">
                    <SelectValue placeholder="Select baud rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9600">9600</SelectItem>
                    <SelectItem value="19200">19200</SelectItem>
                    <SelectItem value="38400">38400</SelectItem>
                    <SelectItem value="57600">57600</SelectItem>
                    <SelectItem value="115200">115200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-honda-light/70">RTP Type</label>
                <Select value={rtpType} onValueChange={setRtpType}>
                  <SelectTrigger className="bg-honda-gray border-honda-gray text-honda-light">
                    <SelectValue placeholder="Select RTP type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cobra RTP">Cobra RTP</SelectItem>
                    <SelectItem value="Hondata S300">Hondata S300</SelectItem>
                    <SelectItem value="Neptune RTP">Neptune RTP</SelectItem>
                    <SelectItem value="Chrome RTP">Chrome RTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Navbar;
