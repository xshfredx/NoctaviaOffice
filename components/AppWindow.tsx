
import React from 'react';

interface AppWindowProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    width?: number;
    height?: number;
}

const AppWindow: React.FC<AppWindowProps> = ({ title, children, onClose, width, height }) => {
    const style: React.CSSProperties = {
        maxWidth: width ? `${width}px` : '64rem', // 1024px or 7xl
        width: '100%',
    };
    if (height) {
        style.height = `${height}px`;
    } else {
        style.maxHeight = 'calc(100vh - 80px)';
        style.height = '100%';
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-4 fade-in">
            <div className="bg-black border-2 border-orange-500 flex flex-col" style={style}>
                <div className="bg-black p-2 border-b-2 border-orange-500 flex justify-between items-center flex-shrink-0">
                    <h3 className="font-bold text-base text-orange-500 uppercase select-none tracking-widest text-glow">{title}</h3>
                    <button onClick={onClose} className="bg-red-600 text-black w-6 h-6 flex items-center justify-center font-bold text-lg hover:bg-red-400 focus:outline-none">&times;</button>
                </div>
                <div className="flex-grow relative overflow-auto bg-black">
                     {children}
                </div>
            </div>
        </div>
    );
};

export default AppWindow;
