import React, { useState, useEffect } from 'react';
import { radioService } from '../services/radioService';
import { RadioState } from '../types';
import { PlayIcon, PauseIcon } from './icons/Icons';
import { ViewState } from '../App';

interface MiniPlayerProps {
    setView: (vs: ViewState) => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ setView }) => {
    const [radioState, setRadioState] = useState<RadioState>(radioService.getState());

    useEffect(() => {
        const sub = (state: RadioState) => setRadioState(state);
        radioService.subscribe(sub);
        return () => radioService.unsubscribe(sub);
    }, []);

    const { isPlaying, currentSong, playbackPosition } = radioState;
    const currentStation = radioState.stations.find(s => s.id === radioState.currentStationId);
    
    const progress = currentSong ? (playbackPosition / currentSong.duration) * 100 : 0;

    if (!isPlaying || (!currentSong && !currentStation)) {
        return null;
    }
    
    const displayTitle = currentSong?.title || currentStation?.name || 'Wamuzi Radio';
    const displayArtist = currentSong?.artist || (currentStation ? 'Live Stream' : '');
    const displayArt = currentSong?.albumArt || currentStation?.logoUrl || 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png';

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-30">
            <div 
                className="relative h-1 bg-gray-200 cursor-pointer"
                onClick={() => setView({ view: 'player' })}
            >
                <div className="absolute top-0 left-0 h-full bg-brand-blue" style={{ width: currentSong ? `${progress}%` : '100%' }}></div>
            </div>
            <div className="flex items-center justify-between p-2">
                <div 
                    className="flex items-center gap-3 overflow-hidden cursor-pointer flex-grow"
                    onClick={() => setView({ view: 'player' })}
                >
                    <img src={displayArt} alt={displayTitle} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{displayTitle}</p>
                        <p className="text-xs text-gray-500 truncate">{displayArtist}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        radioService.togglePlay();
                    }}
                    className="p-3 text-brand-blue flex-shrink-0"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                </button>
            </div>
        </div>
    );
};

export default MiniPlayer;