import React, { useEffect } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { Point } from '../types';

type AppName = 'memetavia' | 'audiowarp' | 'calculator' | 'snake' | 'browser' | 'dexterm';

interface DraggableIconProps {
    appName: AppName;
    label: string;
    iconChar: string;
    initialPosition: Point;
    onLaunchApp: (appName: AppName) => void;
    resetKey: number;
}

const DraggableIcon: React.FC<DraggableIconProps> = ({ appName, label, iconChar, initialPosition, onLaunchApp, resetKey }) => {
    const [iconRef, position, setPosition, isDragging] = useDraggable<HTMLDivElement>(initialPosition);

    useEffect(() => {
        setPosition(initialPosition);
    }, [resetKey, initialPosition, setPosition]);

    const handleClick = () => {
        if (!isDragging) {
            onLaunchApp(appName);
        }
    };
    
    return (
        <div 
            ref={iconRef} 
            className="absolute flex flex-col items-center gap-2 text-orange-500 hover:bg-orange-500 hover:text-black p-2 transition-colors duration-150 focus:outline-none focus:bg-orange-500 focus:text-black drag-handle cursor-grab"
            style={{ top: position.y, left: position.x, touchAction: 'none' }}
            onClick={handleClick}
            aria-label={`Launch ${label}`}
            onContextMenu={(e) => e.stopPropagation()} // Prevent desktop context menu from opening on icon
        >
            <div className="w-20 h-20 border-2 border-current flex items-center justify-center bg-black pointer-events-none">
                <span className="text-5xl font-bold text-glow pointer-events-none">{iconChar}</span>
            </div>
            <span className="text-glow pointer-events-none">{label}</span>
        </div>
    );
};

export default DraggableIcon;
