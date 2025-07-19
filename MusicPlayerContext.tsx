import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

export interface AudioTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
}

interface MusicPlayerContextType {
    playlist: AudioTrack[];
    currentTrack: AudioTrack | null;
    currentTrackIndex: number | null;
    isPlaying: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    playTrack: (index: number) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrev: () => void;
    seek: (time: number) => void;
    isMuted: boolean;
    toggleMute: () => void;
    stopTrack: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const PLAYLIST: AudioTrack[] = [
    { id: '1', title: 'Extra', artist: 'Ken Ishii', url: 'https://res.cloudinary.com/dllan8m2n/video/upload/v1752918894/Ken_Ishii_-_Extra_aaugqc.m4a' },
    { id: '2', title: 'Plastic Love (Synthwave Remix)', artist: 'Mariya Takeuchi', url: 'https://res.cloudinary.com/dllan8m2n/video/upload/v1752918890/Plastic_Love_cyberpunk_synthwave_remix_qi3olw.m4a' },
    { id: '3', title: 'Do You Remember Love', artist: 'SUPER RISER!', url: 'https://res.cloudinary.com/dllan8m2n/video/upload/v1752918886/AMV_SUPER_RISER_Do_You_Remember_Love_1_e6mvax.m4a' },
    { id: '4', title: 'Welcome to the Disco', artist: 'Yung Bae ft. Macross 82-99', url: 'https://res.cloudinary.com/dllan8m2n/video/upload/v1752918883/Yung_Bae_-_Welcome_to_the_Disco_feat._Macross_82-99_klrre0.m4a' },
    { id: '5', title: 'Thank You (Thunderstorm Remix)', artist: 'Dido', url: 'https://res.cloudinary.com/dllan8m2n/video/upload/v1752918883/Dido_-_Thank_You_Thunderstorm_Remix_Louder_ueou1z.m4a' }
];

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playlist] = useState<AudioTrack[]>(PLAYLIST);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const playNext = useCallback(() => {
        if (playlist.length > 0) {
            const nextIndex = currentTrackIndex === null ? 0 : (currentTrackIndex + 1) % playlist.length;
            setCurrentTrackIndex(nextIndex);
        }
    }, [currentTrackIndex, playlist.length]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => setDuration(audio.duration);
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => playNext();
        const handleVolumeChange = () => setIsMuted(audio.muted);

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('volumechange', handleVolumeChange);

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('volumechange', handleVolumeChange);
        };
    }, [playNext]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio && currentTrackIndex !== null) {
            const track = playlist[currentTrackIndex];
            if (track && audio.src !== track.url) {
                audio.src = track.url;
            }
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
    }, [currentTrackIndex, playlist]);


    const playTrack = useCallback((index: number) => {
        if (index === currentTrackIndex) {
            togglePlayPause();
        } else {
            setCurrentTrackIndex(index);
        }
    }, [currentTrackIndex]);
    
    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || currentTrackIndex === null) return;
        
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
    }, [isPlaying, currentTrackIndex]);
    
    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.muted = !audio.muted;
        }
    }, []);

    const stopTrack = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.src = ''; // Detach the source
        }
        setIsPlaying(false);
        setCurrentTrackIndex(null);
        setCurrentTime(0);
        setDuration(0);
    }, []);

    const playPrev = useCallback(() => {
        if (playlist.length > 0) {
            const prevIndex = currentTrackIndex === null ? playlist.length - 1 : (currentTrackIndex - 1 + playlist.length) % playlist.length;
            setCurrentTrackIndex(prevIndex);
        }
    }, [currentTrackIndex, playlist.length]);

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };
    
    const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;
    const progress = duration > 0 ? currentTime / duration : 0;

    const value = { playlist, currentTrack, currentTrackIndex, isPlaying, progress, currentTime, duration, playTrack, togglePlayPause, playNext, playPrev, seek, isMuted, toggleMute, stopTrack };

    return (
        <MusicPlayerContext.Provider value={value}>
            <audio ref={audioRef} crossOrigin="anonymous"></audio>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
    const context = useContext(MusicPlayerContext);
    if (context === undefined) {
        throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
    }
    return context;
};