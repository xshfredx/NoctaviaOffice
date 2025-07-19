import React from 'react';
import DraggablePanel from './DraggablePanel';
import { ImageEffects, Point } from '../types';

interface ImageEffectsPanelProps {
  effects: ImageEffects;
  setEffects: React.Dispatch<React.SetStateAction<ImageEffects>>;
  isVisible: boolean;
  onClose: () => void;
  onReset: () => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number }> = ({ label, value, onChange, min = 0, max = 200, step = 1 }) => (
  <div className="mb-3">
    <label className="block text-sm mb-1 select-none uppercase text-glow">{label} ({value})</label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
  </div>
);

const PRESETS: (ImageEffects & { name: string })[] = [
    { name: 'Preset 1', contrast: 147, saturation: 168, noise: 45, posterize: 7, blur: 0, blurAngle: 0 },
    { name: 'Preset 2', contrast: 102, saturation: 0, noise: 79, posterize: 4, blur: 0, blurAngle: 0 },
    { name: 'Preset 3', contrast: 97, saturation: 141, noise: 79, posterize: 3, blur: 0, blurAngle: 0 },
    { name: 'Preset 4', contrast: 55, saturation: 200, noise: 79, posterize: 2, blur: 0, blurAngle: 0 },
];

const ImageEffectsPanel: React.FC<ImageEffectsPanelProps> = ({ effects, setEffects, isVisible, onClose, onReset }) => {
  const handleChange = (key: keyof ImageEffects) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEffects(prev => ({ ...prev, [key]: Number(e.target.value) }));
  };
  
  const applyPreset = (preset: ImageEffects) => {
    setEffects(preset);
  };

  return (
    <DraggablePanel title="Image Effects" isVisible={isVisible} onClose={onClose} initialPosition={{ x: window.innerWidth - 300, y: 80 }}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => applyPreset(preset)} className="px-2 py-1 bg-black text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-200 text-xs uppercase text-glow">
                {preset.name}
            </button>
        ))}
      </div>
      <Slider label="Contrast" value={effects.contrast} onChange={handleChange('contrast')} />
      <Slider label="Saturation" value={effects.saturation} onChange={handleChange('saturation')} />
      <Slider label="Noise" value={effects.noise} onChange={handleChange('noise')} max={100} />
      <Slider label="Posterize" value={effects.posterize} onChange={handleChange('posterize')} min={2} max={30} />
      <div className="border border-orange-800 p-2 mt-2">
        <Slider label="Motion Blur" value={effects.blur} onChange={handleChange('blur')} max={50} />
        <Slider label="Blur Angle" value={effects.blurAngle} onChange={handleChange('blurAngle')} max={360} />
      </div>
      <button onClick={onReset} className="w-full mt-4 px-4 py-2 bg-orange-500 text-black hover:bg-black hover:text-orange-500 border border-orange-500 transition-colors duration-200 text-sm font-bold uppercase text-glow">Reset</button>
    </DraggablePanel>
  );
};

export default ImageEffectsPanel;
