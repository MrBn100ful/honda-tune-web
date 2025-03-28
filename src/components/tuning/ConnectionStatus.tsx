
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Usb } from "lucide-react";

const ConnectionStatus = () => {
  const [connected, setConnected] = useState(false);
  
  // Simulate connection status for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnected(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={connected ? "default" : "outline"}
            className={`flex items-center gap-1 cursor-pointer ${connected ? 'bg-green-600' : 'text-muted-foreground'}`}
          >
            {connected && <div className="blinking-dot"></div>}
            <Usb size={14} />
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {connected 
            ? 'Connected to ECU via Serial RTP' 
            : 'Click to connect to ECU'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;
