
import React, { useState, useRef, useEffect } from 'react';
import { Move } from "lucide-react";

interface DraggableEditorProps {
  children: React.ReactNode;
  className?: string;
}

const DraggableEditor: React.FC<DraggableEditorProps> = ({ children, className }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editorRef.current && e.target === editorRef.current.querySelector('.drag-handle')) {
      setIsDragging(true);
      const rect = editorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={editorRef}
      className={`absolute z-50 shadow-lg ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="drag-handle bg-honda-gray/90 p-2 rounded-t-md flex items-center justify-between cursor-move">
        <span className="text-sm font-medium text-honda-light">Cell Editor</span>
        <Move size={16} className="text-honda-light/70" />
      </div>
      {children}
    </div>
  );
};

export default DraggableEditor;
