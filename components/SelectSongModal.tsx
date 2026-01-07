import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { radioService } from '../services/radioService';
import { XIcon, SearchIcon } from './icons/Icons';

interface SelectSongModalProps {
    onSelect: (song: Song) => void;
    onClose: () => void;
}

const SelectSongModal: React.FC<SelectSongModalProps> = ({ onSelect, onClose }) => {
    const [musicLibrary, setMusicLibrary] = useState(radioService.getState().musicLibrary);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const sub = (state: { musicLibrary: Song[] }) => setMusicLibrary(state.musicLibrary);
        radioService.subscribe(sub);
        return () => radioService.unsubscribe(sub);
    }, []);

    const filteredMusic = musicLibrary.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Attach a Song</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-4 border-b">
                     <div className="relative">
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search for a song..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-2">
                    {filteredMusic.map(song => (
                        <div key={song.id} onClick={() => onSelect(song)} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold">{song.title}</p>
                                <p className="text-sm text-gray-500">{song.artist}</p>
                            </div>
                        </div>
                    ))}
                     {filteredMusic.length === 0 && <p className="text-center text-gray-500 p-8">No songs found.</p>}
                </div>
            </div>
        </div>
    );
};

export default SelectSongModal;
