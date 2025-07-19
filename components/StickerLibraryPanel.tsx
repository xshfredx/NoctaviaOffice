import React from 'react';
import DraggablePanel from './DraggablePanel';
import { INITIAL_STICKERS } from '../constants';
import { Point } from '../types';

interface StickerLibraryPanelProps {
  onAddStickerByUrl: (url: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const StickerLibraryPanel: React.FC<StickerLibraryPanelProps> = ({ onAddStickerByUrl, isVisible, onClose }) => {
  return (
    <DraggablePanel title="Sticker Library" isVisible={isVisible} onClose={onClose} initialPosition={{ x: 50, y: 450 }}>
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {INITIAL_STICKERS.map((stickerSrc, index) => (
          <button 
            key={index} 
            onClick={() => onAddStickerByUrl(stickerSrc)}
            className="p-1 bg-black border border-gray-800 hover:border-orange-500 transition-all transform hover:scale-110"
          >
            <img src={stickerSrc} alt={`Sticker ${index + 1}`} className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </DraggablePanel>
  );
};

export default StickerLibraryPanel;
