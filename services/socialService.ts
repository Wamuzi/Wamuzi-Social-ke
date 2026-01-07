import { FeedItem, Post, User, Story, Comment, UserAnalytics, AdminAnalytics, StoryComment, Song, Article, Group, Report, AdCampaign, PayoutDetails, FeedSortOption } from '../types';
import { newsService } from './newsService';
import { userService } from './userService';
import { notificationService } from './notificationService';

type Subscriber = () => void;
type StorySubscriber = (stories: Story[]) => void;

class SocialService {
    private posts: Post[] = [];
    private stories: Story[] = [];
    private subscribers: Subscriber[] = [];
    private storySubscribers: StorySubscriber[] = [];
    private analytics: Map<string, UserAnalytics> = new Map();
    private isInitialized = false;

    private groups: Group[] = [];
    private reports: Report[] = [];
    private campaigns: AdCampaign[] = [];
    private payoutDetails: PayoutDetails = {
        bank: { accountName: '', accountNumber: '', bankName: '', swiftCode: '' },
        paypal: { email: '' }
    };

    constructor() {
        this._initialize();
    }

    private _initialize = () => {
        if (this.isInitialized) return;
        this.isInitialized = true;

        const u = (id: string) => userService.getUserById(id)!;

        this.posts = [
             {
                id: 'post-poll-1', author: u('user-3'), content: 'What genre should the radio feature more of next week?',
                pubDate: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'post', likeCount: 25, repostCount: 3, isLiked: false, reactions: {'👍': Array.from({ length: 25 }, (_, i) => `voter-${i}`)}, comments: [],
                poll: { question: 'What genre should the radio feature more of next week?', options: [{ text: 'Indie Rock', votes: 12 }, { text: 'Classic Funk', votes: 8 }, { text: 'Ambient Lo-fi', votes: 5 },], voters: Array.from({ length: 25 }, (_, i) => `voter-${i}`), },
            },
            {
                id: 'post-1', author: u('user-2'), content: 'Just discovered Wamuzi Wave, this station is amazing! Loving the synthwave playlist. 🚀',
                pubDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'post', likeCount: 12, repostCount: 2, isLiked: false, reactions: {'❤️': ['user-1', 'user-3'], '😂': []},
                attachment: { type: 'image', url: 'https://picsum.photos/seed/synthwave/1200/800' },
                comments: [
                    { id: 'c1', author: u('user-3'), content: 'Right? It\'s my go-to for focusing.', pubDate: new Date(Date.now() - 1000 * 60 * 25).toISOString(), replies: [], likeCount: 2, isLiked: false },
                    { id: 'c2', author: u('user-1'), content: 'Welcome to the club!', pubDate: new Date(Date.now() - 1000 * 60 * 20).toISOString(), likeCount: 5, isLiked: true, replies: [
                         { id: 'c3', author: u('user-2'), content: 'Thanks!', pubDate: new Date(Date.now() - 1000 * 60 * 18).toISOString(), replies: [], likeCount: 1, isLiked: true }
                    ] },
                ]
            },
            {
                id: 'post-video-1', author: u('user-2'), content: 'Check out this cool reel!', pubDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                type: 'post', likeCount: 34, repostCount: 8, isLiked: true, reactions: {'❤️': ['user-1']}, comments: [], attachment: { type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' }, viewCount: 1254,
            },
            {
                id: 'post-2', author: u('user-3'), content: 'Excited for the weekend! What is everyone listening to?',
                pubDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'post', likeCount: 5, repostCount: 0, isLiked: true, reactions: {'❤️': ['user-1']}, comments: [],
            },
        ];
        
        this.stories = [
            { id: 'story-1', author: u('user-2'), mediaUrl: 'https://picsum.photos/seed/story1/1080/1920', mediaType: 'image', createdAt: new Date().toISOString(), likeCount: 5, isLiked: false, comments: [], viewCount: 23, viewers: [] },
            { id: 'story-2', author: u('user-3'), mediaUrl: 'https://picsum.photos/seed/story2/1080/1920', mediaType: 'image', createdAt: new Date().toISOString(), likeCount: 12, isLiked: true, comments: [ {id: 'sc-1', commenter: u('user-1'), content: 'Looks amazing!', createdAt: new Date().toISOString() } ], viewCount: 58, viewers: [] },
        ];
        
        this.groups = [
            { id: 'group-1', name: 'Synthwave Lovers', description: 'A group for fans of retro-futuristic synthwave music and aesthetics.', coverImageUrl: 'https://picsum.photos/seed/group1/800/400', members: ['user-1', 'user-2'], createdBy: 'user-2', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), type: 'group', privacy: 'private' },
            { id: 'group-2', name: 'Wamuzi News Fans', description: 'Discuss the latest articles and happenings from Wamuzi News.', coverImageUrl: 'https://picsum.photos/seed/group2/800/400', members: ['user-1', 'user-3'], createdBy: 'user-3', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), type: 'group', privacy: 'public' }
        ];

        this.reports = [
            { id: 'report-1', reporterId: 'user-3', contentId: 'post-2', contentType: 'post', reason: 'This seems like spam.', status: 'pending', createdAt: new Date().toISOString(), contentAuthorId: 'user-3' },
            { id: 'report-2', reporterId: 'user-2', contentId: 'user-4', contentType: 'profile', reason: 'User is impersonating someone.', status: 'pending', createdAt: new Date().toISOString(), contentAuthorId: 'user-4' },
        ];
        
        this.campaigns = [
            { id: 'camp-1', postId: 'post-video-1', creatorId: 'user-2', budget: 50, durationDays: 3, startDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), status: 'active', reach: 5432, clicks: 123 },
            { id: 'camp-2', postId: 'post-1', creatorId: 'user-2', budget: 20, durationDays: 1, startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), status: 'finished', reach: 2100, clicks: 45 },
            { id: 'camp-3', postId: 'post-2', creatorId: 'user-3', budget: 100, durationDays: 7, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), status: 'pending', reach: 0, clicks: 0 },
        ];
        
        const pollPost = this.posts.find(p => p.id === 'post-poll-1');
        if (pollPost) pollPost.groupId = 'group-2';

        newsService.subscribe(this.handleExternalUpdate);
        userService.getAllUsers().forEach(user => {
            const reelViews = this.posts.filter(p => p.author.id === user.id && p.attachment?.type === 'video').reduce((sum, reel) => sum + (reel.viewCount || 0), 0);
            this.analytics.set(user.id, { profileViews: Math.floor(Math.random() * 1000), postImpressions: Math.floor(Math.random() * 20000), engagementRate: parseFloat((Math.random() * 10).toFixed(2)), reelViews: reelViews, })
        });
    }

    private notify = () => {
        this.subscribers.forEach(callback => callback());
    }
    
    private notifyStories = () => {
        this.storySubscribers.forEach(callback => callback(this.getStories()));
    }
    
    private handleExternalUpdate = () => {
        this.notify();
    }

    subscribe = (callback: Subscriber) => { this.subscribers.push(callback); }
    unsubscribe = (callback: Subscriber) => { this.subscribers = this.subscribers.filter(cb => cb !== callback); }
    subscribeStories = (callback: StorySubscriber) => { this.storySubscribers.push(callback); callback(this.getStories()); }
    unsubscribeStories = (callback: StorySubscriber) => { this.storySubscribers = this.storySubscribers.filter(cb => cb !== callback); }
    
    getFollowingFeed = (): Post[] => {
        const currentUser = userService.getCurrentUser();
        if (!currentUser) return [];
        const followingIds = new Set(userService.getFriends().map(f => f.id));
        followingIds.add(currentUser.id);
        
        return this.posts
            .filter(post => followingIds.has(post.author.id))
            .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }

    getRecommendedFeed = (): FeedItem[] => {
        const recommendedPosts = [...this.posts].sort((a, b) => this.getPostScore(b) - this.getPostScore(a));
        return recommendedPosts;
    }
    
    getRecommendedFeedPaginated = ({ page = 1, limit = 5, sort = 'recommended' }: { page: number; limit: number; sort?: FeedSortOption }): { items: Post[], hasMore: boolean } => {
        let allItems: Post[];

        switch(sort) {
            case 'newest':
                allItems = [...this.posts].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
                break;
            case 'most_liked':
                allItems = [...this.posts].sort((a, b) => b.likeCount - a.likeCount);
                break;
            case 'most_reposted':
                allItems = [...this.posts].sort((a, b) => b.repostCount - a.repostCount);
                break;
            case 'recommended':
            default:
                 allItems = [...this.posts].sort((a, b) => this.getPostScore(b) - this.getPostScore(a));
                 break;
        }
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const items = allItems.slice(startIndex, endIndex);
        const hasMore = endIndex < allItems.length;
        return { items, hasMore };
    }

    private getPostScore = (post: Post) => {
        const gravity = 1.8;
        const hoursAgo = (Date.now() - new Date(post.pubDate).getTime()) / (1000 * 60 * 60);
        let score = (post.likeCount * 1 + post.comments.length * 1.5 + post.repostCount * 2);
        if (post.attachment?.type === 'video') score += (post.viewCount || 0) * 0.1;
        return score / Math.pow(hoursAgo + 2, gravity);
    }
    
    getPostById = (postId: string): Post | undefined => this.posts.find(p => p.id === postId);
    getPostsByUser = (userId: string): Post[] => this.posts.filter(p => p.author.id === userId || p.originalPost?.author.id === userId);
    getReels = (): Post[] => this.posts.filter(p => p.attachment?.type === 'video').sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    getAllPosts = (): Post[] => [...this.posts];
    
    getRecommendedReels = ({ page = 1, limit = 3 }: { page: number; limit: number; }): { reels: Post[], hasMore: boolean } => {
        const allReels = this.posts.filter(p => p.attachment?.type === 'video').sort((a, b) => this.getPostScore(b) - this.getPostScore(a));
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const reels = allReels.slice(startIndex, endIndex);
        const hasMore = endIndex < allReels.length;
        return { reels, hasMore };
    }
    
    incrementReelViewCount = (postId: string) => {
        const post = this.posts.find(p => p.id === postId);
        if (post && post.attachment?.type === 'video') {
            post.viewCount = (post.viewCount || 0) + 1;
            this.notify();
        }
    }

    getStories = (): Story[] => this.stories;
    getStoriesByUser = (userId: string): Story[] => this.stories.filter(story => story.author.id === userId);
    
    getUserAnalytics = (userId: string): UserAnalytics | undefined => {
        const currentAnalytics = this.analytics.get(userId);
        if (currentAnalytics) {
            currentAnalytics.profileViews++;
            currentAnalytics.reelViews = this.posts.filter(p => p.author.id === userId && p.attachment?.type === 'video').reduce((sum, reel) => sum + (reel.viewCount || 0), 0);
            return { ...currentAnalytics };
        }
        return undefined;
    }

    addPost = (content: string, attachment: Post['attachment'] | null, pollData?: { question: string; options: string[] }, audioTrack?: Song, groupId?: string) => {
        const currentUser = userService.getCurrentUser();
        if (!currentUser || (!content.trim() && !attachment && !pollData && !audioTrack)) return;
        if (currentUser.status === 'suspended') { alert("Your account is suspended. You cannot create posts."); return; }

        let finalAttachment: Post['attachment'] | undefined = attachment ? { ...attachment } : undefined;

        // If only a song is attached, create a reel from its album art
        if (audioTrack && !attachment) {
            finalAttachment = {
                type: 'video',
                url: audioTrack.albumArt,
                imageAsVideoUrl: audioTrack.albumArt,
            };
        } 
        // If an image and song are attached, convert to a reel
        else if (attachment?.type === 'image' && audioTrack) {
            finalAttachment = {
                type: 'video',
                url: attachment.url,
                imageAsVideoUrl: attachment.url,
            };
        }

        const newPost: Post = {
            id: `post-${Date.now()}`,
            author: currentUser,
            content: content.trim(),
            pubDate: new Date().toISOString(),
            type: 'post',
            likeCount: 0,
            repostCount: 0,
            isLiked: false,
            reactions: {},
            comments: [],
            attachment: finalAttachment,
            poll: pollData && pollData.question && pollData.options.length >= 2 ? {
                question: pollData.question,
                options: pollData.options.filter(opt => opt.trim()).map(opt => ({ text: opt, votes: 0 })),
                voters: []
            } : undefined,
            viewCount: finalAttachment?.type === 'video' ? 0 : undefined,
            audioTrack: audioTrack,
            groupId: groupId,
        };
        this.posts = [newPost, ...this.posts];
        this.notify();
    }
    
    addStory = (mediaUrl: string, mediaType: 'image' | 'video') => {
        const currentUser = userService.getCurrentUser();
        if (!currentUser) return;
        const newStory: Story = { id: `story-${Date.now()}`, author: currentUser, mediaUrl, mediaType, createdAt: new Date().toISOString(), likeCount: 0, isLiked: false, comments: [], viewCount: 0, viewers: [], };
        this.stories.unshift(newStory);
        this.notifyStories();
    }

    shareStoryAsPost = (story: Story) => {
        const currentUser = userService.getCurrentUser();
        if (!currentUser) return;

        const newPost: Post = {
            id: `post-${Date.now()}`,
            author: currentUser,
            content: `Check out this story from @${story.author.name}!`,
            pubDate: new Date().toISOString(),
            type: 'post',
            likeCount: 0,
            repostCount: 0,
            isLiked: false,
            reactions: {},
            comments: [],
            attachment: {
                type: story.mediaType,
                url: story.mediaUrl,
            },
        };

        this.posts.unshift(newPost);
        this.notify();
    };

    addCommentToStory = (storyId: string, content: string) => {
        const story = this.stories.find(s => s.id === storyId);
        const currentUser = userService.getCurrentUser();
        if (story && currentUser && content.trim()) {
            const newComment: StoryComment = {
                id: `sc-${Date.now()}`,
                commenter: currentUser,
                content: content.trim(),
                createdAt: new Date().toISOString(),
            };
            story.comments.push(newComment);
            notificationService.addNotification({ type: 'story_comment', user: currentUser }, story.author.id);
            this.notifyStories();
        }
    };

    viewStory = (storyId: string) => {
        const story = this.stories.find(s => s.id === storyId);
        const currentUser = userService.getCurrentUser();
        if (story && currentUser && !story.viewers.includes(currentUser.id)) {
            story.viewers.push(currentUser.id);
            story.viewCount = story.viewers.length;
            this.notifyStories();
        }
    }

    toggleReaction = (postId: string, reaction: string) => {
        const post = this.posts.find(p => p.id === postId || p.originalPost?.id === postId);
        if (!post) return;

        const targetPost = post.originalPost || post;
        const currentUser = userService.getCurrentUser();
        if (!currentUser || currentUser.status === 'suspended') return;

        if (!targetPost.reactions) {
            targetPost.reactions = {};
        }

        let userPreviousReaction: string | undefined;
        for (const emoji in targetPost.reactions) {
            const userIndex = targetPost.reactions[emoji].indexOf(currentUser.id);
            if (userIndex !== -1) {
                userPreviousReaction = emoji;
                targetPost.reactions[emoji].splice(userIndex, 1);
                if (targetPost.reactions[emoji].length === 0) {
                    delete targetPost.reactions[emoji];
                }
                break;
            }
        }

        if (userPreviousReaction !== reaction) {
            if (!targetPost.reactions[reaction]) {
                targetPost.reactions[reaction] = [];
            }
            targetPost.reactions[reaction].push(currentUser.id);
            if (currentUser.id !== targetPost.author.id) {
                notificationService.addNotification({ type: 'like', user: currentUser, post: targetPost }, targetPost.author.id);
            }
        }
        
        let totalReactions = 0;
        for (const emoji in targetPost.reactions) {
            totalReactions += targetPost.reactions[emoji].length;
        }
        targetPost.likeCount = totalReactions;
        targetPost.isLiked = Object.values(targetPost.reactions).some(users => users.includes(currentUser.id));
        this.notify();
    }
    
    toggleStoryReaction = (storyId: string, reaction: string) => {
        const story = this.stories.find(s => s.id === storyId);
        const currentUser = userService.getCurrentUser();
        if (!story || !currentUser || currentUser.status === 'suspended') return;
        
        if (!story.reactions) {
            story.reactions = {};
        }

        let userPreviousReaction: string | undefined;
        for (const emoji in story.reactions) {
            const userIndex = story.reactions[emoji].indexOf(currentUser.id);
            if (userIndex !== -1) {
                userPreviousReaction = emoji;
                story.reactions[emoji].splice(userIndex, 1);
                if (story.reactions[emoji].length === 0) {
                    delete story.reactions[emoji];
                }
                break;
            }
        }
        
        if (userPreviousReaction !== reaction) {
            if (!story.reactions[reaction]) {
                story.reactions[reaction] = [];
            }
            story.reactions[reaction].push(currentUser.id);
        }

        let totalReactions = 0;
        for (const emoji in story.reactions) {
            totalReactions += story.reactions[emoji].length;
        }
        story.likeCount = totalReactions;
        story.isLiked = Object.values(story.reactions).some(users => users.includes(currentUser.id));
        
        this.notifyStories();
    };

    private findAndModifyComment(comments: Comment[], commentId: string, action: (c: Comment) => void): boolean {
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            if (comment.id === commentId) {
                action(comment);
                return true;
            }
            if (comment.replies && this.findAndModifyComment(comment.replies, commentId, action)) {
                return true;
            }
        }
        return false;
    }

    private findAndRemoveComment(comments: Comment[], commentId: string): Comment[] {
        const newComments = comments.filter(c => c.id !== commentId);
        if (newComments.length !== comments.length) {
            return newComments;
        }
        return comments.map(c => {
            if (c.replies) {
                return { ...c, replies: this.findAndRemoveComment(c.replies, commentId) };
            }
            return c;
        });
    }

    toggleCommentReaction = (postId: string, commentId: string, reaction: string) => {
        const post = this.getPostById(postId);
        const currentUser = userService.getCurrentUser();
        if (!post || !currentUser || currentUser.status === 'suspended') return;

        this.findAndModifyComment(post.comments, commentId, (comment) => {
            if (!comment.reactions) {
                comment.reactions = {};
            }

            let userPreviousReaction: string | undefined;
            for (const emoji in comment.reactions) {
                const userIndex = comment.reactions[emoji].indexOf(currentUser.id);
                if (userIndex !== -1) {
                    userPreviousReaction = emoji;
                    comment.reactions[emoji].splice(userIndex, 1);
                    if (comment.reactions[emoji].length === 0) {
                        delete comment.reactions[emoji];
                    }
                    break;
                }
            }

            if (userPreviousReaction !== reaction) {
                if (!comment.reactions[reaction]) {
                    comment.reactions[reaction] = [];
                }
                comment.reactions[reaction].push(currentUser.id);
            }

            let totalReactions = 0;
            for (const emoji in comment.reactions) {
                totalReactions += comment.reactions[emoji].length;
            }
            comment.likeCount = totalReactions;
            comment.isLiked = Object.values(comment.reactions).some(users => users.includes(currentUser.id));
        });

        this.notify();
    };

    repost = (postId: string) => {
        const currentUser = userService.getCurrentUser();
        if(currentUser?.status === 'suspended') return;
        const originalPost = this.posts.find(p => p.id === postId);
        if (!currentUser || !originalPost || originalPost.originalPost) return;
        originalPost.repostCount++;
        const newPost: Post = { id: `repost-${Date.now()}`, author: currentUser, content: '', pubDate: new Date().toISOString(), type: 'post', likeCount: 0, repostCount: 0, isLiked: false, originalPost: originalPost, comments: [], };
        this.posts = [newPost, ...this.posts];
        notificationService.addNotification({ type: 'repost', user: currentUser, post: originalPost }, originalPost.author.id);
        this.notify();
    }
    
    addComment = (postId: string, content: string, parentCommentId?: string) => {
        const currentUser = userService.getCurrentUser();
        if(currentUser?.status === 'suspended') return;
        const post = this.posts.find(p => p.id === postId);
        if (!currentUser || !post || !content.trim()) return;
        const newComment: Comment = { id: `comment-${Date.now()}`, author: currentUser, content: content.trim(), pubDate: new Date().toISOString(), replies: [], likeCount: 0, isLiked: false, };
        if (parentCommentId) {
            const findParent = (comments: Comment[]): Comment | null => {
                for (const c of comments) { if (c.id === parentCommentId) return c; if (c.replies) { const found = findParent(c.replies); if (found) return found; } } return null;
            }
            const parent = findParent(post.comments);
            if (parent) { parent.replies = parent.replies ? [...parent.replies, newComment] : [newComment]; notificationService.addNotification({ type: 'reply', user: currentUser, post }, parent.author.id); }
        } else { post.comments.push(newComment); notificationService.addNotification({ type: 'comment', user: currentUser, post }, post.author.id); }
        this.notify();
    }

    deleteComment = (postId: string, commentId: string) => {
        const post = this.getPostById(postId);
        if (post) {
            post.comments = this.findAndRemoveComment(post.comments, commentId);
            this.notify();
        }
    };

    deletePost = (postId: string) => {
        this.posts = this.posts.filter(p => p.id !== postId && p.originalPost?.id !== postId);
        this.notify();
    }

    editPost = (postId: string, newContent: string) => {
        const post = this.getPostById(postId);
        if (post) {
            post.content = newContent;
            this.notify();
        }
    };

    getAdminAnalytics = (): AdminAnalytics => {
        const allUsers = userService.getAllUsers();
        const followerGrowth = userService.getFollowerGrowthData();
        const totalUsers = allUsers.length;
        const totalPosts = this.posts.length;
        const totalInteractions = this.posts.reduce((acc, p) => acc + p.likeCount + p.repostCount + p.comments.length, 0);
        const topPosts = [...this.posts].sort((a, b) => (b.likeCount + b.repostCount) - (a.likeCount + a.repostCount)).slice(0, 5);
        return {
            totalUsers, activeUsers: allUsers.filter(u => u.status === 'active').length, userGrowth: [{ month: 'Jan', count: 120 }, { month: 'Feb', count: 180 }, { month: 'Mar', count: 250 }, { month: 'Apr', count: 400 }, { month: 'May', count: totalUsers }],
            followerGrowth, totalPosts, engagementRate: totalPosts > 0 ? parseFloat((totalInteractions / totalPosts).toFixed(2)) : 0, topPosts
        }
    }

    // Group Methods
    getGroups = (): Group[] => [...this.groups];
    getGroupById = (groupId: string): Group | undefined => this.groups.find(g => g.id === groupId);
    getPostsForGroup = (groupId: string): Post[] => {
        const group = this.getGroupById(groupId);
        const currentUser = userService.getCurrentUser();
        if (group?.privacy === 'private' && !group.members.includes(currentUser?.id || '')) {
            return [];
        }
        return this.posts.filter(p => p.groupId === groupId).sort((a,b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }

    createGroup = (groupData: { name: string; description: string; coverImageUrl: string; privacy: 'public' | 'private' }) => {
        const currentUser = userService.getCurrentUser();
        if (!currentUser) return;
        const newGroup: Group = {
            ...groupData,
            id: `group-${Date.now()}`,
            createdBy: currentUser.id,
            members: [currentUser.id],
            createdAt: new Date().toISOString(),
            type: 'group',
        };
        this.groups.unshift(newGroup);
        this.notify();
    };
    
    editGroup = (groupId: string, updates: Partial<Pick<Group, 'name' | 'description' | 'coverImageUrl' | 'privacy'>>) => {
        const group = this.getGroupById(groupId);
        const currentUser = userService.getCurrentUser();
        if(group && (group.createdBy === currentUser?.id || currentUser?.role === 'admin')) {
            const finalUpdates = { ...updates };

            // Handle image removal
            if (finalUpdates.coverImageUrl === '') {
                // If the name is also being updated, use the new name for the seed.
                const groupNameForSeed = finalUpdates.name || group.name;
                finalUpdates.coverImageUrl = `https://picsum.photos/seed/${encodeURIComponent(groupNameForSeed)}/800/400`;
            }

            Object.assign(group, finalUpdates);
            this.notify();
        }
    };
    
    deleteGroup = (groupId: string) => {
        this.groups = this.groups.filter(g => g.id !== groupId);
        this.posts = this.posts.filter(p => p.groupId !== groupId);
        this.notify();
    };

    joinGroup = (groupId: string) => {
        const currentUser = userService.getCurrentUser();
        const group = this.getGroupById(groupId);
        if (currentUser && group && !group.members.includes(currentUser.id)) {
            group.members.push(currentUser.id);
            this.notify();
        }
    };
    
    leaveGroup = (groupId: string) => {
        const currentUser = userService.getCurrentUser();
        const group = this.getGroupById(groupId);
        if (currentUser && group) {
            group.members = group.members.filter(id => id !== currentUser.id);
            this.notify();
        }
    };

    addMemberToGroup = (groupId: string, userId: string) => {
        const group = this.getGroupById(groupId);
        if (group && !group.members.includes(userId)) {
            group.members.push(userId);
            this.notify();
        }
    };
    
    // Report Methods
    reportContent = (contentId: string, contentType: 'post' | 'profile', reason: string) => {
        const currentUser = userService.getCurrentUser();
        if (!currentUser) return;
        
        let contentAuthorId = '';
        if (contentType === 'post') {
            const post = this.getPostById(contentId);
            contentAuthorId = post?.author.id || '';
        } else {
            contentAuthorId = contentId;
        }

        const newReport: Report = {
            id: `report-${Date.now()}`,
            reporterId: currentUser.id,
            contentId,
            contentType,
            reason,
            status: 'pending',
            createdAt: new Date().toISOString(),
            contentAuthorId
        };
        this.reports.push(newReport);
        this.notify();
    };
    
    getPendingReports = (): Report[] => this.reports.filter(r => r.status === 'pending');
    
    updateReportStatus = (reportId: string, status: 'pending' | 'reviewed') => {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            report.status = status;
            this.notify();
        }
    };
    
    // Campaign Methods
    createCampaign = (postId: string, budget: number, durationDays: number) => {
        const currentUser = userService.getCurrentUser();
        if(!currentUser) return;
        const newCampaign: AdCampaign = {
            id: `camp-${Date.now()}`,
            postId,
            creatorId: currentUser.id,
            budget,
            durationDays,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            reach: 0,
            clicks: 0,
        };
        this.campaigns.push(newCampaign);
        notificationService.addNotification({ type: 'campaign_creation', user: currentUser, campaign: newCampaign }, currentUser.id);
        this.notify();
    };

    getAllCampaigns = (): AdCampaign[] => [...this.campaigns];
    getCampaignsByUser = (userId: string): AdCampaign[] => this.campaigns.filter(c => c.creatorId === userId);

    approveCampaign = (campaignId: string) => {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (campaign) {
            campaign.status = 'active';
            notificationService.addNotification({ type: 'campaign_status', user: userService.getUserById('user-1')!, campaign: campaign, post: this.getPostById(campaign.postId)}, campaign.creatorId);
            this.notify();
        }
    };

    rejectCampaign = (campaignId: string) => {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (campaign) {
            campaign.status = 'rejected';
            notificationService.addNotification({ type: 'campaign_status', user: userService.getUserById('user-1')!, campaign: campaign, post: this.getPostById(campaign.postId) }, campaign.creatorId);
            this.notify();
        }
    };
    
    getTotalAdRevenue = (): number => {
        return this.campaigns
            .filter(c => c.status === 'active' || c.status === 'finished')
            .reduce((sum, c) => sum + c.budget, 0);
    };
    
    // Payout Methods
    getPayoutDetails = (): PayoutDetails => this.payoutDetails;
    
    updatePayoutDetails = (details: PayoutDetails) => {
        this.payoutDetails = details;
        this.notify();
    };
}

export const socialService = new SocialService();