
import React, { useState } from 'react';
import { findSongByDescription } from '../services/geminiService';
import { radioService } from '../services/radioService';
import { Song } from '../types';
import { SparklesIcon } from './icons/Icons';

const SongRequest: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setMessage('');
        try {
            const song = await findSongByDescription(prompt);
            if (song) {
                radioService.addRequest(song);
                setMessage(`Request for "${song.title}" by ${song.artist} sent!`);
                setPrompt('');
            } else {
                setMessage("Couldn't find a song matching that description. Try again!");
            }
        } catch (error) {
            setMessage('An error occurred. Please try again later.');
            console.error(error);
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="p-4 rounded-lg bg-gray-100">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-2 text-brand-blue">
                <SparklesIcon className="w-5 h-5"/>
                AI Song Request
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., a rock song from the 90s"
                    className="flex-grow bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue transition text-gray-800"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Request'}
                </button>
            </form>
            {message && <p className="text-sm mt-2 text-brand-blue">{message}</p>}
        </div>
    );
};

export default SongRequest;