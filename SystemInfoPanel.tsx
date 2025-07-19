import React, { useState, useEffect } from 'react';
import DraggablePanel from './DraggablePanel';

interface SystemInfoPanelProps {
    isVisible: boolean;
    onClose: () => void;
}

const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({ isVisible, onClose }) => {
    const [systemInfo, setSystemInfo] = useState({ os: 'N/A', browser: 'N/A', ip: '127.0.0.1' });

    useEffect(() => {
        const ua = navigator.userAgent;
        let os = 'Unknown OS';
        if (ua.includes("Win")) os = "Windows";
        if (ua.includes("Mac")) os = "MacOS";
        if (ua.includes("Linux")) os = "Linux";
        if (ua.includes("Android")) os = "Android";
        if (ua.includes("like Mac")) os = "iOS";

        let browser = 'Unknown Browser';
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";
        
        setSystemInfo(prev => ({ ...prev, os, browser }));
    }, []);

    return (
        <DraggablePanel title="System Information" isVisible={isVisible} onClose={onClose} initialPosition={{x: 100, y: 100}}>
            <div className="space-y-2 text-orange-400 text-glow">
                <p><strong>OS:</strong> {systemInfo.os}</p>
                <p><strong>Browser:</strong> {systemInfo.browser}</p>
                <p><strong>Network Addr:</strong> {systemInfo.ip} (local)</p>
                <div className="my-2 pt-2 border-t border-orange-800"></div>
                <p>Coded with <span className="text-red-500 animate-pulse">&lt;3</span> by @shfred</p>
            </div>
        </DraggablePanel>
    );
};
export default SystemInfoPanel;
