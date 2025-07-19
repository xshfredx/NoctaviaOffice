import React, { useState, useCallback, useEffect } from 'react';
import ThreeDScene from './components/ThreeDScene';
import IntroScreen from './components/IntroScreen';
import OsTopBar from './components/OsTopBar';
import Desktop from './components/Desktop';
import AppWindow from './components/AppWindow';
import MemetaviaEditor from './components/MemetaviaEditor';
import { MusicPlayerProvider } from './components/MusicPlayerContext';
import MusicPlayer from './components/MusicPlayer';
import Calculator from './components/Calculator';
import SnakeGame from './components/SnakeGame';
import SystemInfoPanel from './components/SystemInfoPanel';
import Browser from './components/Browser';
import DexTerm from './components/DexTerm';

type AppName = 'memetavia' | 'audiowarp' | 'calculator' | 'snake' | 'browser' | 'dexterm';
type Screen = 'threed' | 'intro' | 'desktop' | AppName;
type DesktopBg = 'default' | 'matrix' | 'sunset';

const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('threed');
    const [isSystemInfoVisible, setIsSystemInfoVisible] = useState(false);
    const [desktopBg, setDesktopBg] = useState<DesktopBg>('default');

    const handleTransitionEnd = useCallback(() => {
        setCurrentScreen('intro');
    }, []);

    const handleEnterDesktop = useCallback(() => {
        setCurrentScreen('desktop');
    }, []);

    const handleLaunchApp = useCallback((appName: AppName) => {
        setCurrentScreen(appName);
    }, []);
    
    const handleCloseApp = useCallback(() => {
        setCurrentScreen('desktop');
    }, []);
    
    const toggleSystemInfo = useCallback(() => {
        setIsSystemInfoVisible(prev => !prev);
    }, []);

    const changeDesktopBg = useCallback(() => {
        setDesktopBg(prev => {
            const bgs: DesktopBg[] = ['default', 'matrix', 'sunset'];
            const currentIndex = bgs.indexOf(prev);
            return bgs[(currentIndex + 1) % bgs.length];
        });
    }, []);

    useEffect(() => {
        if (currentScreen === 'threed') {
            document.body.classList.remove('os-active');
        } else {
            document.body.classList.add('os-active');
            if (desktopBg === 'default') {
                document.body.style.backgroundColor = '#0c0c0c';
            } else if (desktopBg === 'matrix') {
                document.body.style.backgroundColor = '#0d2314';
            } else if (desktopBg === 'sunset') {
                document.body.style.backgroundColor = '#2c1524';
            }
        }
    }, [currentScreen, desktopBg]);

    if (currentScreen === 'threed') {
        return <ThreeDScene onTransitionEnd={handleTransitionEnd} />;
    }

    if (currentScreen === 'intro') {
        return <IntroScreen onEnter={handleEnterDesktop} />;
    }

    return (
        <MusicPlayerProvider>
            <div className="w-screen h-screen flex flex-col bg-transparent">
                <OsTopBar onTitleClick={toggleSystemInfo} />
                <main className="flex-grow relative overflow-hidden">
                    {currentScreen === 'desktop' && (
                        <Desktop 
                            onLaunchApp={handleLaunchApp}
                            onShowSystemInfo={toggleSystemInfo}
                            onChangeBackground={changeDesktopBg}
                        />
                    )}
                    {currentScreen === 'memetavia' && (
                        <AppWindow title="memetavia.exe" onClose={handleCloseApp}>
                            <MemetaviaEditor />
                        </AppWindow>
                    )}
                    {currentScreen === 'audiowarp' && (
                        <AppWindow title="audiowarp.exe" onClose={handleCloseApp}>
                            <MusicPlayer />
                        </AppWindow>
                    )}
                     {currentScreen === 'calculator' && (
                        <AppWindow title="calc.exe" onClose={handleCloseApp}>
                            <Calculator />
                        </AppWindow>
                    )}
                    {currentScreen === 'snake' && (
                        <AppWindow title="snake.exe" onClose={handleCloseApp} width={440} height={520}>
                            <SnakeGame />
                        </AppWindow>
                    )}
                    {currentScreen === 'browser' && (
                        <AppWindow title="googlavia.exe" onClose={handleCloseApp}>
                            <Browser />
                        </AppWindow>
                    )}
                    {currentScreen === 'dexterm' && (
                        <AppWindow title="dexterm.exe" onClose={handleCloseApp} width={800} height={600}>
                            <DexTerm />
                        </AppWindow>
                    )}
                     <SystemInfoPanel isVisible={isSystemInfoVisible} onClose={toggleSystemInfo} />
                </main>
            </div>
        </MusicPlayerProvider>
    );
};

export default App;