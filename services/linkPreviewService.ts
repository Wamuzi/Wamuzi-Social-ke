import { LinkPreview } from '../types';

const MOCK_PREVIEWS: { [key: string]: Omit<LinkPreview, 'url' | 'domain'> } = {
    'https://wamuzinews.co.ke': {
        title: 'Wamuzi News - Your Source for Timely Updates',
        description: 'Stay informed with the latest news, stories, and analysis from Wamuzi News. We cover everything from local events to global trends.',
        image: 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png',
    },
    'https://react.dev': {
        title: 'React',
        description: 'The library for web and native user interfaces.',
        image: 'https://react.dev/images/og-home.png'
    },
    'https://www.youtube.com': {
        title: 'YouTube',
        description: 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
        image: 'https://www.youtube.com/img/desktop/yt_1200.png'
    }
};

class LinkPreviewService {
    // In a real app, this would be a backend call to a server that scrapes the URL for meta tags.
    // This is a frontend simulation to avoid CORS issues.
    async fetchPreview(url: string): Promise<LinkPreview | null> {
        // Simulate network delay
        await new Promise(res => setTimeout(res, 700));

        try {
            const urlObject = new URL(url);
            const domainKey = `${urlObject.protocol}//${urlObject.hostname}`;
            
            const previewData = MOCK_PREVIEWS[domainKey];

            if (previewData) {
                return {
                    ...previewData,
                    url: url,
                    domain: urlObject.hostname,
                };
            }
            return null;
        } catch (error) {
            console.error("Invalid URL for preview:", url);
            return null;
        }
    }
}

export const linkPreviewService = new LinkPreviewService();