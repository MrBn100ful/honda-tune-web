
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface CellEditorProps {
  value: number;
  onSave: (value: number) => void;
  onCancel: () => void;
}

const CellEditor = ({ value, onSave, onCancel }: CellEditorProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onSave(numValue);
    }
  };

  return (
    <div className="absolute inset-0 bg-honda-dark border-2 border-honda-accent rounded-md p-2 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-xs text-honda-light">Edit Value</Label>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 text-honda-light/70 hover:text-honda-light"
          onClick={onCancel}
        >
          <X size={12} />
        </Button>
      </div>
      <Input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        className="h-6 text-xs bg-honda-gray border-honda-gray text-honda-light"
        autoFocus
      />
    </div>
  );
};

export default CellEditor;
