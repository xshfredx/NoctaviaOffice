import React from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { Point } from '../types';

interface DraggablePanelProps {
  title: string;
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  initialPosition: Point;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({ title, children, isVisible, onClose, initialPosition }) => {
  const [panelRef, position] = useDraggable<HTMLDivElement>(initialPosition);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="absolute bg-black border-2 border-orange-500 flex flex-col"
      style={{ top: position.y, left: position.x, minWidth: '250px', zIndex: 50 }}
    >
      <div className="drag-handle bg-black p-2 border-b-2 border-orange-500 flex justify-between items-center cursor-grab">
        <h3 className="font-bold text-base text-orange-500 uppercase select-none tracking-widest text-glow">{title}</h3>
        <button onClick={onClose} className="text-orange-500 hover:text-white font-bold text-xl">&times;</button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default DraggablePanel;