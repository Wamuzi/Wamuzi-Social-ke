import React from 'react';
import { RSSFeed, Article } from '../types';
import { newsService } from '../services/newsService';
import { XIcon } from './icons/Icons';

interface FeedPreviewModalProps {
    feed: RSSFeed;
    onClose: () => void;
}

const FeedPreviewModal: React.FC<FeedPreviewModalProps> = ({ feed, onClose }) => {
    const allArticles = newsService.getState().articles;
    const feedArticles = allArticles.filter(a => a.feedId === feed.id).slice(0, 10); // Show latest 10

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-semibold">Preview: {feed.name}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                    {feedArticles.length > 0 ? (
                        feedArticles.map(article => (
                            <div key={article.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                <img src={article.thumbnail} alt={article.title} className="w-24 h-24 rounded-md object-cover bg-gray-200 flex-shrink-0" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2">{article.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(article.pubDate).toLocaleString()}</p>
                                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue hover:underline mt-2 inline-block">
                                        Read More
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-16">No articles found for this feed. Try syncing it.</p>
                    )}
                </div>
                 <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

export default FeedPreviewModal;