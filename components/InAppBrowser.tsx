import React, { useState } from 'react';
import { XIcon } from './icons/Icons';

interface InAppBrowserProps {
    url: string;
    onClose: () => void;
}

const InAppBrowser: React.FC<InAppBrowserProps> = ({ url, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    let domain = 'Loading...';
    try {
        domain = new URL(url).hostname;
    } catch (e) {
        // invalid url, handled gracefully
    }
    
    return (
        <div className="fixed inset-0 bg-white z-40 flex flex-col">
            <header className="relative flex items-center justify-between p-2 border-b bg-gray-50 flex-shrink-0">
                {isLoading && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-200/50 overflow-hidden">
                        <div className="w-full h-full relative animate-loading-bar"></div>
                    </div>
                )}
                <div className="flex-grow text-center text-sm text-gray-600 truncate">{domain}</div>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"><XIcon className="w-6 h-6"/></button>
            </header>
            <iframe 
                src={url}
                onLoad={() => setIsLoading(false)}
                className={`w-full h-full border-none transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                title="In-App Browser"
            ></iframe>
        </div>
    );
};

export default InAppBrowser;