import React from 'react';
import { useMusicPlayer } from './MusicPlayerContext';

const SoundWave: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
    <div className={`sound-wave flex items-end justify-between w-6 h-5 ${!isPlaying ? 'paused' : ''}`}>
        <span className="w-1 bg-orange-500" style={{ animationDelay: '0s' }}></span>
        <span className="w-1 bg-orange-500" style={{ animationDelay: '-0.8s' }}></span>
        <span className="w-1 bg-orange-500" style={{ animationDelay: '-0.4s' }}></span>
        <span className="w-1 bg-orange-500" style={{ animationDelay: '-1.0s' }}></span>
    </div>
);

const MuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l-4-4m0 4l4-4" />
    </svg>
);

const UnmuteIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);


const MusicPlayerWidget: React.FC = () => {
    const { isPlaying, currentTrack, togglePlayPause, stopTrack, isMuted, toggleMute } = useMusicPlayer();

    if (!currentTrack) {
        return null;
    }

    return (
        <div className="max-w-xs w-full flex items-center gap-3 border border-orange-800 bg-black bg-opacity-50 p-1 text-sm rounded-sm">
            <SoundWave isPlaying={isPlaying} />
            <button onClick={togglePlayPause} className="text-orange-500 hover:text-white text-lg leading-none flex-shrink-0">
                {isPlaying ? '❚❚' : '►'}
            </button>
            <div className={`flex-grow min-w-0 marquee ${!isPlaying && 'paused'}`}>
                <span className="text-glow text-orange-400">{currentTrack.title}</span>
            </div>
            <button onClick={toggleMute} className="text-orange-500 hover:text-white flex-shrink-0">
                {isMuted ? <MuteIcon /> : <UnmuteIcon />}
            </button>
            <button onClick={stopTrack} className="text-orange-500 hover:text-white text-xl font-bold leading-none px-1 flex-shrink-0">
                &times;
            </button>
        </div>
    );
};

export default MusicPlayerWidget;
