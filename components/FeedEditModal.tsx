import React, { useState } from 'react';
import { RSSFeed } from '../types';
import { newsService } from '../services/newsService';
import { XIcon } from './icons/Icons';

interface FeedEditModalProps {
    feed?: RSSFeed;
    onClose: () => void;
}

const FeedEditModal: React.FC<FeedEditModalProps> = ({ feed, onClose }) => {
    const [name, setName] = useState(feed?.name || '');
    const [url, setUrl] = useState(feed?.url || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !url.trim()) {
            setError('Feed Name and URL are required.');
            return;
        }
        try {
            new URL(url);
        } catch (_) {
            setError('Please enter a valid URL.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (feed) { // Edit mode
                newsService.updateFeed(feed.id, name, url);
            } else { // Add mode
                newsService.addFeed(name, url);
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
                        <h2 className="text-xl font-semibold">{feed ? 'Edit News Feed' : 'Add New News Feed'}</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Feed Name" className="w-full p-2 border rounded" required />
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Feed URL" className="w-full p-2 border rounded" required />
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

export default FeedEditModal;
