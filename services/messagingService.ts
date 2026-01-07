import { Conversation, DirectMessage, Story, User } from '../types';
import { userService } from './userService';

type Subscriber = (conversations: Conversation[]) => void;

class MessagingService {
    private conversations: Conversation[] = [];
    private subscribers: Subscriber[] = [];
    private isInitialized = false;

    constructor() {
        // Defer initialization to break circular dependency
    }

    private _initialize = () => {
        if (this.isInitialized) return;
        this.isInitialized = true; // Set flag early to prevent recursion

        const u = (id: string) => userService.getUserById(id)!;
        const currentUser = u('user-1');

        this.conversations = [
            {
                id: 'convo-1',
                participants: [currentUser, u('user-2')],
                unreadCount: 1,
                messages: [
                    { id: 'm1-1', sender: u('user-2'), content: 'Hey! Loved your post about the new synthwave track.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'read' },
                    { id: 'm1-2', sender: currentUser, content: 'Thanks! Glad you liked it.', createdAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(), status: 'read' },
                    { id: 'm1-3', sender: u('user-2'), content: 'For sure. We should exchange playlists sometime.', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'read' },
                    { id: 'm1-4', sender: currentUser, content: '', createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(), status: 'read', attachment: { type: 'image', url: 'https://picsum.photos/seed/meme/400/300' } },
                ],
            },
            {
                id: 'convo-2',
                participants: [currentUser, u('user-3')],
                unreadCount: 0,
                messages: [
                    { id: 'm2-1', sender: u('user-3'), content: 'Did you catch the news update this morning?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'read' },
                    { id: 'm2-2', sender: currentUser, content: 'I did! It was pretty interesting. More info here: https://wamuzinews.co.ke', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), status: 'delivered' },
                ],
            }
        ];
    }
    
    private notify = () => {
        this.subscribers.forEach(cb => cb(this.getConversations()));
    }
    
    subscribe = (callback: Subscriber) => {
        this._initialize();
        this.subscribers.push(callback);
        callback(this.getConversations());
    }

    unsubscribe = (callback: Subscriber) => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }
    
    getConversations = (): Conversation[] => {
        this._initialize();
        // Sort by most recent message
        return [...this.conversations].sort((a, b) => {
            const lastMsgA = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : 0;
            const lastMsgB = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : 0;
            return lastMsgB - lastMsgA;
        });
    }

    getConversationById = (id: string): Conversation | undefined => {
        this._initialize();
        return this.conversations.find(c => c.id === id);
    }
    
    sendMessage = (conversationId: string, content: string, attachment?: DirectMessage['attachment']) => {
        this._initialize();
        const convo = this.conversations.find(c => c.id === conversationId);
        const sender = userService.getCurrentUser();
        if (!convo || !sender || (!content.trim() && !attachment)) return;
        
        const newMessage: DirectMessage = {
            id: `msg-${Date.now()}`,
            sender,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            status: 'sent',
            attachment: attachment,
        };

        convo.messages.push(newMessage);
        this.notify();

        // Simulate status updates for demo purposes
        setTimeout(() => {
            newMessage.status = 'delivered';
            this.notify();
        }, 1000);

        setTimeout(() => {
            newMessage.status = 'read';
            this.notify();
        }, 2500);
    }
    
    startOrGetConversation = (userId: string): Conversation => {
        this._initialize();
        const currentUser = userService.getCurrentUser();
        if (!currentUser || userId === currentUser.id) {
            // This case should ideally be handled by the UI, but as a safeguard:
            throw new Error("Cannot start conversation with yourself or without being logged in.");
        }

        // Check if a conversation already exists
        let convo = this.conversations.find(c => 
            c.participants.length === 2 &&
            c.participants.some(p => p.id === currentUser.id) &&
            c.participants.some(p => p.id === userId)
        );

        // If not, create one
        if (!convo) {
            const otherUser = userService.getUserById(userId);
            if (!otherUser) throw new Error("User to start conversation with not found.");
            convo = {
                id: `convo-${Date.now()}`,
                participants: [currentUser, otherUser],
                messages: [],
                unreadCount: 0,
            };
            this.conversations.unshift(convo); // Add to beginning
            this.notify();
        }
        
        return convo;
    }
    
    sendMessageFromStory = (story: Story, content: string) => {
        this._initialize();
        const currentUser = userService.getCurrentUser();
        const recipient = story.author;

        if (!currentUser || !content.trim() || currentUser.id === recipient.id) return;

        const convo = this.startOrGetConversation(recipient.id);
        
        const storyReplyContent = `Replying to your story: "${content}"`;

        this.sendMessage(convo.id, storyReplyContent);
    }
}

export const messagingService = new MessagingService();