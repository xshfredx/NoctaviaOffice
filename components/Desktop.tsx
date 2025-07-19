import React, { useState, useCallback } from 'react';
import DraggableIcon from './DraggableIcon';
import DesktopContextMenu from './DesktopContextMenu';
import { Point } from '../types';

interface DesktopProps {
    onLaunchApp: (appName: 'memetavia' | 'audiowarp' | 'calculator' | 'snake' | 'browser' | 'dexterm') => void;
    onShowSystemInfo: () => void;
    onChangeBackground: () => void;
}

const ICON_DATA = [
    { appName: 'memetavia', label: 'memetavia.exe', iconChar: 'M' },
    { appName: 'audiowarp', label: 'audiowarp.exe', iconChar: 'A' },
    { appName: 'calculator', label: 'calc.exe', iconChar: 'C' },
    { appName: 'snake', label: 'snake.exe', iconChar: 'S' },
    { appName: 'browser', label: 'googlavia.exe', iconChar: 'G' },
    { appName: 'dexterm', label: 'dexterm.exe', iconChar: 'D' },
] as const;


const Desktop: React.FC<DesktopProps> = ({ onLaunchApp, onShowSystemInfo, onChangeBackground }) => {
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: Point }>({ visible: false, position: { x: 0, y: 0 } });
    const [resetKey, setResetKey] = useState(0);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ visible: true, position: { x: e.clientX, y: e.clientY } });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleOrderIcons = () => {
        setResetKey(prev => prev + 1);
    }
    
    const contextMenuActions = {
        changeBackground: onChangeBackground,
        orderIcons: handleOrderIcons,
        showSystemInfo: onShowSystemInfo
    }

    return (
        <div 
            className="w-full h-full p-4 sm:p-8 relative fade-in"
            onContextMenu={handleContextMenu}
            onClick={handleCloseContextMenu}
        >
            {ICON_DATA.map((icon, index) => (
                <DraggableIcon
                    key={icon.appName}
                    appName={icon.appName}
                    label={icon.label}
                    iconChar={icon.iconChar}
                    initialPosition={{ x: 32, y: 32 + index * 130 }}
                    onLaunchApp={onLaunchApp}
                    resetKey={resetKey}
                />
            ))}

            {contextMenu.visible && (
                <DesktopContextMenu 
                    position={contextMenu.position}
                    onClose={handleCloseContextMenu}
                    actions={contextMenuActions}
                />
            )}
        </div>
    );
};

export default Desktop;
