import React, { useState } from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Navbar = () => {
  const [baudRate, setBaudRate] = useState("9600");
  const [rtpType, setRtpType] = useState("CobreRTP");

  return (
    <div className="h-14 border-b border-honda-gray/50 bg-honda-dark flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-honda-light">WebTune - OBD1</h1>
      </div>
      <div className="flex items-center gap-2">
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
                    <SelectItem value="CobreRTP">CobreRTP</SelectItem>
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