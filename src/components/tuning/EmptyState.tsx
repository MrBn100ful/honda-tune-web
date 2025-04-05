
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface EmptyStateProps {
  handleStartSetup: () => void;
  handleLoadMap: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ handleStartSetup, handleLoadMap, fileInputRef }) => {
  const handleLoadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      toast.error("File input reference not available");
      console.error("fileInputRef is not available");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Honda Engine Tuning</h2>
        <p className="mb-6 text-muted-foreground">
          Get started by either configuring a new ECU setup or loading an existing map.
        </p>
        
        <div className="flex flex-col space-y-4">
          <Button 
            variant="honda" 
            size="lg" 
            className="w-full"
            onClick={handleStartSetup}
          >
            <Settings2 className="mr-2 h-5 w-5" />
            Start ECU Setup
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={handleLoadClick}
          >
            <Upload className="mr-2 h-5 w-5" />
            Load Existing Map
          </Button>
          
          {/* Hidden file input for map loading */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleLoadMap}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
