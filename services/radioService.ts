import { RadioState, Song, Station, LiveReaction, LiveComment, User, DistributorTrack } from '../types';
import { INITIAL_PLAYLIST } from '../constants';
import { userService } from './userService';

type Subscriber = (state: RadioState) => void;

const WAMUZI_RADIO_STATION: Station = {
    id: 'wamuzi-radio-main',
    name: 'Wamuzi Radio',
    streamUrl: 'https://stream.zeno.fm/k0dx5f9hffhvv',
    logoUrl: 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png',
};

const WAMUZI_WAVE_STATION: Station = {
    id: 'wamuzi-wave',
    name: 'Wamuzi Wave',
    streamUrl: '',
    logoUrl: 'https://picsum.photos/seed/wave/500/500',
    isPlaylistBased: true,
};


class RadioService {
    private state: RadioState = {
        isPlaying: false,
        stations: [WAMUZI_RADIO_STATION, WAMUZI_WAVE_STATION],
        currentStationId: WAMUZI_WAVE_STATION.id,
        currentSong: INITIAL_PLAYLIST[0],
        playlist: [...INITIAL_PLAYLIST],
        musicLibrary: [...INITIAL_PLAYLIST],
        songRequests: [],
        listeners: Math.floor(Math.random() * 1000) + 500,
        playbackPosition: 0,
        volume: 1,
        liveReactions: [],
        liveComments: [],
    };

    private subscribers: Subscriber[] = [];
    private playbackInterval: number | null = null;
    private distributorTracks: DistributorTrack[] = [];
    private syncedDistributors: Set<string> = new Set();
    private featuredSongId: string | null = null;

    constructor() {
        INITIAL_PLAYLIST.forEach(song => {
            if (!this.state.musicLibrary.find(s => s.id === song.id)) this.state.musicLibrary.push(song);
        });
        this.state.playlist = [...this.state.musicLibrary];
        this._initializeDistributorTracks();
    }

    private _initializeDistributorTracks = () => {
        this.distributorTracks = [
            {
                id: 'dist-priority-1',
                title: 'Urgent Echoes',
                artistName: 'Priority Artist',
                albumArt: 'https://picsum.photos/seed/priority/500/500',
                audioUrl: '',
                duration: 185,
                distributor: 'TuneCore',
                submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                isPriority: true,
            },
            {
                id: 'dist-1',
                title: 'Summer Haze',
                artistName: 'Virtual Vanguard',
                albumArt: 'https://picsum.photos/seed/summerhaze/500/500',
                audioUrl: '', // In a real app this would point to a temp file
                duration: 195,
                distributor: 'TuneCore',
                submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            },
            {
                id: 'dist-2',
                title: 'Neon Dreams',
                artistName: 'Charlie', // This artist exists
                albumArt: 'https://picsum.photos/seed/neondreams/500/500',
                audioUrl: '',
                duration: 210,
                distributor: 'Freecord',
                submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            }
        ];
    }

    private notify = () => {
        this.subscribers.forEach(callback => callback({ ...this.state }));
    }

    private startPlaybackSimulator = () => {
        if (this.playbackInterval) clearInterval(this.playbackInterval);
        this.playbackInterval = window.setInterval(() => {
            if (!this.state.isPlaying || !this.state.currentSong) return;

            // Increment play count every 30 seconds of simulated playback for dynamic analytics
            if (this.state.playbackPosition > 0 && this.state.playbackPosition % 30 === 0) {
                const songInLibrary = this.state.musicLibrary.find(s => s.id === this.state.currentSong!.id);
                if (songInLibrary) {
                    songInLibrary.playCount++;
                }
            }

            this.state.playbackPosition++;
            if (this.state.playbackPosition >= this.state.currentSong.duration) {
                this.playNextSong();
            }
            else {
                this.notify();
            }
        }, 1000);
    }
    
    private stopPlaybackSimulator = () => {
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
    }

    private playNextSong = () => {
        if (!this.state.currentSong) return;
        const currentIndex = this.state.playlist.findIndex(s => s.id === this.state.currentSong!.id);
        const nextIndex = (currentIndex + 1) % this.state.playlist.length;
        this.state.currentSong = this.state.playlist[nextIndex];
        this.state.playbackPosition = 0;
        this.notify();
    }
    
    subscribe = (callback: Subscriber) => { this.subscribers.push(callback); callback(this.state); }
    unsubscribe = (callback: Subscriber) => { this.subscribers = this.subscribers.filter(cb => cb !== callback); }
    getState = (): RadioState => { return this.state; }
    
    togglePlay = () => {
        this.state.isPlaying = !this.state.isPlaying;
        if (this.state.isPlaying) this.startPlaybackSimulator();
        else this.stopPlaybackSimulator();
        this.notify();
    }
    
    stop = () => { if (this.state.isPlaying) this.togglePlay(); }
    
    switchStation = (stationId: string) => {
        this.state.currentStationId = stationId;
        const station = this.state.stations.find(s => s.id === stationId);
        if (station?.isPlaylistBased) {
            this.state.currentSong = this.state.playlist[0];
            this.state.playbackPosition = 0;
            if (!this.state.isPlaying) this.togglePlay();
        } else {
             this.state.currentSong = null;
             this.state.playbackPosition = 0;
             if (!this.state.isPlaying) this.togglePlay();
        }
        this.notify();
    }

    playSongFromLibrary = (song: Song) => {
        this.state.currentStationId = null;
        this.state.currentSong = song;
        this.state.playbackPosition = 0;
        if (!this.state.isPlaying) {
            this.state.isPlaying = true;
            this.startPlaybackSimulator();
        }
        this.notify();
    }
    
    setVolume = (volume: number) => {
        this.state.volume = Math.max(0, Math.min(1, volume));
        this.notify();
    }
    
    addRequest = (song: Song) => {
        this.state.songRequests.push(song);
        this.notify();
    };

    approveRequest = (songId: string) => {
        const song = this.state.songRequests.find(s => s.id === songId);
        if (song) {
            this.state.playlist.push(song);
            this.state.songRequests = this.state.songRequests.filter(s => s.id !== songId);
            this.notify();
        }
    };

    denyRequest = (songId: string) => {
        this.state.songRequests = this.state.songRequests.filter(s => s.id !== songId);
        this.notify();
    };

    removeSongFromPlaylist = (songId: string) => {
        this.state.playlist = this.state.playlist.filter(s => s.id !== songId);
        this.notify();
    };

    getTrendingSongs = (): Song[] => {
        let featuredSong: Song | undefined;
        if (this.featuredSongId) {
            featuredSong = this.state.musicLibrary.find(s => s.id === this.featuredSongId);
        }

        const regularTrending = [...this.state.musicLibrary]
            .filter(s => s.id !== this.featuredSongId)
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 5);

        if (featuredSong) {
            return [featuredSong, ...regularTrending.slice(0, 4)];
        }
        
        return regularTrending;
    }

    getMusicCategories = (): string[] => {
        const categories = new Set(this.state.musicLibrary.map(s => s.category).filter(Boolean));
        return Array.from(categories) as string[];
    }
    
    getSongsByCategory = (category: string, limit = 5): Song[] => {
        return this.state.musicLibrary.filter(s => s.category === category).slice(0, limit);
    }

    getRecommendedSongs = (): Song[] => {
        const trendingIds = new Set(this.getTrendingSongs().map(s => s.id));
        const nonTrending = this.state.musicLibrary.filter(song => !trendingIds.has(song.id));
        for (let i = nonTrending.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nonTrending[i], nonTrending[j]] = [nonTrending[j], nonTrending[i]];
        }
        return nonTrending.slice(0, 5);
    }

    getUnlinkedSongsByArtistName = (artistName: string): Song[] => {
        return this.state.musicLibrary.filter(song => 
            song.artist.toLowerCase() === artistName.toLowerCase() && !song.artistId
        );
    }
    
    addSongToMusicLibrary = (songData: Omit<Song, 'id' | 'playCount'>) => {
        const newSong: Song = { ...songData, id: `song-${Date.now()}`, playCount: 0 };
        this.state.musicLibrary.unshift(newSong);
        this.state.playlist.unshift(newSong);
        this.notify();
    }
    
    removeSongFromMusicLibrary = (songId: string) => {
        this.state.musicLibrary = this.state.musicLibrary.filter(s => s.id !== songId);
        this.state.playlist = this.state.playlist.filter(s => s.id !== songId);
        if (this.featuredSongId === songId) this.featuredSongId = null;
        this.notify();
    }

    updateSongInMusicLibrary = (songId: string, updates: Partial<Omit<Song, 'id' | 'playCount' | 'duration' | 'url'>>) => {
        const songIndex = this.state.musicLibrary.findIndex(s => s.id === songId);
        if (songIndex > -1) {
            this.state.musicLibrary[songIndex] = { ...this.state.musicLibrary[songIndex], ...updates };
        }
        const playlistIndex = this.state.playlist.findIndex(s => s.id === songId);
        if (playlistIndex > -1) {
            this.state.playlist[playlistIndex] = { ...this.state.playlist[playlistIndex], ...updates };
        }
        this.notify();
    };
    
    linkSongsToArtist = (songIds: string[], artistId: string, artistName: string) => {
        let wasModified = false;
        this.state.musicLibrary.forEach(song => {
            if (songIds.includes(song.id)) {
                song.artistId = artistId;
                song.artist = artistName;
                wasModified = true;
            }
        });

        this.state.playlist.forEach(song => {
            if (songIds.includes(song.id)) {
                song.artistId = artistId;
                song.artist = artistName;
            }
        });
        
        if (wasModified) {
            this.notify();
        }
    }

    addStation = (stationData: Omit<Station, 'id' | 'isPlaylistBased'>) => {
        const newStation: Station = {
            ...stationData,
            id: `station-${Date.now()}`,
            isPlaylistBased: !stationData.streamUrl,
        };
        this.state.stations.push(newStation);
        this.notify();
    };

    updateStation = (station: Station) => {
        const index = this.state.stations.findIndex(s => s.id === station.id);
        if (index > -1) {
            this.state.stations[index] = { ...station, isPlaylistBased: !station.streamUrl };
        }
        this.notify();
    };

    removeStation = (stationId: string) => {
        if (stationId === WAMUZI_RADIO_STATION.id || stationId === WAMUZI_WAVE_STATION.id) {
            alert("Cannot delete default stations.");
            return;
        }
        this.state.stations = this.state.stations.filter(s => s.id !== stationId);
        if (this.state.currentStationId === stationId) {
            this.state.currentStationId = WAMUZI_WAVE_STATION.id;
        }
        this.notify();
    };

    getDistributorTracks = (): DistributorTrack[] => {
        return [...this.distributorTracks];
    }
    
    approveDistributorTrack = (trackId: string, artistId?: string) => {
        const track = this.distributorTracks.find(t => t.id === trackId);
        if (!track) return;

        let songArtistName = track.artistName;
        let songArtistId: string | undefined = undefined;

        if (artistId) {
            const artist = userService.getUserById(artistId);
            if (artist) {
                songArtistName = artist.name;
                songArtistId = artist.id;
            }
        }
        
        this.addSongToMusicLibrary({
            title: track.title,
            artist: songArtistName,
            artistId: songArtistId, // This will be undefined if no artist is linked
            albumArt: track.albumArt,
            url: track.audioUrl,
            duration: track.duration,
            category: 'New Releases',
            distributor: track.distributor,
        });
        
        this.distributorTracks = this.distributorTracks.filter(t => t.id !== trackId);
        this.notify();
    }
    
    rejectDistributorTrack = (trackId: string) => {
        this.distributorTracks = this.distributorTracks.filter(t => t.id !== trackId);
        this.notify();
    }

    syncFromDistributors = (connectedDistributors: string[]) => {
        const newTracks: DistributorTrack[] = [];
        connectedDistributors.forEach(distributorName => {
            // If we've already synced this session, skip to avoid spamming tracks.
            if (this.syncedDistributors.has(distributorName)) return;

            const trackCount = Math.floor(Math.random() * 2) + 1; // Add 1 or 2 tracks
            for (let i = 0; i < trackCount; i++) {
                const isPriority = Math.random() > 0.8; // 20% chance of being priority
                const newTrack: DistributorTrack = {
                    id: `dist-${Date.now()}-${distributorName.replace(/\s+/g, '-')}-${i}`,
                    title: `${isPriority ? 'PRIORITY' : 'Synced'} Track ${Math.floor(Math.random() * 1000)}`,
                    artistName: `Artist From ${distributorName}`,
                    albumArt: `https://picsum.photos/seed/${Date.now()}-${i}/500/500`,
                    audioUrl: '',
                    duration: Math.floor(Math.random() * 60) + 180, // 3-4 mins
                    distributor: distributorName,
                    submittedAt: new Date().toISOString(),
                    isPriority: isPriority
                };
                newTracks.push(newTrack);
            }
            
            this.syncedDistributors.add(distributorName);
        });

        if (newTracks.length > 0) {
            this.distributorTracks.unshift(...newTracks);
            this.notify();
        }
    }

    setFeaturedSong = (songId: string | null) => {
        this.featuredSongId = songId;
        this.notify();
    }

    getFeaturedSongId = (): string | null => {
        return this.featuredSongId;
    }
}

export const radioService = new RadioService();