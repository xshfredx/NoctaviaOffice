import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { CanvasElement, ImageEffects, TextStyle, Point, TextElement, StickerElement } from '../types';

interface CanvasWorkspaceProps {
    image: HTMLImageElement | null;
    imageEffects: ImageEffects;
    textStyle: TextStyle;
    elements: CanvasElement[];
    setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
    selectedElementId: number | null;
    setSelectedElementId: (id: number | null) => void;
    imagePosition: Point;
    setImagePosition: React.Dispatch<React.SetStateAction<Point>>;
    isImageLocked: boolean;
    onTextSelect: (element: TextElement) => void;
}

const HANDLE_SIZE = 16;
const SELECTION_PADDING = 5;

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
    image, imageEffects, textStyle, elements, setElements,
    selectedElementId, setSelectedElementId, imagePosition, setImagePosition, isImageLocked, onTextSelect
}) => {
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    const uiCanvasRef = useRef<HTMLCanvasElement>(null);
    const [interaction, setInteraction] = useState<{ type: string; elementId: number; startPoint: Point; startElementState: any; } | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
    const [showGuides, setShowGuides] = useState({ h: false, v: false });

    const getCanvasPoint = (e: React.MouseEvent): Point => {
        const canvas = uiCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    
    const applyDirectionalBlur = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, pos: Point, effects: ImageEffects) => {
        if (!effects.blur || effects.blur <= 0) return;
        
        const angleRad = effects.blurAngle * Math.PI / 180;
        const blurAmount = effects.blur;

        ctx.globalAlpha = 0.1;
        const steps = 20;
        for(let i = 0; i < steps; i++) {
            const randomOffset = Math.random() * blurAmount;
            const offsetX = Math.cos(angleRad) * randomOffset;
            const offsetY = Math.sin(angleRad) * randomOffset;
            ctx.drawImage(img, pos.x + offsetX, pos.y + offsetY, img.width, img.height);
        }
        ctx.globalAlpha = 1.0;
    }

    // Drawing Logic
    const drawElements = useCallback(() => {
        const imageCtx = imageCanvasRef.current?.getContext('2d');
        const uiCtx = uiCanvasRef.current?.getContext('2d');
        if (!imageCtx || !uiCtx) return;

        imageCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        uiCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 1. Draw image and apply effects
        if (image) {
            imageCtx.save();
            // Apply blur first via multi-draw
            applyDirectionalBlur(imageCtx, image, imagePosition, imageEffects);
            
            // Apply other filter effects
            imageCtx.filter = `contrast(${imageEffects.contrast}%) saturate(${imageEffects.saturation}%)`;
            imageCtx.drawImage(image, imagePosition.x, imagePosition.y, image.width, image.height);
            imageCtx.restore();

            if (textStyle.deepFry) {
                elements.filter(el => el.type === 'text').forEach(el => drawText(imageCtx, el as TextElement, textStyle));
            }
            
            if (imageEffects.posterize > 1 || imageEffects.noise > 0) {
                applyPixelEffects(imageCtx, imageEffects);
            }
        }

        // 2. Draw non-fried elements on UI canvas
        elements.forEach(el => {
            if (el.type === 'sticker') drawSticker(uiCtx, el as StickerElement);
            if (el.type === 'text' && !textStyle.deepFry) drawText(uiCtx, el as TextElement, textStyle);
        });

        // 3. Draw selection UI
        const selectedElement = elements.find(el => el.id === selectedElementId);
        if (selectedElement) drawSelectionUI(uiCtx, selectedElement);

        // 4. Draw guides
        if (showGuides.h) {
            uiCtx.strokeStyle = 'rgba(249, 115, 22, 0.7)'; uiCtx.lineWidth = 1; uiCtx.beginPath(); uiCtx.moveTo(0, CANVAS_HEIGHT / 2); uiCtx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2); uiCtx.stroke();
        }
        if (showGuides.v) {
            uiCtx.strokeStyle = 'rgba(249, 115, 22, 0.7)'; uiCtx.lineWidth = 1; uiCtx.beginPath(); uiCtx.moveTo(CANVAS_WIDTH / 2, 0); uiCtx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT); uiCtx.stroke();
        }
    }, [image, imagePosition, imageEffects, textStyle, elements, selectedElementId, showGuides]);

    useEffect(() => {
        drawElements();
    }, [drawElements]);

    const drawText = (ctx: CanvasRenderingContext2D, el: TextElement, style: TextStyle) => {
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation * Math.PI / 180);
        
        const fontSize = el.fontSize * el.scale;
        ctx.font = `bold ${fontSize}px 'VT323', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = style.color;
        
        if (style.outline) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = fontSize / 10;
            ctx.strokeText(el.text, 0, 0);
        }
        ctx.fillText(el.text, 0, 0);
        ctx.restore();
    };
    
    const drawSticker = (ctx: CanvasRenderingContext2D, el: StickerElement) => {
        if (!el.image.complete || el.image.naturalHeight === 0) return;
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation * Math.PI / 180);
        const w = el.width * el.scale;
        const h = el.height * el.scale;
        ctx.drawImage(el.image, -w/2, -h/2, w, h);
        ctx.restore();
    };
    
    const applyPixelEffects = (ctx: CanvasRenderingContext2D, effects: ImageEffects) => {
        const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const data = imageData.data;
        const posterizeLevels = effects.posterize;
        const posterizeStep = 255 / (posterizeLevels - 1);

        for (let i = 0; i < data.length; i += 4) {
            if (effects.posterize > 1) {
                data[i] = Math.round(data[i] / posterizeStep) * posterizeStep;
                data[i + 1] = Math.round(data[i+1] / posterizeStep) * posterizeStep;
                data[i + 2] = Math.round(data[i+2] / posterizeStep) * posterizeStep;
            }
            if (effects.noise > 0) {
                const noise = (Math.random() - 0.5) * effects.noise;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
                data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const drawSelectionUI = (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation * Math.PI / 180);

        const w = el.width * el.scale;
        const h = el.height * el.scale;
        const outlineW = w + SELECTION_PADDING * 2;
        const outlineH = h + SELECTION_PADDING * 2;

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.strokeRect(-outlineW/2, -outlineH/2, outlineW, outlineH);

        const drawHandle = (x: number, y: number) => {
            ctx.fillStyle = '#f97316';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(x - HANDLE_SIZE/2, y-HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.fill();
            ctx.stroke();
        };

        const drawTextHandle = (x: number, y: number, text: string) => {
            ctx.fillStyle = '#f97316';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.font = `bold ${HANDLE_SIZE}px 'VT323', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        };
        
        drawTextHandle(outlineW / 2 + HANDLE_SIZE, 0, '↔'); // Resize
        drawTextHandle(0, -outlineH / 2 - HANDLE_SIZE, '⟳'); // Rotate
        drawTextHandle(-outlineW / 2 - HANDLE_SIZE, -outlineH / 2 - HANDLE_SIZE, '×'); // Delete
        
        ctx.restore();
    };

    const getHitTarget = (point: Point): { type: string; elementId: number } | null => {
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            const dx = point.x - el.x;
            const dy = point.y - el.y;
            const angle = -el.rotation * Math.PI / 180;
            const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
            const localY = dx * Math.sin(angle) + dy * Math.cos(angle);

            const w = el.width * el.scale + SELECTION_PADDING * 2;
            const h = el.height * el.scale + SELECTION_PADDING * 2;
            
            // Check handles first
            const checkHandle = (hx: number, hy: number) => Math.hypot(localX-hx, localY-hy) < HANDLE_SIZE * 1.5;

            if (checkHandle(w / 2 + HANDLE_SIZE, 0)) return { type: 'resize', elementId: el.id };
            if (checkHandle(0, -h / 2 - HANDLE_SIZE)) return { type: 'rotate', elementId: el.id };
            if (checkHandle(-w/2 - HANDLE_SIZE, -h/2-HANDLE_SIZE)) return { type: 'delete', elementId: el.id };

            // Check body
            if (Math.abs(localX) < w / 2 && Math.abs(localY) < h / 2) {
                return { type: 'drag', elementId: el.id };
            }
        }
        return null;
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        const point = getCanvasPoint(e);
        const hit = getHitTarget(point);

        if (hit) {
            const element = elements.find(el => el.id === hit.elementId)!;
            setSelectedElementId(hit.elementId);

            if (hit.type === 'delete') {
                setElements(prev => prev.filter(el => el.id !== hit.elementId));
                setSelectedElementId(null);
                return;
            }
            if(element.type === 'text' && e.detail === 2) { // Double click
                onTextSelect(element as TextElement);
            }

            setInteraction({ type: hit.type, elementId: hit.elementId, startPoint: point, startElementState: element });
        } else {
            setSelectedElementId(null);
            if (!isImageLocked) {
                setIsPanning(true);
                setPanStart({ x: point.x - imagePosition.x, y: point.y - imagePosition.y });
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const point = getCanvasPoint(e);
        if (interaction) {
            const { type, elementId, startPoint, startElementState } = interaction;
            const dx = point.x - startPoint.x;
            const dy = point.y - startPoint.y;

            setElements(prev => prev.map(el => {
                if (el.id !== elementId) return el;
                let newEl = { ...el };
                switch (type) {
                    case 'drag': {
                        let newX = startElementState.x + dx;
                        let newY = startElementState.y + dy;

                        // Clamp position to canvas boundaries (ignoring rotation for simplicity)
                        const halfW = (newEl.width * newEl.scale) / 2;
                        const halfH = (newEl.height * newEl.scale) / 2;
                        newEl.x = Math.max(halfW, Math.min(CANVAS_WIDTH - halfW, newX));
                        newEl.y = Math.max(halfH, Math.min(CANVAS_HEIGHT - halfH, newY));

                        // Snapping
                        const snapThreshold = 10;
                        const vGuide = Math.abs(newEl.x - CANVAS_WIDTH/2) < snapThreshold;
                        const hGuide = Math.abs(newEl.y - CANVAS_HEIGHT/2) < snapThreshold;
                        setShowGuides({ v: vGuide, h: hGuide });
                        
                        if (vGuide) newEl.x = CANVAS_WIDTH/2;
                        if (hGuide) newEl.y = CANVAS_HEIGHT/2;
                        break;
                    }
                    case 'resize': {
                        const initialDist = Math.hypot(startPoint.x - el.x, startPoint.y - el.y);
                        const currentDist = Math.hypot(point.x - el.x, point.y - el.y);
                        const scaleFactor = currentDist / initialDist;
                        newEl.scale = startElementState.scale * scaleFactor;
                        break;
                    }
                    case 'rotate': {
                        const startAngle = Math.atan2(startPoint.y - el.y, startPoint.x - el.x);
                        const currentAngle = Math.atan2(point.y - el.y, point.x - el.x);
                        const angleDiff = (currentAngle - startAngle) * 180 / Math.PI;
                        newEl.rotation = startElementState.rotation + angleDiff;
                        break;
                    }
                }
                return newEl;
            }));
        } else if (isPanning && !isImageLocked) {
            setImagePosition({ x: point.x - panStart.x, y: point.y - panStart.y });
        }
    };

    const handleMouseUp = () => {
        setInteraction(null);
        setIsPanning(false);
        setShowGuides({ h: false, v: false });
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
      // Logic for drop is in App.tsx to handle initial state. This is just for canvas.
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow drop
    };

    return (
        <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }} onDragOver={handleDragOver} onDrop={handleDrop}>
            <canvas ref={imageCanvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="absolute top-0 left-0 bg-gray-900" />
            <canvas ref={uiCanvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="absolute top-0 left-0"
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            />
        </div>
    );
};

export default CanvasWorkspace;