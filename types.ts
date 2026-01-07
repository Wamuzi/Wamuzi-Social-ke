export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  bio: string;
  email: string;
  password?: string;
  status: 'active' | 'suspended';
  role: 'user' | 'moderator' | 'admin';
  isOnline?: boolean;
  lastSeen?: string; // ISO 8601 format
  isArtist?: boolean;
  isVerified?: boolean;
  skills?: string[];
  experience?: string;
  payoutDetails?: PayoutDetails;
}

export interface Comment {
    id: string;
    author: User;
    content: string;
    pubDate: string; // ISO 8601 format
    replies?: Comment[];
    likeCount: number;
    isLiked: boolean;
    reactions?: Record<string, string[]>; // { '❤️': ['user-1'], '😂': ['user-2'] }
}

export interface Post {
  id: string;
  author: User;
  content: string;
  pubDate: string; // ISO 8601 format
  type: 'post';
  likeCount: number;
  repostCount: number;
  isLiked: boolean; // Represents if the current user has liked this post
  reactions?: Record<string, string[]>; // { '❤️': ['user-1'], '😂': ['user-2'] }
  originalPost?: Post; // If this is a repost, this links to the original
  comments: Comment[];
  attachment?: {
    type: 'image' | 'video';
    url: string;
    imageAsVideoUrl?: string; // URL of image to display for a "video" post
  };
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    voters: string[]; // Store user IDs who have voted
  };
  viewCount?: number;
  audioTrack?: Song;
  groupId?: string; // ID of the group this post belongs to
  reach?: number;
  shares?: number;
  profileVisits?: number;
  isSponsored?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  members: string[]; // array of user IDs
  createdBy: string; // user ID
  createdAt: string; // ISO 8601 format
  type: 'group';
  privacy: 'public' | 'private';
}

export interface AdCampaign {
    id: string;
    postId: string;
    creatorId: string;
    budget: number;
    durationDays: number;
    startDate: string; // ISO 8601 format
    endDate: string; // ISO 8601 format
    status: 'pending' | 'active' | 'finished' | 'rejected';
    reach: number;
    clicks: number;
}

export interface StoryComment {
  id: string;
  commenter: User;
  content: string;
  createdAt: string; // ISO 8601 format
}

export interface Story {
  id: string;
  author: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string; // ISO 8601 format
  likeCount: number;
  isLiked: boolean;
  reactions?: Record<string, string[]>; // { '❤️': ['user-1'], '😂': ['user-2'] }
  comments: StoryComment[];
  viewCount: number;
  viewers: string[]; // Array of user IDs who have viewed
}

export interface ArtistApplication {
    id: string;
    user: User;
    screenshotUrl: string; // base64 data URL
    notes: string;
    contactInfo: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
}

export interface VerificationRequest {
    id: string;
    user: User;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    type: 'organic' | 'paid';
}

export interface Report {
    id: string;
    reporterId: string;
    contentId: string; // Can be a postId or userId
    contentType: 'post' | 'profile';
    reason: string;
    status: 'pending' | 'reviewed';
    createdAt: string;
    contentAuthorId: string;
}


export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'repost' | 'reply' | 'story_comment' | 'group_post' | 'mention' | 'campaign_status' | 'campaign_creation';
    user: User; // The user who initiated the action (or system for campaigns)
    post?: Post; // The post that was interacted with (optional)
    group?: Group; // The group that was interacted with
    campaign?: AdCampaign; // The campaign that was updated
    read: boolean;
    createdAt: string; // ISO 8601 format
    recipientId: string; // The ID of the user who should receive this notification
}

export interface DirectMessage {
    id: string;
    sender: User;
    content: string;
    createdAt: string;
    status: 'sent' | 'delivered' | 'read';
    attachment?: {
        type: 'image' | 'audio' | 'document';
        url: string;
        fileName?: string;
    };
}

export interface Conversation {
    id: string;
    participants: User[];
    messages: DirectMessage[];
    unreadCount: number;
}

export interface UserAnalytics {
    profileViews: number;
    postImpressions: number;
    engagementRate: number; // as a percentage
    reelViews: number;
}

export interface AdminAnalytics {
    totalUsers: number;
    activeUsers: number;
    userGrowth: { month: string; count: number }[];
    followerGrowth: { month: string; count: number }[];
    totalPosts: number;
    engagementRate: number;
    topPosts: Post[];
}

export interface Song {
  id: string;
  title: string;
  artist: string; // Artist display name
  artistId?: string; // Links to User ID
  albumArt: string;
  duration: number; // in seconds
  url: string; // data URL for the audio file
  playCount: number;
  category?: string;
  isFeatured?: boolean;
  distributor?: string;
}

export interface Station {
  id:string;
  name: string;
  streamUrl: string;
  logoUrl: string;
  isPlaylistBased?: boolean; // To differentiate our curated station from external streams
}

export interface LiveReaction {
    id: string;
    emoji: string;
    // For positioning, not storing user data for this simple feature
    left: number; 
    animationDuration: number;
}

export interface LiveComment {
    id: string;
    user: User;
    comment: string;
}

export interface RadioState {
  isPlaying: boolean;
  stations: Station[];
  currentStationId: string | null;
  // Properties for the playlist-based station
  currentSong: Song | null;
  playlist: Song[];
  musicLibrary: Song[];
  songRequests: Song[];
  listeners: number;
  playbackPosition: number; // in seconds
  volume: number;
  liveReactions: LiveReaction[];
  liveComments: LiveComment[];
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  imageUrl?: string;
}

export interface Article {
    id: string;
    title: string;
    author: string;
    link: string;
    pubDate: string;
    thumbnail: string;
    description: string;
    content: string;
    categories: string[];
    sourceFeedName?: string;
    feedId?: string;
    type: 'article';
}

export interface NewsState {
    articles: Article[];
    feeds: RSSFeed[];
    hasNew: boolean;
    isMonetizationActive: boolean;
    adContent: string;
    adImageUrl?: string;
    adLinkUrl?: string;
}

export interface PayoutDetails {
  bank: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode: string;
  };
  paypal: {
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isResponding: boolean;
}

export interface LinkPreview {
  url: string;
  domain: string;
  title: string;
  description: string;
  image: string;
}

export type FeedSortOption = 'recommended' | 'newest' | 'most_liked' | 'most_reposted';

export interface DistributorTrack {
  id: string;
  title: string;
  artistName: string;
  albumArt: string;
  audioUrl: string;
  duration: number;
  distributor: string;
  submittedAt: string;
  isPriority?: boolean;
}

export interface PayoutRecord {
    id: string;
    artistId: string;
    amount: number;
    processedDate: string;
    method: 'Bank Transfer' | 'PayPal' | 'Tip';
    type: 'royalty' | 'bonus' | 'tip';
    notes?: string;
}

export interface ArtistEarnings {
    lifetimeEarnings: number;
    availableBalance: number;
    lifetimeTips: number;
    availableTipBalance: number;
    lastPayoutDate?: string;
    payoutRequested: boolean;
}

export interface DistributorAnalytics {
    totalPlays: number;
    topPerformingSongs: Song[];
    peakListeningTimes: { hour: string; plays: number }[];
    listenerDemographics: { ageRange: string; percentage: number }[];
}

export interface PlatformRevenue {
    fromRoyalties: number;
    fromTips: number;
    fromAds: number;
    total: number;
}


export type FeedItem = Post | Article | Group;