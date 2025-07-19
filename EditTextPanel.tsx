import React, { useEffect, useState } from 'react';
import DraggablePanel from './DraggablePanel';
import { Point } from '../types';

interface EditTextPanelProps {
  text: string;
  onTextChange: (newText: string) => void;
  isVisible: boolean;
  onClose: () => void;
  initialPosition: Point;
}

const EditTextPanel: React.FC<EditTextPanelProps> = ({ text, onTextChange, isVisible, onClose, initialPosition }) => {
  const [localText, setLocalText] = useState(text);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    onTextChange(e.target.value);
  };

  return (
    <DraggablePanel title="Edit Text" isVisible={isVisible} onClose={onClose} initialPosition={initialPosition}>
      <textarea
        value={localText}
        onChange={handleChange}
        className="w-full h-24 bg-black text-white border border-orange-500 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        autoFocus
        onFocus={(e) => e.target.select()}
      />
    </DraggablePanel>
  );
};

export default EditTextPanel;