
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Settings, FileUp } from "lucide-react";

interface EmptyStateProps {
  handleStartSetup: () => void;
  handleLoadMap: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ handleStartSetup, handleLoadMap }) => {
  return (
    <div className="flex items-center justify-center h-full bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">ECU Tuning Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center">
              <AlertTriangle size={64} className="text-yellow-500 my-4" />
            </div>
            <p className="text-center text-muted-foreground mb-4">
              No tuning project is currently active. Would you like to:
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                className="w-full"
                variant="accent"
                onClick={handleStartSetup}
              >
                <Settings size={16} />
                Start Setup Wizard
              </Button>
              
              <div className="relative">
                <Input
                  type="file"
                  id="map-upload"
                  accept=".json"
                  className="hidden"
                  onChange={handleLoadMap}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => document.getElementById('map-upload')?.click()}
                >
                  <FileUp size={16} />
                  Load Existing Map
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyState;
