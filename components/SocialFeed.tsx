import React, { useState, useEffect, useRef, useCallback } from 'react';
import { socialService } from '../services/socialService';
import { newsService } from '../services/newsService';
import { Article, FeedItem, Post, User, Song, FeedSortOption } from '../types';
import SocialShare from './SocialShare';
import { RssIcon, RepostIcon, SyncIcon, PencilSquareIcon, MusicNoteIcon, SparklesIcon, UsersIcon, NewspaperIcon } from './icons/Icons';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { userService } from '../services/userService';
import { radioService } from '../services/radioService';
import { ViewState } from '../App';
import AttachedSongPlayer from './AttachedSongPlayer';
import CreateCampaignModal from './CreateCampaignModal';
import Stories from './Stories';
import LinkRenderer from './LinkRenderer';

interface SocialFeedProps {
    onArticleSelect: (url: string) => void;
    onViewStory: (user: User) => void;
    onUserSelect: (user: User) => void;
    preselection?: { preAttachedSong: Song };
    setView: (vs: ViewState) => void;
    onLinkClick: (url: string) => void;
}

type FeedType = 'foryou' | 'following' | 'news';


const ArticleCard: React.FC<{ article: Article; onSelect: (url: string) => void }> = ({ article, onSelect }) => {
    const snippet = article.description.replace(/<[^>]+>/g, '').substring(0, 150);
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {article.thumbnail && <img src={article.thumbnail} alt={article.title} className="w-full h-48 object-cover cursor-pointer" onClick={() => onSelect(article.link)} loading="lazy" />}
            <div className="p-4 cursor-pointer" onClick={() => onSelect(article.link)}>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-500">{new Date(article.pubDate).toLocaleString()}</p>
                    {article.sourceFeedName && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            <RssIcon className="w-3 h-3" />
                            <span>{article.sourceFeedName}</span>
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 my-1 hover:text-brand-blue">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{snippet}...</p>
                <div className="flex justify-between items-center mt-auto">
                     <button onClick={(e) => {e.stopPropagation(); onSelect(article.link)}} className="text-brand-blue font-semibold hover:underline text-sm">Read More</button>
                     <SocialShare shareText={`Check out this article from Wamuzi Media: ${article.title}`} shareUrl={article.link} />
                </div>
            </div>
        </div>
    )
}

const SocialFeed: React.FC<SocialFeedProps> = ({ onArticleSelect, onViewStory, onUserSelect, preselection, setView, onLinkClick }) => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [feedType, setFeedType] = useState<FeedType>('foryou');
    const [sortOption, setSortOption] = useState<FeedSortOption>('recommended');
    const [promotingPost, setPromotingPost] = useState<Post | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [lastPostCount, setLastPostCount] = useState(socialService.getAllPosts().length);

    useEffect(() => {
        const handleSocialUpdate = () => {
            const newPostCount = socialService.getAllPosts().length;
            if (newPostCount !== lastPostCount) {
                setLastPostCount(newPostCount);
                setFeedItems([]);
                setPage(1);
                setHasMore(true);
            } else {
                setFeedItems(prevItems => prevItems.map(item => {
                    if (item.type !== 'post') return item;
                    
                    const updatedSelf = socialService.getPostById(item.id);
                    if (updatedSelf) {
                        return updatedSelf;
                    }

                    if (item.originalPost) {
                        const updatedOriginal = socialService.getPostById(item.originalPost.id);
                        if (updatedOriginal) {
                            return { ...item, originalPost: updatedOriginal };
                        }
                    }
                    
                    return item;
                }));
            }
        };

        socialService.subscribe(handleSocialUpdate);
        return () => socialService.unsubscribe(handleSocialUpdate);
    }, [lastPostCount]);

    useEffect(() => {
        const handleNewsUpdate = () => {
            if (feedType === 'news') {
                // Reset feed to trigger reload
                setFeedItems([]);
                setPage(1);
                setHasMore(true);
            }
        };

        newsService.subscribe(handleNewsUpdate);
        return () => newsService.unsubscribe(handleNewsUpdate);
    }, [feedType]);

    useEffect(() => {
        setFeedItems([]);
        setPage(1);
        setHasMore(true);
    }, [feedType, sortOption]);

    const loadMoreItems = useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        const limit = 5;
        let newItems: FeedItem[] = [];
        let newHasMore = false;

        switch(feedType) {
            case 'foryou': {
                const { items, hasMore } = socialService.getRecommendedFeedPaginated({ page, limit, sort: sortOption });
                newItems = items;
                newHasMore = hasMore;
                break;
            }
            case 'following': {
                 if (page === 1) {
                    const allFollowingPosts = socialService.getFollowingFeed();
                    let sortedItems = [...allFollowingPosts];
                     switch(sortOption) {
                        case 'newest':
                            break;
                        case 'most_liked':
                            sortedItems.sort((a,b) => b.likeCount - a.likeCount);
                            break;
                        case 'most_reposted':
                            sortedItems.sort((a,b) => b.repostCount - a.repostCount);
                            break;
                    }
                    newItems = sortedItems;
                }
                newHasMore = false;
                break;
            }
            case 'news': {
                const { articles, hasMore } = newsService.getArticlesPaginated({ page, limit });
                newItems = articles;
                newHasMore = hasMore;
                break;
            }
        }
        
        setFeedItems(prev => page === 1 ? newItems : [...prev, ...newItems]);
        setHasMore(newHasMore);
        setPage(prev => prev + 1);
        setIsLoading(false);
    }, [isLoading, hasMore, page, feedType, sortOption]);

    useEffect(() => {
        if (feedItems.length === 0 && hasMore) {
            loadMoreItems();
        }
    }, [feedType, sortOption, feedItems.length, hasMore, loadMoreItems]);

    const observer = useRef<IntersectionObserver>();
    const lastItemElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreItems();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, loadMoreItems]);
    
    const handlePromote = (postId: string) => {
        const postToPromote = socialService.getPostById(postId);
        if (postToPromote) setPromotingPost(postToPromote);
    };

    const TabButton: React.FC<{
        label: string;
        icon: React.ReactNode;
        isActive: boolean;
        onClick: () => void;
        hasNotification?: boolean;
    }> = ({ label, icon, isActive, onClick, hasNotification }) => (
        <button
            onClick={onClick}
            className={`w-full flex justify-center items-center gap-2 p-3 font-semibold text-sm transition-colors relative ${
                isActive ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:bg-gray-100'
            }`}
        >
            {icon}
            {label}
            {hasNotification && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>}
        </button>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
                <Stories onViewStory={onViewStory} />
                <CreatePost preselection={preselection} setView={setView} />

                <div className="bg-white shadow-md rounded-lg sticky top-[72px] z-10">
                    <div className="flex justify-around border-b">
                        <TabButton 
                            label="For You"
                            icon={<SparklesIcon className="w-5 h-5" />}
                            isActive={feedType === 'foryou'}
                            onClick={() => { setFeedType('foryou'); setSortOption('recommended'); }}
                        />
                        <TabButton 
                            label="Following"
                            icon={<UsersIcon className="w-5 h-5" />}
                            isActive={feedType === 'following'}
                            onClick={() => { setFeedType('following'); setSortOption('newest'); }}
                        />
                        <TabButton 
                            label="News"
                            icon={<NewspaperIcon className="w-5 h-5" />}
                            isActive={feedType === 'news'}
                            onClick={() => {
                                setFeedType('news');
                                newsService.markNewsAsSeen();
                            }}
                            hasNotification={newsService.getState().hasNew}
                        />
                    </div>
                    {(feedType === 'foryou' || feedType === 'following') && (
                        <div className="p-2 flex justify-end">
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value as FeedSortOption)} className="text-sm font-semibold bg-gray-100 border-transparent rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-brand-blue">
                                {feedType === 'foryou' && <option value="recommended">For You</option>}
                                <option value="newest">Newest</option>
                                <option value="most_liked">Most Liked</option>
                                <option value="most_reposted">Most Reposted</option>
                            </select>
                        </div>
                    )}
                </div>

                {feedItems.map((item, index) => {
                    const isLastElement = feedItems.length === index + 1;
                    const content = item.type === 'post' 
                        ? <PostCard key={item.id} post={item as Post} onUserSelect={onUserSelect} setView={setView} onPromote={handlePromote} onLinkClick={onLinkClick} />
                        : <ArticleCard key={item.id} article={item as Article} onSelect={onArticleSelect} />;
                    
                    if (isLastElement) {
                        return <div ref={lastItemElementRef} key={item.id}>{content}</div>;
                    }
                    return content;
                })}

                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-blue rounded-full animate-spin"></div>
                    </div>
                )}

                {!hasMore && feedItems.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>You've reached the end!</p>
                    </div>
                )}
            </div>
            {promotingPost && <CreateCampaignModal post={promotingPost} onClose={() => setPromotingPost(null)} />}
        </div>
    );
};

export default SocialFeed;