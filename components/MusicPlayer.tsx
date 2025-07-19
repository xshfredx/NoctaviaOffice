import React from 'react';
import { useMusicPlayer } from './MusicPlayerContext';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(14, 5);
};

const MusicPlayer: React.FC = () => {
  const { 
    playlist, 
    currentTrack, 
    currentTrackIndex, 
    isPlaying, 
    togglePlayPause, 
    playTrack,
    playNext,
    playPrev,
    progress, 
    currentTime, 
    duration,
    seek 
  } = useMusicPlayer();

  return (
    <div className="w-full h-full p-4 flex flex-row items-start justify-center gap-8 bg-black text-orange-500 text-glow">
      
      {/* Left Panel: Now Playing */}
      <div className="w-1/2 flex-grow flex flex-col items-center justify-center p-4 border-r-2 border-orange-800 h-full">
        {currentTrack ? (
          <>
            <div className="w-48 h-48 border-2 border-orange-500 flex items-center justify-center mb-4 bg-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                </svg>
            </div>
            <h2 className="text-3xl text-center font-bold">{currentTrack.title}</h2>
            <h3 className="text-xl text-gray-400 mb-4">{currentTrack.artist}</h3>
            
            <div className="w-full max-w-sm mt-4">
              <div className="flex justify-between text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            <div className="flex items-center gap-8 mt-6">
              <button onClick={playPrev} className="text-4xl hover:text-white transition-colors">«</button>
              <button onClick={togglePlayPause} className="text-6xl hover:text-white transition-colors">
                {isPlaying ? '❚❚' : '►'}
              </button>
              <button onClick={playNext} className="text-4xl hover:text-white transition-colors">»</button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-2xl">Select a song from the playlist</p>
          </div>
        )}
      </div>

      {/* Right Panel: Playlist */}
      <div className="w-1/2 flex-grow flex flex-col h-full overflow-y-auto">
        <h2 className="text-2xl uppercase tracking-widest border-b-2 border-orange-500 pb-2 mb-2">Playlist</h2>
        <ul className="space-y-1">
          {playlist.map((track, index) => (
            <li key={track.id}>
              <button
                onClick={() => playTrack(index)}
                className={`w-full text-left p-2 border border-transparent hover:border-orange-500 hover:bg-orange-900/50 transition-all ${index === currentTrackIndex ? 'bg-orange-500 text-black' : ''}`}
              >
                <p className="font-bold">{track.title}</p>
                <p className={`${index === currentTrackIndex ? 'text-gray-800' : 'text-gray-400'}`}>{track.artist}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MusicPlayer;
