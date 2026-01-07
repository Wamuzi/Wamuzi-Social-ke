import React, { useState, useEffect, useRef } from 'react';
import Player from './components/Player';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import SocialFeed from './components/SocialFeed';
import InAppBrowser from './components/InAppBrowser';
import Login from './components/Login';
import StoryViewer from './components/StoryViewer';
import ProfileView from './components/ProfileView';
import DirectMessagesView from './components/DirectMessagesView';
import ReelsView from './components/ReelsView';
import SettingsView from './components/SettingsView';
import GroupsView from './components/GroupsView';
import GroupDetailView from './components/GroupDetailView';
import AdCenterView from './components/AdCenterView';
import ChatbotView from './components/ChatbotView';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import MiniPlayer from './components/MiniPlayer';
import { newsService } from './services/newsService';
import { userService } from './services/userService';
import { socialService } from './services/socialService';
import { radioService } from './services/radioService';
import { Article, User, RadioState, Notification, NewsState } from './types';
import { notificationService } from './services/notificationService';

export type View = 'feed' | 'player' | 'reels' | 'profile' | 'messages' | 'settings' | 'groups' | 'groupDetail' | 'adCenter' | 'chatbot';
export interface ViewState {
    view: View;
    data?: any; // e.g., { userId: string } for profile, { conversationId: string } for DMs
}

const App: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(userService.getCurrentUser());
    const [viewState, setViewState] = useState<ViewState>({ view: 'feed' });
    const [browsingUrl, setBrowsingUrl] = useState<string | null>(null);
    const [viewingStoryUser, setViewingStoryUser] = useState<User | null>(null);
    const [radioState, setRadioState] = useState<RadioState>(radioService.getState());

    const wasRadioPlayingBeforeReels = useRef(false);
    const prevViewRef = useRef<View>();
    const lastNotifiedArticleId = useRef<string | null>(null);

    useEffect(() => {
        const handleUserChange = () => {
            setCurrentUser(userService.getCurrentUser());
        }
        userService.subscribe(handleUserChange);

        const handleRadioChange = (newState: RadioState) => setRadioState(newState);
        radioService.subscribe(handleRadioChange);

        // Request notification permission on app load
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        // === NOTIFICATION SUBSCRIPTIONS ===

        // 1. Social Notifications
        let lastUnreadCount = notificationService.getState().unreadCount;
        const handleNewNotification = (state: { notifications: Notification[], unreadCount: number }) => {
            if (state.unreadCount > lastUnreadCount) {
                const latestNotification = state.notifications[0];
                if (document.visibilityState === 'hidden' && Notification.permission === 'granted' && latestNotification.recipientId === currentUser?.id) {
                    let body = '';
                    switch (latestNotification.type) {
                        case 'follow': body = `${latestNotification.user.name} started following you.`; break;
                        case 'like': body = `${latestNotification.user.name} liked your post.`; break;
                        case 'comment': body = `${latestNotification.user.name} commented: "${latestNotification.post?.comments[latestNotification.post.comments.length-1].content.substring(0, 50)}..."`; break;
                        case 'reply': body = `${latestNotification.user.name} replied to your comment.`; break;
                        default: body = `You have a new notification from ${latestNotification.user.name}.`;
                    }
                    new window.Notification('Wamuzi Social', { body, icon: latestNotification.user.avatarUrl });
                }
            }
            lastUnreadCount = state.unreadCount;
        };
        notificationService.subscribe(handleNewNotification);

        // 2. News Notifications
        const handleNewsUpdate = (newsState: NewsState) => {
            if (newsState.hasNew && newsState.articles.length > 0) {
                const latestArticle = newsState.articles[0];
                if (latestArticle.id !== lastNotifiedArticleId.current) {
                     if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
                        const body = latestArticle.title;
                        new window.Notification('Wamuzi News Update', { body, icon: latestArticle.thumbnail || 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png' });
                        lastNotifiedArticleId.current = latestArticle.id;
                        newsService.markNewsAsSeen();
                    }
                }
            }
        };
        newsService.subscribe(handleNewsUpdate);
        newsService.fetchArticles(); // Initial fetch
        const newsInterval = setInterval(() => newsService.fetchArticles(), 5 * 60 * 1000);


        return () => {
            userService.unsubscribe(handleUserChange);
            radioService.unsubscribe(handleRadioChange);
            notificationService.unsubscribe(handleNewNotification);
            newsService.unsubscribe(handleNewsUpdate);
            clearInterval(newsInterval);
        };
    }, [currentUser]);

    useEffect(() => {
        const prevView = prevViewRef.current;

        // Handle entering/leaving reels view to manage background audio
        if (viewState.view === 'reels' && prevView !== 'reels') { // Entering reels
            if (radioService.getState().isPlaying) {
                wasRadioPlayingBeforeReels.current = true;
                radioService.stop(); // Pauses the global player
            }
        } else if (viewState.view !== 'reels' && prevView === 'reels') { // Leaving reels
            if (wasRadioPlayingBeforeReels.current) {
                // Only resume if radio isn't already playing (e.g., user started it from mini player while in reels)
                if (!radioService.getState().isPlaying) {
                    radioService.togglePlay();
                }
                wasRadioPlayingBeforeReels.current = false;
            }
        }
        
        prevViewRef.current = viewState.view;
    }, [viewState.view]);

    const handleOpenUrl = (url: string) => {
        setBrowsingUrl(url);
    };

    const handleCloseBrowser = () => {
        setBrowsingUrl(null);
    };
    
    const handleViewStory = (user: User) => {
        setViewingStoryUser(user);
    }
    
    const handleCloseStory = () => {
        setViewingStoryUser(null);
    }

    const renderMainView = () => {
        switch (viewState.view) {
            case 'profile':
                const profileUser = userService.getUserById(viewState.data.userId);
                return profileUser ? <ProfileView user={profileUser} setView={setViewState} onUserSelect={(user) => setViewState({ view: 'profile', data: { userId: user.id } })} /> : <div>User not found</div>;
            case 'messages':
                return <DirectMessagesView initialConversationId={viewState.data?.conversationId} />;
            case 'player':
                 return <Player setView={setViewState} />;
            case 'reels':
                return <ReelsView setView={setViewState} />;
            case 'settings':
                return <SettingsView />;
            case 'groups':
                return <GroupsView setView={setViewState} />;
            case 'groupDetail':
                return <GroupDetailView groupId={viewState.data.groupId} setView={setViewState} onUserSelect={(user) => setViewState({ view: 'profile', data: { userId: user.id } })} />;
            case 'adCenter':
                return <AdCenterView setView={setViewState} />;
            case 'chatbot':
                return <ChatbotView setView={setViewState} />;
            case 'feed':
            default:
                return <SocialFeed onArticleSelect={handleOpenUrl} onViewStory={handleViewStory} onUserSelect={(user) => setViewState({ view: 'profile', data: { userId: user.id } })} preselection={viewState.data} setView={setViewState} onLinkClick={handleOpenUrl} />;
        }
    };

    const showMiniPlayer = radioState.isPlaying && viewState.view !== 'player';

    const MainAppInterface = () => (
        <>
            <Header currentView={viewState.view} setView={setViewState} isAdmin={false} viewState={viewState} />
            <main className={`p-4 sm:p-6 md:p-8 ${['reels', 'messages', 'groupDetail', 'chatbot', 'player'].includes(viewState.view) ? '!p-0' : ''} ${showMiniPlayer ? 'pb-24' : ''}`}>
                {renderMainView()}
            </main>
        </>
    );

    const AdminInterface = () => (
         <>
            <Header currentView="admin" setView={() => {}} isAdmin={true} />
            <main className="p-4 sm:p-6 md:p-8">
                <AdminDashboard />
            </main>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <GlobalAudioPlayer />
            {isAdmin ? <AdminInterface /> : !currentUser ? <Login/> : <MainAppInterface />}
            {!browsingUrl && currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                 <footer className="text-center p-4 text-xs text-gray-500">
                    <button onClick={() => setIsAdmin(!isAdmin)} className="hover:text-brand-blue transition">
                        Toggle Admin Panel
                    </button>
                </footer>
            )}
            {viewingStoryUser && (
                <StoryViewer 
                    stories={socialService.getStoriesByUser(viewingStoryUser.id)}
                    onClose={handleCloseStory}
                />
            )}
            {browsingUrl && <InAppBrowser url={browsingUrl} onClose={handleCloseBrowser} />}
            {showMiniPlayer && currentUser && <MiniPlayer setView={setViewState} />}
        </div>
    );
};

export default App;