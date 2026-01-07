import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { radioService } from '../services/radioService';
import { PlayIcon, PauseIcon } from './icons/Icons';

interface AttachedSongPlayerProps {
    song: Song;
}

const AttachedSongPlayer: React.FC<AttachedSongPlayerProps> = ({ song }) => {
    const [radioState, setRadioState] = useState(radioService.getState());

    useEffect(() => {
        const sub = (state: any) => setRadioState(state);
        radioService.subscribe(sub);
        return () => radioService.unsubscribe(sub);
    }, []);

    const isThisSongPlaying = radioState.currentSong?.id === song.id && radioState.isPlaying;

    const handlePlayClick = () => {
        if (isThisSongPlaying) {
            radioService.togglePlay();
        } else {
            radioService.playSongFromLibrary(song);
        }
    };

    return (
        <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <img src={song.albumArt} alt={song.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate">{song.title}</p>
                <p className="text-sm text-gray-500 truncate">{song.artist}</p>
            </div>
            <button onClick={handlePlayClick} className="p-3 bg-brand-blue text-white rounded-full hover:bg-blue-500 transition">
                {isThisSongPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};

export default AttachedSongPlayer;
