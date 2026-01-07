import { Notification, Post, User, AdCampaign, Group } from '../types';
import { userService } from './userService';

type NotificationSubscriber = (state: { notifications: Notification[], unreadCount: number }) => void;

// Defines the data required to create a notification.
type NotificationPayload = {
    type: Notification['type'];
    user: User;
    post?: Post;
    group?: Group;
    campaign?: AdCampaign;
}

class NotificationService {
    private state: { notifications: Notification[], unreadCount: number } = { notifications: [], unreadCount: 0 };
    private subscribers: NotificationSubscriber[] = [];
    private isInitialized = false;

    constructor() {
        // Defer initialization to break circular dependency
    }

    private _initialize = () => {
        if (this.isInitialized) return;
        this.isInitialized = true; // Set flag early to prevent recursion

        const MOCK_NOTIFICATIONS: Notification[] = [
            { 
                id: 'n1', 
                type: 'follow', 
                user: userService.getUserById('user-4')!, 
                read: false, 
                createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                recipientId: 'user-1' // This notification is for the current user
            },
        ];
        this.state = {
            notifications: MOCK_NOTIFICATIONS,
            unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
        };
    }

    private notify = () => {
        this.state.unreadCount = this.state.notifications.filter(n => !n.read).length;
        this.subscribers.forEach(cb => cb({ ...this.state }));
    }

    subscribe = (callback: NotificationSubscriber) => {
        this._initialize();
        this.subscribers.push(callback);
        callback(this.state);
    }

    unsubscribe = (callback: NotificationSubscriber) => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }

    getState = (): { notifications: Notification[], unreadCount: number } => {
        this._initialize();
        return this.state;
    }

    addNotification = (payload: NotificationPayload, recipientId: string) => {
        this._initialize();
        // Don't notify users of their own actions
        if (payload.user.id === recipientId) {
            return;
        }

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: payload.type,
            user: payload.user,
            post: payload.post,
            group: payload.group,
            campaign: payload.campaign,
            read: false,
            createdAt: new Date().toISOString(),
            recipientId: recipientId,
        };
        this.state.notifications.unshift(newNotification);
        this.notify();
    }

    markAllAsRead = () => {
        this._initialize();
        this.state.notifications.forEach(n => n.read = true);
        this.notify();
    }
}

export const notificationService = new NotificationService();