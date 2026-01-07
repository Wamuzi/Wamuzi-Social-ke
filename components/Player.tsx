import React, { useState, useEffect, useRef } from 'react';
import { radioService } from '../services/radioService';
import { userService } from '../services/userService';
import { RadioState, Song, User } from '../types';
import { PlayIcon, PauseIcon, VolumeUpIcon, ShareIcon, UsersIcon, SearchIcon, MusicNoteIcon } from './icons/Icons';
import SongRequest from './SongRequest';
import SocialShare from './SocialShare';
import { ViewState } from '../App';

const ClipIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.25.9-2.25 2.25v15c0 1.125.9 2.25 2.25 2.25h11.25c1.125 0 2.25-.9 2.25-2.25v-4.5M10.125 2.25c.375 0 .75.056 1.125.162M10.125 2.25a2.25 2.25 0 0 0-2.25 2.25M15 2.25a2.25 2.25 0 0 1 2.25 2.25m-2.25-2.25a2.25 2.25 0 0 0-2.25 2.25M15 2.25c.375 0 .75.056 1.125.162m-2.25 0a2.25 2.25 0 0 0-2.25 2.25m0 13.5c-1.125 0-2.25-.9-2.25-2.25M17.25 10.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);

const MusicCarousel: React.FC<{ title: string; songs: Song[]; setView: (vs: ViewState) => void; }> = ({ title, songs, setView }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {songs.map(song => (
                <div key={song.id} className="flex-shrink-0 w-32 text-left group">
                    <div className="relative">
                        <img src={song.albumArt} alt={song.title} className="w-32 h-32 rounded-lg object-cover shadow-md" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <button onClick={() => radioService.playSongFromLibrary(song)} className="text-white p-2">
                                <PlayIcon className="w-8 h-8"/>
                            </button>
                        </div>
                    </div>
                    <p className="font-semibold text-sm mt-2 truncate">{song.title}</p>
                    <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    <button onClick={() => setView({ view: 'feed', data: { preAttachedSong: song } })} className="mt-1 text-xs font-semibold text-brand-blue hover:underline">
                        Use Sound
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const ArtistCarousel: React.FC<{ title: string; artists: User[]; setView: (vs: ViewState) => void; }> = ({ title, artists, setView }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {artists.map(artist => (
                <button
                    key={artist.id}
                    onClick={() => setView({ view: 'profile', data: { userId: artist.id } })}
                    className="flex-shrink-0 w-32 text-center group"
                >
                    <img src={artist.avatarUrl} alt={artist.name} className="w-32 h-32 rounded-full object-cover shadow-md group-hover:opacity-80 transition-opacity" />
                    <p className="font-semibold text-sm mt-2 truncate">{artist.name}</p>
                </button>
            ))}
        </div>
    </div>
);


const BrowseMusic: React.FC<{ setView: (vs: ViewState) => void; }> = ({ setView }) => {
    const [radioState, setRadioState] = useState(radioService.getState());
    const [searchTerm, setSearchTerm] = useState('');
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [trendingArtists, setTrendingArtists] = useState<User[]>([]);
    const [categories, setCategories] = useState<string[]>([]);


    useEffect(() => {
        const sub = (state: RadioState) => {
            setRadioState(state);
            setTrendingSongs(radioService.getTrendingSongs());
            setTrendingArtists(userService.getTrendingArtists());
            setCategories(radioService.getMusicCategories());
        };
        radioService.subscribe(sub);
        // Initial fetch
        setTrendingSongs(radioService.getTrendingSongs());
        setTrendingArtists(userService.getTrendingArtists());
        setCategories(radioService.getMusicCategories());


        return () => radioService.unsubscribe(sub);
    }, []);

    const filteredMusic = searchTerm ? radioState.musicLibrary.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="bg-white rounded-lg p-4">
            <div className="relative mb-4">
                 <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input
                    type="text"
                    placeholder="Search for songs or artists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
            </div>

            {searchTerm ? (
                 <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredMusic.map(song => (
                        <div key={song.id} className="w-full flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-gray-100">
                            <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                            <div className="overflow-hidden">
                                <p className="font-semibold truncate">{song.title}</p>
                                <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => radioService.playSongFromLibrary(song)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">
                                    <PlayIcon className="w-5 h-5 text-gray-600" />
                                </button>
                                <button onClick={() => setView({ view: 'feed', data: { preAttachedSong: song } })} className="px-3 py-1.5 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full hover:bg-gray-300 transition">Use</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-h-[28rem] overflow-y-auto">
                    <MusicCarousel title="Trending Now" songs={trendingSongs} setView={setView} />
                    <ArtistCarousel title="Trending Artists" artists={trendingArtists} setView={setView} />
                    {categories.map(category => (
                        <MusicCarousel
                            key={category}
                            title={category}
                            songs={radioService.getSongsByCategory(category)}
                            setView={setView}
                        />
                    ))}
                </div>
            )}
        </div>
    )
};


const Player: React.FC<{ setView: (vs: ViewState) => void }> = ({ setView }) => {
    const [radioState, setRadioState] = useState<RadioState>(radioService.getState());
    const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
    const [isSharePopupVisible, setIsSharePopupVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'radio' | 'browse'>('radio');
    
    const volumeControlRef = useRef<HTMLDivElement>(null);
    const shareControlRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleRadioStateChange = (newState: RadioState) => setRadioState(newState);
        radioService.subscribe(handleRadioStateChange);
        return () => radioService.unsubscribe(handleRadioStateChange);
    }, []);
    
    const currentStation = radioState.stations.find(s => s.id === radioState.currentStationId) || null;

    useEffect(() => {
        const { isPlaying, currentSong } = radioState;
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong?.title || currentStation?.name || 'Wamuzi',
                artist: currentSong?.artist || (currentStation ? 'Live Stream' : 'Media'),
                album: currentStation?.name || 'Wamuzi',
                artwork: [{ src: currentSong?.albumArt || currentStation?.logoUrl || 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png', sizes: '512x512', type: 'image/png' }],
            });
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
            navigator.mediaSession.setActionHandler('play', () => radioService.togglePlay());
            navigator.mediaSession.setActionHandler('pause', () => radioService.togglePlay());
        }
        return () => {
             if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
             }
        }
    }, [radioState.isPlaying, radioState.currentSong, currentStation]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) setIsVolumeSliderVisible(false);
            if (shareControlRef.current && !shareControlRef.current.contains(event.target as Node)) setIsSharePopupVisible(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const { isPlaying, currentSong, playbackPosition, volume } = radioState;
    const progress = currentSong ? (playbackPosition / currentSong.duration) * 100 : 0;
    const shareText = currentSong ? `Listening to ${currentSong.title} by ${currentSong.artist} on Wamuzi!` : (currentStation ? `Tuning in to ${currentStation.name} on Wamuzi!` : "Tuning in to Wamuzi Media!");

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const TabButton: React.FC<{tab: 'radio' | 'browse', label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`w-1/2 p-3 font-semibold text-center transition-colors ${activeTab === tab ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:bg-gray-100'}`}>
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-4 md:p-8 flex-grow">
                <div className="md:col-span-2 flex flex-col items-center gap-6">
                     <div className="w-full max-w-md aspect-square p-2 rounded-2xl bg-gray-100 shadow-xl shadow-brand-blue/20">
                        <div className={`relative w-full h-full rounded-xl overflow-hidden transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
                            <img src={currentSong?.albumArt || currentStation?.logoUrl || 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png'} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-black/50 transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-2 h-5">
                           {isPlaying && currentStation && (
                                <>
                                    <div className="flex items-center gap-1.5 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>LIVE
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold"><UsersIcon className="w-4 h-4" /><span>{radioState.listeners.toLocaleString()}</span></div>
                                </>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold font-orbitron text-gray-900">{currentSong?.title || currentStation?.name || 'Select Music'}</h2>
                        <p className="text-lg text-brand-blue">{currentSong?.artist || (currentStation ? 'Live Stream' : 'Wamuzi Player')}</p>
                    </div>
                    
                    {currentSong && (
                        <div className="w-full max-w-md">
                            <div className="relative h-2 bg-gray-200 rounded-full"><div className="absolute top-0 left-0 h-full bg-brand-blue rounded-full" style={{ width: `${progress}%` }}></div></div>
                            <div className="flex justify-between text-sm text-gray-500 mt-1"><span>{formatTime(playbackPosition)}</span><span>{formatTime(currentSong.duration)}</span></div>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-6 w-full max-w-xs">
                        <div className="relative" ref={volumeControlRef}>
                            <button onClick={() => setIsVolumeSliderVisible(!isVolumeSliderVisible)} className="p-3 text-gray-500 hover:text-brand-blue transition rounded-full hover:bg-gray-100" aria-label="Volume"><VolumeUpIcon className="w-6 h-6" /></button>
                            {isVolumeSliderVisible && <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-2 bg-white/80 backdrop-blur-sm shadow-xl rounded-lg flex justify-center items-center h-32 w-12"><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => radioService.setVolume(parseFloat(e.target.value))} className="w-24 appearance-none origin-center transform -rotate-90 cursor-pointer" /></div>}
                        </div>
                         <button onClick={() => alert('Feature coming soon! This will clip the last 30s of the radio broadcast for a post.')} className="p-3 text-gray-500 hover:text-brand-blue transition rounded-full hover:bg-gray-100" aria-label="Clip Audio">
                           <ClipIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => radioService.togglePlay()} className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400" aria-label={isPlaying ? 'Pause' : 'Play'} disabled={!currentSong && !currentStation} >{isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}</button>
                        <div className="relative" ref={shareControlRef}>
                            <button onClick={() => setIsSharePopupVisible(!isSharePopupVisible)} className="p-3 text-gray-500 hover:text-brand-blue transition rounded-full hover:bg-gray-100" aria-label="Share"><ShareIcon className="w-6 h-6" /></button>
                            {isSharePopupVisible && <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-3 bg-white/80 backdrop-blur-sm shadow-xl rounded-lg"><SocialShare shareText={shareText} isPopupVersion={true} /></div>}
                        </div>
                    </div>
                    <div className="w-full max-w-md pt-4 space-y-4">{currentStation?.isPlaylistBased && <SongRequest />}</div>
                </div>

                <div className="md:col-span-1 bg-white shadow-md rounded-lg h-fit">
                    <div className="flex border-b">
                        <TabButton tab="radio" label="Live Radio"/>
                        <TabButton tab="browse" label="Browse Music"/>
                    </div>
                    {activeTab === 'radio' ? (
                        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                            {radioState.stations.map(station => (
                                <button key={station.id} onClick={() => radioService.switchStation(station.id)} className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${radioState.currentStationId === station.id ? 'bg-brand-blue text-white' : 'hover:bg-gray-100'}`}>
                                    <img src={station.logoUrl} alt={station.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                    <span>{station.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <BrowseMusic setView={setView} />
                    )}
                </div>
            </div>
             <footer className="text-center p-4 text-xs text-gray-500">
                Wamuzi Media &copy; 2024 - All Rights Reserved.
            </footer>
        </div>
    );
};

export default Player;