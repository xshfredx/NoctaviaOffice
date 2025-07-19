import React, { useState, useEffect } from 'react';
import MusicPlayerWidget from './MusicPlayerWidget';

interface OsTopBarProps {
    onTitleClick: () => void;
}

const OsTopBar: React.FC<OsTopBarProps> = ({ onTitleClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <header className="w-full bg-black border-b-2 border-orange-500 p-1 flex justify-between items-center z-50 flex-shrink-0">
            <button onClick={onTitleClick} className="text-lg font-bold text-orange-500 uppercase tracking-wider text-glow px-2 flex-shrink-0 hover:bg-orange-500 hover:text-black transition-colors duration-200">
                Noctavia OS V 1.0
            </button>
            <div className="flex-grow flex-shrink min-w-0 mx-4 flex justify-start">
                <MusicPlayerWidget />
            </div>
            <div className="flex items-center space-x-3 px-2 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 text-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.556A5.5 5.5 0 0112 15a5.5 5.5 0 013.889 1.556" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.889 13.222A9.5 9.5 0 0112 11a9.5 9.5 0 017.111 2.222" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1.667 9.889A13.5 13.5 0 0112 7a13.5 13.5 0 0110.333 2.889" />
                </svg>
                <span className="text-sm text-orange-500 text-glow">{formatDate(currentTime)}</span>
                <span className="text-sm text-orange-500 text-glow font-bold">{formatTime(currentTime)}</span>
            </div>
        </header>
    );
};

export default OsTopBar;