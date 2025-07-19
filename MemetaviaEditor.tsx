
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CanvasElement, ImageEffects, TextStyle, Point, PanelVisibility, TextElement, StickerElement } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import TopBar from './TopBar';
import CanvasWorkspace from './CanvasWorkspace';
import ImageEffectsPanel from './ImageEffectsPanel';
import TextEffectsPanel from './TextEffectsPanel';
import StickerLibraryPanel from './StickerLibraryPanel';
import EditTextPanel from './EditTextPanel';

const DEFAULT_EFFECTS: ImageEffects = { contrast: 100, saturation: 100, noise: 0, posterize: 1, blur: 0, blurAngle: 0 };

const MemetaviaEditor: React.FC = () => {
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [imagePosition, setImagePosition] = useState<Point>({ x: 0, y: 0 });
  const [isImageLocked, setIsImageLocked] = useState<boolean>(false);
  const [imageEffects, setImageEffects] = useState<ImageEffects>(DEFAULT_EFFECTS);
  
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
  
  const [textStyle, setTextStyle] = useState<TextStyle>({ color: '#FFFFFF', outline: true, deepFry: false });

  const [panelVisibility, setPanelVisibility] = useState<PanelVisibility>({ imageEffects: true, textEffects: true, stickerLibrary: false });
  const [editTextPanelState, setEditTextPanelState] = useState<{ visible: boolean; element: TextElement | null }>({ visible: false, element: null });

  const imageUploadRef = useRef<HTMLInputElement>(null);
  const stickerUploadRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const addStickerFromSrc = (src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const scale = Math.min(150 / img.naturalWidth, 150 / img.naturalHeight);
        const newSticker: StickerElement = {
            id: Date.now(),
            type: 'sticker',
            src: img.src,
            image: img,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            rotation: 0,
            scale: 1,
            width: img.naturalWidth * scale,
            height: img.naturalHeight * scale,
        };
        setElements(prev => [...prev, newSticker]);
        setSelectedElementId(newSticker.id);
    };
    img.onerror = () => {
        console.error("Failed to load sticker image from src:", src);
    }
    img.src = src;
  };

  const handleFileUpload = (file: File, type: 'image' | 'sticker') => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const src = e.target?.result as string;
        if (type === 'image') {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
                img.width *= scale;
                img.height *= scale;
                const x = (CANVAS_WIDTH - img.width) / 2;
                const y = (CANVAS_HEIGHT - img.height) / 2;
                setBaseImage(img);
                setImagePosition({ x, y });
                setElements([]); // Clear elements on new image
            };
            img.src = src;
        } else { // sticker
            addStickerFromSrc(src);
        }
    };
    reader.readAsDataURL(file);
  };
  
  const addText = () => {
    const newText: TextElement = {
      id: Date.now(),
      type: 'text',
      text: 'Sample Text',
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      rotation: 0,
      scale: 1,
      fontSize: 48,
      fontFamily: "'VT323', monospace",
      width: 200, // Approximate, should be calculated based on text
      height: 50,
    };
    setElements(prev => [...prev, newText]);
    setSelectedElementId(newText.id);
  };
  
  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const editorNode = editorContainerRef.current;
    if (!editorNode) return;

    const imageCanvas = editorNode.querySelector('canvas:first-of-type') as HTMLCanvasElement;
    if (imageCanvas) {
        ctx.drawImage(imageCanvas, 0, 0);
    }
    
    elements.forEach(el => {
        if (el.type === 'sticker') {
            const stickerEl = el as StickerElement;
            if (!stickerEl.image.complete || stickerEl.image.naturalHeight === 0) return;
            ctx.save();
            ctx.translate(stickerEl.x, stickerEl.y);
            ctx.rotate(stickerEl.rotation * Math.PI / 180);
            const w = stickerEl.width * stickerEl.scale;
            const h = stickerEl.height * stickerEl.scale;
            ctx.drawImage(stickerEl.image, -w/2, -h/2, w, h);
            ctx.restore();
        } else if (el.type === 'text' && !textStyle.deepFry) {
            const textEl = el as TextElement;
            ctx.save();
            ctx.translate(textEl.x, textEl.y);
            ctx.rotate(textEl.rotation * Math.PI / 180);
            const fontSize = textEl.fontSize * textEl.scale;
            ctx.font = `bold ${fontSize}px 'VT323', monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = textStyle.color;
            if (textStyle.outline) {
              ctx.strokeStyle = '#000000'; ctx.lineWidth = fontSize / 10;
              ctx.strokeText(textEl.text, 0, 0);
            }
            ctx.fillText(textEl.text, 0, 0);
            ctx.restore();
        }
    });

    const link = document.createElement('a');
    link.download = 'memetavia.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleTextSelect = (element: TextElement) => {
    setEditTextPanelState({ visible: true, element });
  };

  const handleTextUpdate = (newText: string) => {
    if (!editTextPanelState.element) return;
    const { id } = editTextPanelState.element;
    
    const tempCtx = document.createElement('canvas').getContext('2d');
    if(tempCtx) {
        tempCtx.font = `bold ${editTextPanelState.element.fontSize * editTextPanelState.element.scale}px 'VT323', monospace`;
        const textMetrics = tempCtx.measureText(newText);
        const newWidth = textMetrics.width;

        setElements(prev => prev.map(el => el.id === id ? { ...el, text: newText, width: newWidth } : el));
        setEditTextPanelState(prev => prev.element ? { ...prev, element: { ...prev.element, text: newText, width: newWidth } } : prev);
    }
  };
  
  const togglePanel = (panel: keyof PanelVisibility) => {
    setPanelVisibility(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0], 'image');
        e.dataTransfer.clearData();
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (selectedElementId === null) {
        setEditTextPanelState({ visible: false, element: null });
    }
  }, [selectedElementId]);

  return (
    <div ref={editorContainerRef} className="w-full h-full flex flex-col items-center justify-center">
      <TopBar
        onUploadImage={() => imageUploadRef.current?.click()}
        onAddText={addText}
        onAddSticker={() => stickerUploadRef.current?.click()}
        onDownload={handleDownload}
        isImageLocked={isImageLocked}
        onToggleLockImage={() => setIsImageLocked(p => !p)}
        onTogglePanel={togglePanel}
      />
      
      <input type="file" ref={imageUploadRef} onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'image')} className="hidden" accept="image/*"/>
      <input type="file" ref={stickerUploadRef} onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'sticker')} className="hidden" accept="image/*"/>

      <main className="relative mt-16" onDrop={handleDrop} onDragOver={handleDragOver}>
        {!baseImage && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-10 border-2 border-orange-500" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                <div className="text-center">
                    <p className="text-3xl text-orange-500 uppercase tracking-widest text-glow">Drag & Drop Image</p>
                    <p className="text-gray-300 my-4 text-xl">or</p>
                    <button onClick={() => imageUploadRef.current?.click()} className="px-4 py-2 bg-black text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-200 uppercase text-lg text-glow">Select File</button>
                </div>
            </div>
        )}
        <CanvasWorkspace
            image={baseImage}
            imageEffects={imageEffects}
            textStyle={textStyle}
            elements={elements}
            setElements={setElements}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            imagePosition={imagePosition}
            setImagePosition={setImagePosition}
            isImageLocked={isImageLocked}
            onTextSelect={handleTextSelect}
        />
      </main>

      <ImageEffectsPanel
        effects={imageEffects}
        setEffects={setImageEffects}
        isVisible={panelVisibility.imageEffects}
        onClose={() => togglePanel('imageEffects')}
        onReset={() => setImageEffects(DEFAULT_EFFECTS)}
      />
      <TextEffectsPanel
        textStyle={textStyle}
        setTextStyle={setTextStyle}
        isVisible={panelVisibility.textEffects}
        onClose={() => togglePanel('textEffects')}
      />
      <StickerLibraryPanel
        onAddStickerByUrl={addStickerFromSrc}
        isVisible={panelVisibility.stickerLibrary}
        onClose={() => togglePanel('stickerLibrary')}
      />
      {editTextPanelState.visible && editTextPanelState.element && (
        <EditTextPanel
            text={editTextPanelState.element.text}
            onTextChange={handleTextUpdate}
            isVisible={editTextPanelState.visible}
            onClose={() => setEditTextPanelState({ visible: false, element: null })}
            initialPosition={{ x: editTextPanelState.element.x - 125, y: editTextPanelState.element.y + 50}}
        />
      )}
    </div>
  );
};

export default MemetaviaEditor;
