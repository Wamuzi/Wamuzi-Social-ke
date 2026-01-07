import { Song } from './types';

// NOTE: These URLs are placeholders. The app now supports uploading actual audio files,
// which will be stored as base64 data URLs.
export const INITIAL_PLAYLIST: Song[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artistId: 'user-2', // Mock artist ID
    albumArt: 'https://picsum.photos/seed/blindinglights/500/500',
    duration: 200,
    url: '',
    playCount: 1500,
    category: 'Synth Pop',
  },
  {
    id: '2',
    title: 'Midnight City',
    artist: 'M83',
    artistId: 'user-2', // Mock artist ID
    albumArt: 'https://picsum.photos/seed/midnightcity/500/500',
    duration: 243,
    url: '',
    playCount: 1250,
    category: 'Indie Electronic',
  },
  {
    id: '3',
    title: 'Genesis',
    artist: 'Grimes',
    artistId: 'user-2', // Mock artist ID
    albumArt: 'https://picsum.photos/seed/genesis/500/500',
    duration: 255,
    url: '',
    playCount: 980,
    category: 'Indie Electronic',
  },
  {
    id: '4',
    title: 'A Sky Full of Stars',
    artist: 'Coldplay',
    artistId: 'user-2', // Mock artist ID
    albumArt: 'https://picsum.photos/seed/skyfull/500/500',
    duration: 268,
    url: '',
    playCount: 2100,
    category: 'Pop Rock',
  },
];