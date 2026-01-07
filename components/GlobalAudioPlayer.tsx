import React, { useState, useEffect, useRef } from 'react';
import { radioService } from '../services/radioService';
import { RadioState } from '../types';

const GlobalAudioPlayer: React.FC = () => {
    const [radioState, setRadioState] = useState<RadioState>(radioService.getState());
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const handleRadioStateChange = (newState: RadioState) => {
            setRadioState(newState);
        };
        radioService.subscribe(handleRadioStateChange);
        return () => radioService.unsubscribe(handleRadioStateChange);
    }, []);

    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;
        
        const currentStation = radioState.stations.find(s => s.id === radioState.currentStationId);
        const isPlayingOnDemand = radioState.currentSong && !radioState.currentStationId;

        let shouldPlay = radioState.isPlaying;
        let sourceUrl = '';
        
        if (isPlayingOnDemand && radioState.currentSong?.url) {
            sourceUrl = radioState.currentSong.url;
        } else if (currentStation && !currentStation.isPlaylistBased) {
            sourceUrl = currentStation.streamUrl;
        } else {
            // Playlist-based station has no audio source, playback is simulated.
            // Or there is no current song/station.
            shouldPlay = false;
        }

        const managePlayback = async () => {
            // If source is different, update it
            if (audioEl.src !== sourceUrl) {
                audioEl.src = sourceUrl;
                // If there's no source, just pause and return
                if (!sourceUrl) {
                    audioEl.pause();
                    return;
                }
            }

            // Now manage play/pause state
            if (shouldPlay && audioEl.paused) {
                try {
                    await audioEl.play();
                } catch (e) {
                    // This error is expected if the user hasn't interacted with the page yet.
                    // Or if a play() is interrupted. We log it but don't crash.
                    if ((e as DOMException).name !== 'AbortError') {
                        console.error("Audio play failed:", e);
                    }
                }
            } else if (!shouldPlay && !audioEl.paused) {
                audioEl.pause();
            }
        };

        managePlayback();

    }, [radioState.isPlaying, radioState.currentStationId, radioState.currentSong]);

    // Volume effect
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = radioState.volume;
        }
    }, [radioState.volume]);

    return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default GlobalAudioPlayer;
