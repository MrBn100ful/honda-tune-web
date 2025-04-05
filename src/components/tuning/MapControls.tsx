
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle, Percent, LucideBox, Info, Save, Upload } from "lucide-react";
import { MAP_TYPES } from './utils/mapUtils';

interface MapControlsProps {
  mapType: string;
  setMapType: (type: string) => void;
  selectedCellsCount: number;
  adjustValue: (amount: number, isPercentage?: boolean) => void;
  percentageAdjustment: number;
  setPercentageAdjustment: (value: number) => void;
  interpolateMap: () => void;
  generateMapReport: () => void;
  handleSaveMap: () => void;
  onLoadClick: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  selectedCellsCount,
  adjustValue,
  percentageAdjustment,
  setPercentageAdjustment,
  interpolateMap,
  generateMapReport,
  handleSaveMap,
  onLoadClick
}) => {
  return (
    <div className="bg-card p-2 border-b flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-2">
        <Select value={mapType} onValueChange={setMapType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Map Type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(MAP_TYPES).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground">
          {selectedCellsCount > 0 && (
            <span>{selectedCellsCount} cells selected</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {selectedCellsCount > 0 && (
          <>
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => adjustValue(-0.1)}
                className="px-2 rounded-none h-9 border-r"
              >
                <MinusCircle size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => adjustValue(0.1)}
                className="px-2 rounded-none h-9"
              >
                <PlusCircle size={16} />
              </Button>
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => adjustValue(-percentageAdjustment, true)}
                className="px-2 rounded-none h-9 border-r"
              >
                <Percent size={16} className="mr-1" />
                -{percentageAdjustment}%
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => adjustValue(percentageAdjustment, true)}
                className="px-2 rounded-none h-9"
              >
                <Percent size={16} className="mr-1" />
                +{percentageAdjustment}%
              </Button>
            </div>
            
            <div className="hidden md:flex items-center">
              <span className="text-sm text-muted-foreground mr-1">Incr:</span>
              <Input
                type="number"
                value={percentageAdjustment}
                onChange={(e) => setPercentageAdjustment(parseFloat(e.target.value))}
                className="w-16 h-8"
                min={1}
                max={20}
              />
              <span className="text-sm text-muted-foreground ml-1">%</span>
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={interpolateMap}
          className="h-9"
          title="Interpolate map values"
        >
          <LucideBox size={16} className="mr-1" />
          Smooth
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={generateMapReport}
          className="h-9"
          title="Generate map report"
        >
          <Info size={16} className="mr-1" />
          Info
        </Button>
        
        <Button
          variant="accent"
          size="sm"
          onClick={handleSaveMap}
          className="h-9"
          title="Save map"
        >
          <Save size={16} className="mr-1" />
          Save
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadClick}
          className="h-9"
          title="Load map"
        >
          <Upload size={16} className="mr-1" />
          Load
        </Button>
      </div>
    </div>
  );
};

export default MapControls;
