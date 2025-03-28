import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Thermometer, Activity, Timer } from "lucide-react";

interface SidebarProps {
  isConnected: boolean;
}

const Sidebar = ({ isConnected }: SidebarProps) => {
  return (
    <div className="w-64 border-r border-honda-gray/50 bg-honda-dark flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isConnected ? (
            <>
              <Card className="bg-honda-gray/50 border-honda-gray">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm text-honda-light">Datalog</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-honda-light/70">
                      <Gauge size={14} />
                      <span>RPM</span>
                    </div>
                    <span className="text-honda-light">2,450</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-honda-light/70">
                      <Thermometer size={14} />
                      <span>ECT</span>
                    </div>
                    <span className="text-honda-light">185°F</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-honda-light/70">
                      <Activity size={14} />
                      <span>MAP</span>
                    </div>
                    <span className="text-honda-light">12.5 psi</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-honda-light/70">
                      <Timer size={14} />
                      <span>IAT</span>
                    </div>
                    <span className="text-honda-light">95°F</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-honda-light/50">
              <p>Connect to view datalog information</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
