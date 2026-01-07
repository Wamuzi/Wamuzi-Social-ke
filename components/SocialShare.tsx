import React from 'react';

interface SocialShareProps {
    shareText: string;
    shareUrl?: string;
    isPopupVersion?: boolean;
}

const SocialShare: React.FC<SocialShareProps> = ({ shareText, shareUrl, isPopupVersion = false }) => {
    const url = shareUrl || window.location.href;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);

    const links = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    };

    const Icon: React.FC<{d: string}> = ({d}) => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d={d}></path></svg>;

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {!isPopupVersion && <p className="text-sm text-gray-500 hidden sm:block">Share:</p>}
            <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-brand-blue hover:text-white transition" aria-label="Share on Twitter">
                <Icon d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
            </a>
            <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-brand-blue hover:text-white transition" aria-label="Share on Facebook">
                <Icon d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 12 2.04Z" />
            </a>
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-brand-blue hover:text-white transition" aria-label="Share on WhatsApp">
               <Icon d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.37 21.85 12.04 21.85C17.5 21.85 21.95 17.4 21.95 11.94C21.95 6.48 17.5 2 12.04 2M12.04 3.67C16.56 3.67 20.28 7.39 20.28 11.93C20.28 16.47 16.56 20.19 12.04 20.19C10.52 20.19 9.06 19.79 7.78 19.06L7.53 18.92L4.35 19.71L5.16 16.62L5.02 16.37C4.24 15.03 3.8 13.5 3.8 11.92C3.8 7.38 7.52 3.67 12.04 3.67M9.13 7.5C8.91 7.5 8.7 7.59 8.55 7.84C8.4 8.09 7.83 8.76 7.83 9.83C7.83 10.9 8.56 11.96 8.71 12.15C8.86 12.34 10.27 14.54 12.37 15.39C14.1 16.1 14.49 15.93 14.85 15.88C15.48 15.79 16.3 15.22 16.53 14.5C16.76 13.78 16.76 13.18 16.66 13.04C16.56 12.9 16.37 12.83 16.12 12.71C15.87 12.59 14.61 11.96 14.38 11.87C14.15 11.78 14 11.73 13.85 11.98C13.7 12.23 13.16 12.86 13 13.04C12.84 13.23 12.68 13.25 12.43 13.13C12.18 13.01 11.33 12.72 10.28 11.8C9.44 11.08 8.87 10.19 8.74 9.94C8.61 9.69 8.74 9.55 8.86 9.43C8.97 9.32 9.11 9.13 9.25 8.97C9.39 8.81 9.44 8.7 9.53 8.52C9.62 8.34 9.58 8.18 9.51 8.04C9.44 7.9 9.13 7.5 9.13 7.5Z" />
            </a>
        </div>
    );
};

export default SocialShare;