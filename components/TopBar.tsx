import React, { useState } from 'react';

interface TopBarProps {
  onUploadImage: () => void;
  onAddText: () => void;
  onAddSticker: () => void;
  onDownload: () => void;
  isImageLocked: boolean;
  onToggleLockImage: () => void;
  onTogglePanel: (panel: 'imageEffects' | 'textEffects' | 'stickerLibrary') => void;
}

const TopBar: React.FC<TopBarProps> = ({
  onUploadImage,
  onAddText,
  onAddSticker,
  onDownload,
  isImageLocked,
  onToggleLockImage,
  onTogglePanel
}) => {
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [elementsMenuOpen, setElementsMenuOpen] = useState(false);

  const buttonStyle = "px-3 py-1 bg-black text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-200 uppercase text-glow";
  const menuItemStyle = "block w-full text-left px-4 py-2 text-sm text-orange-500 hover:bg-orange-500 hover:text-black uppercase text-glow";

  return (
    <div className="absolute top-0 left-0 right-0 bg-black p-2 flex items-center justify-between border-b-2 border-orange-500 z-40">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold text-orange-500 uppercase tracking-widest text-glow">memetavia</h1>
        <div className="relative">
          <button onClick={() => { setFileMenuOpen(!fileMenuOpen); setElementsMenuOpen(false); }} className={buttonStyle}>File</button>
          {fileMenuOpen && (
            <div className="absolute top-full left-0 mt-2 bg-black border border-orange-500 py-1 w-48 z-50">
              <button onClick={(e) => { e.preventDefault(); onUploadImage(); setFileMenuOpen(false); }} className={menuItemStyle}>Upload Image</button>
              <button onClick={(e) => { e.preventDefault(); onDownload(); setFileMenuOpen(false); }} className={menuItemStyle}>Download</button>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setElementsMenuOpen(!elementsMenuOpen); setFileMenuOpen(false); }} className={buttonStyle}>Elements</button>
          {elementsMenuOpen && (
            <div className="absolute top-full left-0 mt-2 bg-black border border-orange-500 py-1 w-56 z-50">
              <button onClick={(e) => { e.preventDefault(); onAddText(); setElementsMenuOpen(false); }} className={menuItemStyle}>Add Text</button>
              <button onClick={(e) => { e.preventDefault(); onAddSticker(); setElementsMenuOpen(false); }} className={menuItemStyle}>Upload Custom Sticker</button>
               <button onClick={(e) => { e.preventDefault(); onTogglePanel('stickerLibrary'); setElementsMenuOpen(false); }} className={menuItemStyle}>Sticker Library</button>
            </div>
          )}
        </div>
         <div className="relative">
          <button onClick={() => onTogglePanel('imageEffects')} className={buttonStyle}>Image Effects</button>
        </div>
         <div className="relative">
          <button onClick={() => onTogglePanel('textEffects')} className={buttonStyle}>Text Effects</button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center cursor-pointer">
          <span className="mr-3 text-sm uppercase text-orange-500 text-glow">{isImageLocked ? 'Image Locked' : 'Image Unlocked'}</span>
          <div className="relative">
            <input type="checkbox" checked={isImageLocked} onChange={onToggleLockImage} className="sr-only" />
            <div className={`block w-12 h-6 ${isImageLocked ? 'bg-orange-500' : 'bg-gray-800'} border-2 border-orange-500`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 transition-transform ${isImageLocked ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default TopBar;
