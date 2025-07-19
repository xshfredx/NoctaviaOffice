import React from 'react';
import { Point } from '../types';

interface DesktopContextMenuProps {
    position: Point;
    onClose: () => void;
    actions: {
        changeBackground: () => void;
        orderIcons: () => void;
        showSystemInfo: () => void;
    }
}

const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({ position, onClose, actions }) => {
    const menuItemStyle = "block w-full text-left px-4 py-2 text-sm text-orange-500 hover:bg-orange-500 hover:text-black uppercase text-glow transition-colors duration-150";

    const handleAction = (action: () => void) => {
        action();
        onClose();
    }
    
    // This component will be rendered inside the desktop, which handles closing on click
    return (
        <div 
            className="absolute bg-black border-2 border-orange-500 py-1 w-56 z-50 fade-in"
            style={{ top: position.y, left: position.x }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
        >
            <button onClick={() => handleAction(actions.changeBackground)} className={menuItemStyle}>Change Background</button>
            <button onClick={() => handleAction(actions.orderIcons)} className={menuItemStyle}>Order Icons by Name</button>
            <div className="my-1 border-t border-orange-800"></div>
            <button onClick={() => handleAction(actions.showSystemInfo)} className={menuItemStyle}>System Info</button>
        </div>
    );
};

export default DesktopContextMenu;
