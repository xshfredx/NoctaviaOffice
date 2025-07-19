import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Point } from '../types';

export const useDraggable = <T extends HTMLElement,>(
  initialPosition: Point
): [React.RefObject<T>, Point, React.Dispatch<React.SetStateAction<Point>>, boolean] => {
  const [position, setPosition] = useState<Point>(initialPosition);
  const elementRef = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragInfo = useRef<{ startMouse: Point; startElement: Point } | null>(null);
  const positionRef = useRef(position);
  positionRef.current = position;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragInfo.current) return;

    const dx = e.clientX - dragInfo.current.startMouse.x;
    const dy = e.clientY - dragInfo.current.startMouse.y;

    if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        setIsDragging(true);
    }
    
    setPosition({
      x: dragInfo.current.startElement.x + dx,
      y: dragInfo.current.startElement.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    dragInfo.current = null;
    if (isDragging) {
      setTimeout(() => setIsDragging(false), 0);
    }
  }, [handleMouseMove, isDragging]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const handle = (e.target as HTMLElement).closest('.drag-handle');
    if (!elementRef.current || !handle || !elementRef.current.contains(handle)) {
        return;
    }

    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();
    
    dragInfo.current = {
      startMouse: { x: e.clientX, y: e.clientY },
      startElement: positionRef.current
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
        element.addEventListener('mousedown', handleMouseDown as EventListener);
    }
    return () => {
        if (element) {
            element.removeEventListener('mousedown', handleMouseDown as EventListener);
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return [elementRef, position, setPosition, isDragging];
};