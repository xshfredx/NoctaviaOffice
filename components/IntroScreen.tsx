
import React, { useState, useEffect, useRef } from 'react';

const bootSequence = [
    "NOCTAVIA OS v1.0 Initializing...",
    "Booting kernel...",
    "[OK] GPU Driver: NVD-GL-3080",
    "[OK] Storage Driver: NVMe-FusionIO",
    "Starting core services...",
    "[OK] System Logger",
    "[OK] Authentication Service",
    "Mounting file systems...",
    "Launching UI Shell...",
    "Welcome to Noctavia OS.",
];

const IntroScreen: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
    const [bootLines, setBootLines] = useState<string[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let i = 0;
        const bootInterval = setInterval(() => {
            if (i < bootSequence.length) {
                setBootLines(prev => [...prev, bootSequence[i]]);
                i++;
            } else {
                clearInterval(bootInterval);
                const desktopTimer = setTimeout(onEnter, 800);
                return () => clearTimeout(desktopTimer);
            }
        }, 120);
        return () => clearInterval(bootInterval);
    }, [onEnter]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [bootLines]);


    return (
        <div 
            className="w-screen h-screen bg-transparent flex flex-col items-center justify-center p-4 sm:p-8"
        >
             <div ref={scrollContainerRef} className="w-full max-w-5xl h-full border-2 border-orange-500 p-4 text-lg sm:text-xl overflow-y-auto fade-in">
                {bootLines.map((line, index) => (
                    <p key={index} className="text-glow whitespace-pre-wrap leading-tight">
                        <span className="text-green-500 mr-2">&gt;</span>{line}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default IntroScreen;
