import React, { useState, useEffect } from 'react';
import { ArtistApplication, Song } from '../types';
import { userService } from '../services/userService';
import { radioService } from '../services/radioService';
import { XIcon, CheckIcon } from './icons/Icons';

interface ApproveArtistModalProps {
    application: ArtistApplication;
    onClose: () => void;
}

const ApproveArtistModal: React.FC<ApproveArtistModalProps> = ({ application, onClose }) => {
    const [unlinkedSongs, setUnlinkedSongs] = useState<Song[]>([]);
    const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const songs = radioService.getUnlinkedSongsByArtistName(application.user.name);
        setUnlinkedSongs(songs);
    }, [application.user.name]);

    const handleToggleSong = (songId: string) => {
        setSelectedSongIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(songId)) {
                newSet.delete(songId);
            } else {
                newSet.add(songId);
            }
            return newSet;
        });
    };

    const handleApproveAndLink = async () => {
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 500)); // Simulate async
        userService.approveArtistAndLinkMusic(application.id, Array.from(selectedSongIds));
        setIsLoading(false);
        onClose();
    };

    const handleApproveOnly = async () => {
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 500)); // Simulate async
        userService.approveArtistProfile(application.id);
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Approve Artist: {application.user.name}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    {unlinkedSongs.length > 0 ? (
                        <div>
                            <h3 className="font-semibold text-gray-800">Link Music to Profile</h3>
                            <p className="text-sm text-gray-500 mb-2">We found {unlinkedSongs.length} unlinked song(s) in the library matching this artist's name. Select the songs to link to their new artist profile.</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                                {unlinkedSongs.map(song => (
                                    <label key={song.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedSongIds.has(song.id)}
                                            onChange={() => handleToggleSong(song.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                        />
                                        <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-md object-cover" />
                                        <div>
                                            <p className="font-semibold text-sm">{song.title}</p>
                                            <p className="text-xs text-gray-500">{song.artist}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold">No Unlinked Music Found</p>
                            <p className="text-sm text-gray-500">No songs matching "{application.user.name}" were found in the library waiting to be linked.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                    <button onClick={handleApproveOnly} disabled={isLoading} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-semibold text-sm hover:bg-blue-200">Approve Only</button>
                    <button onClick={handleApproveAndLink} disabled={isLoading || selectedSongIds.size === 0} className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold text-sm w-48 flex justify-center items-center gap-2 hover:bg-green-700 disabled:bg-gray-400">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><CheckIcon className="w-5 h-5"/> Approve & Link ({selectedSongIds.size})</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveArtistModal;
