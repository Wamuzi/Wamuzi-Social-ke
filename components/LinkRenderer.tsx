import React from 'react';

interface LinkRendererProps {
    text: string;
    onLinkClick?: (url: string) => void;
}

const LinkRenderer: React.FC<LinkRendererProps> = ({ text, onLinkClick }) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

    if (!text) return null;

    const parts = text.split(urlRegex);

    return (
        <>
            {parts.map((part, i) => {
                if (part && urlRegex.test(part)) {
                    const href = part.startsWith('http') ? part : `https://${part}`;
                    if (onLinkClick) {
                        return (
                            <a 
                                key={i} 
                                href={href} 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLinkClick(href); }}
                                className="text-blue-500 hover:underline"
                            >
                                {part}
                            </a>
                        );
                    }
                    return (
                        <a 
                            key={i} 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:underline"
                            onClick={e => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </>
    );
};

export default LinkRenderer;