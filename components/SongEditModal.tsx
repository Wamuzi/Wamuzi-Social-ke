import React, { useState, useEffect } from 'react';
import { Song, User } from '../types';
import { radioService } from '../services/radioService';
import { userService } from '../services/userService';
import { XIcon } from './icons/Icons';

interface SongEditModalProps {
    song?: Song; // If provided, it's an edit, otherwise it's an add
    onClose: () => void;
}

const SongEditModal: React.FC<SongEditModalProps> = ({ song, onClose }) => {
    const [title, setTitle] = useState(song?.title || '');
    const [artistId, setArtistId] = useState(song?.artistId || '');
    const [albumArt, setAlbumArt] = useState(song?.albumArt || '');
    const [category, setCategory] = useState(song?.category || '');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [artists, setArtists] = useState<User[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const allArtists = userService.getArtists();
        setArtists(allArtists);
        if (!song && allArtists.length > 0) {
            setArtistId(allArtists[0].id);
        } else if (song && song.artistId) {
            setArtistId(song.artistId);
        }
    }, [song]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
            setAudioFile(file);
            setError('');
        } else {
            setError('Please upload a valid MP3 or WAV file.');
            setAudioFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!song && !audioFile) || !title.trim() || !artistId || !albumArt.trim()) {
            setError('Please fill all required fields and upload an audio file for new songs.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const selectedArtist = artists.find(a => a.id === artistId);
            if (!selectedArtist) throw new Error("Selected artist not found");

            if (song) { // Edit mode
                radioService.updateSongInMusicLibrary(song.id, { title, artist: selectedArtist.name, artistId, albumArt, category });
            } else { // Add mode
                const url = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(audioFile!);
                });

                const duration = await new Promise<number>((resolve) => {
                    const audio = new Audio(url);
                    audio.onloadedmetadata = () => resolve(Math.round(audio.duration));
                });
                
                radioService.addSongToMusicLibrary({ title, artist: selectedArtist.name, artistId, albumArt, duration, url, category });
            }
            onClose();
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                     <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{song ? 'Edit Song' : 'Add New Song'}</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Song Title" className="w-full p-2 border rounded" required />
                        <select value={artistId} onChange={e => setArtistId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                            <option value="" disabled>Select an artist</option>
                            {artists.map(artist => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
                        </select>
                        <input value={albumArt} onChange={e => setAlbumArt(e.target.value)} placeholder="Album Art URL" className="w-full p-2 border rounded" required />
                        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g., Pop, Rock)" className="w-full p-2 border rounded" />
                        {!song && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Audio File (MP3, WAV)</label>
                                <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" accept=".mp3,.wav" required />
                            </div>
                        )}
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm w-24 flex justify-center">
                             {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SongEditModal;