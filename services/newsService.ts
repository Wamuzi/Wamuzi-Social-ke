import { NewsState, Article, RSSFeed } from '../types';

type Subscriber = (state: NewsState) => void;

const API_BASE_URL = `https://api.rss2json.com/v1/api.json?rss_url=`;

const CACHE_KEY_ARTICLES = 'wamuzi-news-articles';
const CACHE_KEY_SEEN_GUIDS = 'wamuzi-seen-article-guids';
const MAX_CACHED_ARTICLES = 50; // Limit cache to the 50 most recent articles

const WAMUZI_NEWS_FEED: RSSFeed = {
    id: 'default-wamuzi-news',
    name: 'Wamuzi News',
    url: 'https://wamuzinews.co.ke/feed',
    imageUrl: 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png',
};

class NewsService {
    private state: NewsState = {
        articles: [],
        feeds: [WAMUZI_NEWS_FEED],
        hasNew: false,
        isMonetizationActive: true,
        adContent: 'Enjoying the tunes? Support Wamuzi Media by subscribing!',
        adImageUrl: '',
        adLinkUrl: '',
    };
    private subscribers: Subscriber[] = [];
    private seenArticleGuids: Set<string> = new Set();

    constructor() {
        this.loadFromCache();
    }

    private _parseItemToArticle(item: any, feed: RSSFeed): Article {
        let thumbnail = '';

        const findFirstImageInHtml = (htmlString: string): string | null => {
            if (!htmlString) return null;
            try {
                // This regex finds the src attribute of the first img tag.
                const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/;
                const match = htmlString.match(imgRegex);
                return match ? match[1] : null;
            } catch(e) {
                console.error("Error parsing HTML for image with regex", e);
                return null;
            }
        };
    
        // === IMAGE EXTRACTION LOGIC ===
        // 1. Use the thumbnail field provided by the RSS parser if it exists.
        if (typeof item.thumbnail === 'string' && item.thumbnail) {
            thumbnail = item.thumbnail;
        }
    
        // 2. If no thumbnail, check for an enclosure link of type image.
        if (!thumbnail && item.enclosure && typeof item.enclosure.link === 'string' && item.enclosure.type?.startsWith('image')) {
            thumbnail = item.enclosure.link;
        }
    
        // 3. If still no image, search for the first <img> tag in the content.
        if (!thumbnail && item.content) {
            thumbnail = findFirstImageInHtml(item.content) || '';
        }
    
        // 4. As a final fallback for HTML, check the description field.
        if (!thumbnail && item.description) {
            thumbnail = findFirstImageInHtml(item.description) || '';
        }
    
        return {
            id: item.guid || `manual-${Date.now()}-${Math.random()}`,
            title: item.title,
            author: item.author || 'Unknown Author',
            link: item.link,
            pubDate: item.pubDate,
            thumbnail: thumbnail, // Will be an empty string if no image is found
            description: item.description || '',
            content: item.content || '',
            categories: item.categories || [],
            sourceFeedName: feed.name,
            feedId: feed.id,
            type: 'article',
        };
    }

    private loadFromCache = () => {
        try {
            const cachedArticlesJson = localStorage.getItem(CACHE_KEY_ARTICLES);
            if (cachedArticlesJson) {
                const cachedArticles: Article[] = JSON.parse(cachedArticlesJson);
                this.state.articles = cachedArticles;
                cachedArticles.forEach(article => this.seenArticleGuids.add(article.id));
            }

            const cachedGuidsJson = localStorage.getItem(CACHE_KEY_SEEN_GUIDS);
            if (cachedGuidsJson) {
                this.seenArticleGuids = new Set(JSON.parse(cachedGuidsJson));
            }
        } catch (error) {
            console.error("Failed to load news from cache:", error);
            localStorage.removeItem(CACHE_KEY_ARTICLES);
            localStorage.removeItem(CACHE_KEY_SEEN_GUIDS);
        }
    }

    private saveToCache = () => {
        try {
            const articlesToCache = this.state.articles
                .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
                .slice(0, MAX_CACHED_ARTICLES);

            localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(articlesToCache));
            localStorage.setItem(CACHE_KEY_SEEN_GUIDS, JSON.stringify(Array.from(this.seenArticleGuids)));
        } catch (error) {
            console.error("Failed to save news to cache:", error);
        }
    }

    private notify = () => {
        this.state.articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        const stateCopy = { ...this.state, articles: [...this.state.articles], feeds: [...this.state.feeds] };
        this.subscribers.forEach(callback => callback(stateCopy));
    }
    
    subscribe = (callback: Subscriber) => {
        this.subscribers.push(callback);
        callback(this.state);
    }

    unsubscribe = (callback: Subscriber) => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }
    
    getState = (): NewsState => {
        return this.state;
    }

    getArticlesPaginated = ({ page = 1, limit = 5 }: { page: number; limit: number; }): { articles: Article[], hasMore: boolean } => {
        const allArticles = [...this.state.articles]; // Already sorted
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const articles = allArticles.slice(startIndex, endIndex);
        const hasMore = endIndex < allArticles.length;
        return { articles, hasMore };
    }

    fetchArticles = async () => {
        const fetchPromises = this.state.feeds.map(async (feed) => {
            try {
                const response = await fetch(`${API_BASE_URL}${encodeURIComponent(feed.url)}`);
                if (!response.ok) throw new Error(`Failed to fetch RSS feed from ${feed.name}`);
                const data = await response.json();
                
                if (data.status === 'ok') {
                    if (data.feed && data.feed.image) {
                        const feedInState = this.state.feeds.find(f => f.id === feed.id);
                        if (feedInState && feedInState.imageUrl !== data.feed.image) {
                            feedInState.imageUrl = data.feed.image;
                        }
                    }
                    return data.items.map((item: any) => this._parseItemToArticle(item, feed));
                }
            } catch (error) {
                console.error(`Error fetching news from ${feed.name}:`, error);
            }
            return [];
        });

        const results = await Promise.all(fetchPromises);
        const allFetchedArticlesFromFeeds = results.flat().filter(Boolean) as Article[];
        
        const manualArticles = this.state.articles.filter(a => !a.feedId);
        const newlyFetched = allFetchedArticlesFromFeeds.filter(article => !this.seenArticleGuids.has(article.id));
        
        if(newlyFetched.length > 0){
            this.state.hasNew = true;
            newlyFetched.forEach(a => this.seenArticleGuids.add(a.id));
        }

        const combinedArticles = [...allFetchedArticlesFromFeeds, ...manualArticles];
        this.state.articles = Array.from(new Map(combinedArticles.map(item => [item.id, item])).values());
        
        this.notify();
        this.saveToCache();
    }
    
    fetchArticlesFromFeed = async (feedId: string) => {
        const feed = this.state.feeds.find(f => f.id === feedId);
        if (!feed) {
            console.error("Feed not found for fetching:", feedId);
            throw new Error("Feed not found");
        }

        try {
            const response = await fetch(`${API_BASE_URL}${encodeURIComponent(feed.url)}`);
            if (!response.ok) throw new Error(`Failed to fetch RSS feed from ${feed.name}`);
            const data = await response.json();

            if (data.status === 'ok') {
                if (data.feed && data.feed.image && feed.imageUrl !== data.feed.image) {
                    feed.imageUrl = data.feed.image;
                }
                
                const fetchedArticles: Article[] = data.items.map((item: any) => this._parseItemToArticle(item, feed));
                
                const otherArticles = this.state.articles.filter(a => a.feedId !== feedId);
                const newlyFetched = fetchedArticles.filter(article => !this.seenArticleGuids.has(article.id));
                if (newlyFetched.length > 0) {
                    this.state.hasNew = true;
                    newlyFetched.forEach(a => this.seenArticleGuids.add(a.id));
                }
                
                const combinedArticles = [...fetchedArticles, ...otherArticles];
                this.state.articles = Array.from(new Map(combinedArticles.map(item => [item.id, item])).values());

                this.notify();
                this.saveToCache();
            }
        } catch (error) {
            console.error(`Error fetching news from ${feed.name}:`, error);
            throw error;
        }
    }

    addFeed = (name: string, url: string) => {
        if (this.state.feeds.some(feed => feed.url === url)) return;
        const newFeed: RSSFeed = { id: `feed-${Date.now()}`, name, url };
        this.state.feeds = [...this.state.feeds, newFeed];
        this.notify();
        this.fetchArticles();
    }

    updateFeed = (feedId: string, name: string, url: string) => {
        if (this.state.feeds.some(f => f.id === feedId)) {
            this.state.articles = this.state.articles.filter(article => article.feedId !== feedId);
            this.state.feeds = this.state.feeds.map(feed => feed.id === feedId ? { ...feed, name, url } : feed);
            this.notify();
            this.fetchArticles();
        }
    }

    removeFeed = (feedId: string) => {
        if (feedId === WAMUZI_NEWS_FEED.id) return;
        this.state.feeds = this.state.feeds.filter(feed => feed.id !== feedId);
        this.state.articles = this.state.articles.filter(article => article.feedId !== feedId);
        this.notify();
        this.saveToCache();
    }

    publishArticle = (article: Omit<Article, 'id' | 'pubDate' | 'sourceFeedName' | 'feedId' | 'type'>) => {
        const newArticle: Article = {
            ...article,
            id: `manual-${Date.now()}`,
            pubDate: new Date().toISOString(),
            sourceFeedName: 'Admin Post',
            type: 'article',
        };
        this.state.articles = [newArticle, ...this.state.articles];
        this.state.hasNew = true;
        this.notify();
        this.saveToCache();
    }

    markNewsAsSeen = () => {
        this.state.hasNew = false;
        this.notify();
    }

    setMonetization = (isActive: boolean, adContent: string, adImageUrl: string, adLinkUrl: string) => {
        this.state.isMonetizationActive = isActive;
        this.state.adContent = adContent;
        this.state.adImageUrl = adImageUrl;
        this.state.adLinkUrl = adLinkUrl;
        this.notify();
    }
}

export const newsService = new NewsService();