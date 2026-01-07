import React, { useState, useEffect } from 'react';
import { radioService } from '../services/radioService';
import { newsService } from '../services/newsService';
import { RadioState, Song, NewsState, RSSFeed, Station, DistributorTrack, User } from '../types';
import { CheckIcon, XIcon, TrashIcon, RssIcon, PencilIcon, SyncIcon, PlusIcon, EyeIcon, StarIcon } from './icons/Icons';
import SongEditModal from './SongEditModal';
import StationEditModal from './StationEditModal';
import FeedEditModal from './FeedEditModal';
import FeedPreviewModal from './FeedPreviewModal';
import { userService } from '../services/userService';
import DistributorConnectionManager from './DistributorConnectionManager';

const PlaylistManager: React.FC<{ state: RadioState }> = ({ state }) => {
    const SongListItem: React.FC<{ song: Song, children?: React.ReactNode }> = ({ song, children }) => (
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{song.title}</p>
                <p className="text-sm text-gray-500">{song.artist}</p>
            </div>
            {children}
        </div>
    );
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow-md p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Song Requests (for Wamuzi Wave)</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {state.songRequests.length > 0 ? state.songRequests.map(song => (
                        <SongListItem key={song.id} song={song}>
                            <div className="flex gap-2">
                                <button onClick={() => radioService.approveRequest(song.id)} className="p-2 bg-green-500/10 text-green-600 rounded-full hover:bg-green-500/20 transition"><CheckIcon className="w-5 h-5"/></button>
                                <button onClick={() => radioService.denyRequest(song.id)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition"><XIcon className="w-5 h-5"/></button>
                            </div>
                        </SongListItem>
                    )) : <p className="text-gray-500 text-center py-4">No pending requests.</p>}
                </div>
            </div>
            <div className="bg-white shadow-md p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Current Playlist (for Wamuzi Wave)</h3>
                 <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {state.playlist.map(song => (
                       <SongListItem key={song.id} song={song}>
                           <button onClick={() => radioService.removeSongFromPlaylist(song.id)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition"><TrashIcon className="w-5 h-5"/></button>
                        </SongListItem>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MusicLibraryManager: React.FC<{ state: RadioState }> = ({ state }) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; song?: Song }>({ isOpen: false, song: undefined });
    const featuredSongId = radioService.getFeaturedSongId();

    const handleDelete = (songId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this song?")) {
            radioService.removeSongFromMusicLibrary(songId);
        }
    };

    const handleFeatureToggle = (songId: string) => {
        const isCurrentlyFeatured = featuredSongId === songId;
        radioService.setFeaturedSong(isCurrentlyFeatured ? null : songId);
    };

    return (
        <>
            {modalState.isOpen && <SongEditModal song={modalState.song} onClose={() => setModalState({ isOpen: false })} />}
            <div className="bg-white shadow-md p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Music Library</h3>
                    <button onClick={() => setModalState({ isOpen: true })} className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-md text-sm font-semibold hover:bg-blue-500 transition">
                        <PlusIcon className="w-4 h-4" /> Add Song
                    </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {state.musicLibrary.map(song => (
                         <div key={song.id} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${featuredSongId === song.id ? 'bg-yellow-100' : 'bg-gray-50'}`}>
                            <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="font-semibold">{song.title}</p>
                                <p className="text-sm text-gray-500">{song.artist}</p>
                            </div>
                            <button onClick={() => handleFeatureToggle(song.id)} className={`p-2 rounded-full transition ${featuredSongId === song.id ? 'text-yellow-500 bg-yellow-200' : 'text-gray-400 hover:bg-gray-200'}`} title="Feature this song">
                                <StarIcon className="w-5 h-5" isFilled={featuredSongId === song.id} />
                            </button>
                            <button onClick={() => setModalState({ isOpen: true, song })} className="p-2 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDelete(song.id)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const StationManager: React.FC<{ state: RadioState }> = ({ state }) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; station?: Station }>({ isOpen: false });

    const handleDelete = (station: Station) => {
        if (window.confirm(`Are you sure you want to delete the station "${station.name}"?`)) {
            radioService.removeStation(station.id);
        }
    }

    return (
        <>
            {modalState.isOpen && <StationEditModal station={modalState.station} onClose={() => setModalState({ isOpen: false })} />}
            <div className="bg-white shadow-md p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Radio Station Management</h3>
                    <button onClick={() => setModalState({ isOpen: true })} className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-md text-sm font-semibold hover:bg-blue-500 transition">
                        <PlusIcon className="w-4 h-4" /> Add Station
                    </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                     {state.stations.map(station => (
                         <div key={station.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <img src={station.logoUrl} alt={station.name} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="font-semibold">{station.name}</p>
                                <p className="text-xs text-gray-500 truncate">{station.streamUrl || 'Internal Playlist'}</p>
                            </div>
                            {station.id !== 'wamuzi-radio-main' ? (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setModalState({ isOpen: true, station })} className="p-2 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition" title="Edit Station">
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => handleDelete(station)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition" title="Delete Station">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ) : (
                                <div className="px-2 py-1 text-gray-400 text-xs font-semibold">
                                    (Default)
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const FeedManager: React.FC<{ state: NewsState }> = ({ state }) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [modalState, setModalState] = useState<{ isOpen: boolean; feed?: RSSFeed }>({ isOpen: false });
    const [previewingFeed, setPreviewingFeed] = useState<RSSFeed | null>(null);

    const handleSync = async (feedId: string) => {
        setIsLoading(feedId);
        try {
            await newsService.fetchArticlesFromFeed(feedId);
        } catch (error) {
            alert('Failed to sync feed.');
        } finally {
            setIsLoading(null);
        }
    };

    const handleDelete = (feed: RSSFeed) => {
        if (window.confirm(`Are you sure you want to delete the feed "${feed.name}"? This will also remove its articles.`)) {
            newsService.removeFeed(feed.id);
        }
    }

    return (
        <>
            {modalState.isOpen && <FeedEditModal feed={modalState.feed} onClose={() => setModalState({ isOpen: false })} />}
            {previewingFeed && <FeedPreviewModal feed={previewingFeed} onClose={() => setPreviewingFeed(null)} />}
            <div className="bg-white shadow-md p-6 rounded-lg">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">News Feed Management</h3>
                    <button onClick={() => setModalState({ isOpen: true })} className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-md text-sm font-semibold hover:bg-blue-500 transition">
                        <PlusIcon className="w-4 h-4" /> Add Feed
                    </button>
                </div>
                 <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                     {state.feeds.map(feed => (
                         <div key={feed.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            {feed.imageUrl ? (
                                <img src={feed.imageUrl} alt={feed.name} className="w-12 h-12 rounded-md object-contain bg-gray-100 flex-shrink-0" />
                            ) : (
                                <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                     <RssIcon className="w-8 h-8 text-orange-500" />
                                </div>
                            )}
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold">{feed.name}</p>
                                <p className="text-xs text-gray-500 truncate">{feed.url}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPreviewingFeed(feed)} className="p-2 bg-purple-500/10 text-purple-600 rounded-full hover:bg-purple-500/20 transition" title="Preview Feed">
                                    <EyeIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleSync(feed.id)} disabled={!!isLoading} className="p-2 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition disabled:opacity-50" title="Sync Feed">
                                    {isLoading === feed.id ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <SyncIcon className="w-5 h-5"/>}
                                </button>
                                {feed.id !== 'default-wamuzi-news' ? (
                                    <>
                                        <button onClick={() => setModalState({ isOpen: true, feed })} className="p-2 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition" title="Edit Feed">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleDelete(feed)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition" title="Delete Feed">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </>
                                ) : (
                                     <div className="px-2 py-1 text-gray-400 text-xs font-semibold">(Default)</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

const DistributorSubmissionsManager: React.FC<{ artists: User[] }> = ({ artists }) => {
    const [tracks, setTracks] = useState<DistributorTrack[]>([]);
    const [approvalState, setApprovalState] = useState<{ [trackId: string]: string }>({});

    useEffect(() => {
        const updateTracks = () => {
            const fetchedTracks = radioService.getDistributorTracks();
            // Sort by priority first, then by submission date
            fetchedTracks.sort((a, b) => {
                if (a.isPriority && !b.isPriority) return -1;
                if (!a.isPriority && b.isPriority) return 1;
                return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
            });
            setTracks(fetchedTracks);
        };
        updateTracks();
        const sub = () => updateTracks();
        radioService.subscribe(sub as any);
        return () => radioService.unsubscribe(sub as any);
    }, []);

    const handleApprove = (trackId: string) => {
        const artistId = approvalState[trackId]; // This can be undefined
        radioService.approveDistributorTrack(trackId, artistId || undefined);
    };

    const handleReject = (trackId: string) => {
        radioService.rejectDistributorTrack(trackId);
    };

    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Distributor Submissions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {tracks.length > 0 ? tracks.map(track => (
                    <div key={track.id} className={`p-3 rounded-lg ${track.isPriority ? 'bg-yellow-100 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-4">
                            <img src={track.albumArt} alt={track.title} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="font-semibold">{track.title}</p>
                                <div className="flex items-center gap-2">
                                     <p className="text-sm text-gray-500">{track.artistName} (via {track.distributor})</p>
                                     {track.isPriority && <span className="text-xs font-bold bg-yellow-300 text-yellow-800 px-2 py-0.5 rounded-full">PRIORITY</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={approvalState[track.id] || ''}
                                    onChange={(e) => setApprovalState(prev => ({ ...prev, [track.id]: e.target.value }))}
                                    className="p-1 border bg-white rounded-md text-xs"
                                >
                                    <option value="">Approve as unlinked</option>
                                    {artists.map(artist => <option key={artist.id} value={artist.id}>Link to: {artist.name}</option>)}
                                </select>
                                <button onClick={() => handleApprove(track.id)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><CheckIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleReject(track.id)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><XIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">No new distributor submissions.</p>}
            </div>
        </div>
    );
};


interface AdminRadioNewsManagerProps {
    radioState: RadioState;
    newsState: NewsState;
}

const AdminRadioNewsManager: React.FC<AdminRadioNewsManagerProps> = ({ radioState, newsState }) => {
    const artists = userService.getArtists();
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Radio & Music Management</h2>
            <div className="space-y-6">
                <DistributorConnectionManager />
                <DistributorSubmissionsManager artists={artists} />
                <MusicLibraryManager state={radioState} />
                <PlaylistManager state={radioState} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                 <StationManager state={radioState} />
                 <FeedManager state={newsState} />
            </div>
        </div>
    )
};

export default AdminRadioNewsManager;