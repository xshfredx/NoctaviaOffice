import React from 'react';
import DraggablePanel from './DraggablePanel';
import { TextStyle, Point } from '../types';

interface TextEffectsPanelProps {
  textStyle: TextStyle;
  setTextStyle: React.Dispatch<React.SetStateAction<TextStyle>>;
  isVisible: boolean;
  onClose: () => void;
}

const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({ textStyle, setTextStyle, isVisible, onClose }) => {
  const handleStyleChange = <K extends keyof TextStyle,>(key: K, value: TextStyle[K]) => {
    setTextStyle(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DraggablePanel title="Text Effects" isVisible={isVisible} onClose={onClose} initialPosition={{ x: window.innerWidth - 300, y: 450 }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm select-none uppercase text-glow">Text Color</label>
          <input 
            type="color" 
            value={textStyle.color} 
            onChange={(e) => handleStyleChange('color', e.target.value)}
            className="w-10 h-10 p-0 border border-orange-500 bg-black cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="outline-toggle" className="text-sm select-none uppercase text-glow">Black Outline</label>
          <input 
            id="outline-toggle"
            type="checkbox"
            checked={textStyle.outline}
            onChange={(e) => handleStyleChange('outline', e.target.checked)}
            className="w-5 h-5 text-orange-500 bg-black border-orange-500 focus:ring-orange-500 ring-offset-black focus:ring-2"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="deep-fry-toggle" className="text-sm select-none uppercase text-glow">Deep Fry Text</label>
           <input 
            id="deep-fry-toggle"
            type="checkbox"
            checked={textStyle.deepFry}
            onChange={(e) => handleStyleChange('deepFry', e.target.checked)}
            className="w-5 h-5 text-orange-500 bg-black border-orange-500 focus:ring-orange-500 ring-offset-black focus:ring-2"
          />
        </div>
        <p className="text-xs text-gray-500">
          "Deep Fry Text" applies image effects to the text. Turn it off for crisp, clean text.
        </p>
      </div>
    </DraggablePanel>
  );
};

export default TextEffectsPanel;
