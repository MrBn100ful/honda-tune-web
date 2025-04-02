
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export const AboutDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark"
          title="About WebTune"
        >
          <Info size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-honda-dark border-honda-gray max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-honda-light text-xl">About WebTune - OBD1</DialogTitle>
          <DialogDescription className="text-honda-light/70 mt-4">
            <p className="mb-4 text-lg font-medium text-honda-red">
              DISCLAIMER: This is a front-end demo of what a modern ECU tuning software could look like. 
              This will never do anything real and is for demonstration purposes only.
            </p>
            
            <p className="mb-2">
              WebTune is a concept application that showcases a modern approach to 
              ECU tuning software with a web-based interface.
            </p>
            
            <p className="mb-2">
              Features include 3D map visualization, real-time data display, and an 
              intuitive user interface designed for both beginners and professionals.
            </p>
            
            <p>
              Built with React, Three.js, and Tailwind CSS.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
