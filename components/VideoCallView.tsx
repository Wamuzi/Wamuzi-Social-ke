import React from 'react';
import { User } from '../types';
import { VolumeOffIcon } from './icons/Icons';

interface VideoCallViewProps {
    user: User;
    onEndCall: () => void;
}

const VideoCallView: React.FC<VideoCallViewProps> = ({ user, onEndCall }) => {
    return (
        <div className="flex-grow flex flex-col h-full bg-gray-800 text-white items-center justify-between p-8">
            <div className="text-center">
                <p className="text-lg font-semibold">Video call with</p>
                <h2 className="text-3xl font-bold">{user.name}</h2>
            </div>

            <div className="flex flex-col items-center gap-4">
                <img src={user.avatarUrl} alt={user.name} className="w-40 h-40 rounded-full border-4 border-white shadow-lg" />
                <p className="text-gray-300 animate-pulse">Connecting...</p>
            </div>

            <div className="flex items-center justify-center gap-6">
                <button className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition">
                    <VolumeOffIcon className="w-6 h-6" />
                </button>
                <button onClick={onEndCall} className="px-8 py-4 bg-red-600 rounded-full font-semibold hover:bg-red-700 transition">
                    End Call
                </button>
                 <button className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition">
                    {/* Placeholder for video toggle */}
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>
                </button>
            </div>
        </div>
    );
};

export default VideoCallView;
