import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import { HeartIcon, RepostIcon, CommentIcon, AtSymbolIcon } from './icons/Icons';

interface NotificationsPanelProps {
    onClose: () => void;
}

const PromoteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);


const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const { type, user, post, campaign } = notification;

    const renderIcon = () => {
        switch(type) {
            case 'like': return <HeartIcon className="w-5 h-5 text-red-500" isFilled />;
            case 'repost': return <RepostIcon className="w-5 h-5 text-green-500" />;
            case 'comment': return <CommentIcon className="w-5 h-5 text-blue-500" />;
            case 'follow': return <AtSymbolIcon className="w-5 h-5 text-purple-500" />;
            case 'campaign_status':
            case 'campaign_creation':
                return <PromoteIcon className="w-5 h-5 text-teal-500" />;
            default: return null;
        }
    };

    const renderText = () => {
        let actionText = '';
        switch(type) {
            case 'like': actionText = 'liked your post'; break;
            case 'repost': actionText = 'reposted your post'; break;
            case 'comment': actionText = 'commented on your post'; break;
            case 'follow': actionText = 'started following you'; break;
            case 'campaign_status':
                const postPreview = post?.content ? `"${post.content.substring(0,20)}..."` : 'your post';
                actionText = `Your campaign for ${postPreview} is now ${campaign?.status}.`;
                break;
            case 'campaign_creation':
                 actionText = `started a new $${campaign?.budget} campaign. Payment processed.`;
                 break;
            default: return null;
        }
        return (
            <p className="text-sm text-gray-700">
                <span className="font-semibold">{user.name}</span> {actionText}
            </p>
        )
    };

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
            <div className="mt-1">{renderIcon()}</div>
            <div className="flex-grow">
                {renderText()}
                <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
             {!notification.read && <div className="w-2 h-2 bg-brand-blue rounded-full self-center flex-shrink-0"></div>}
        </div>
    )
};


const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
    const [notifications, setNotifications] = useState(notificationService.getState().notifications);

    useEffect(() => {
        const sub = (state: { notifications: Notification[] }) => {
            setNotifications(state.notifications);
        }
        notificationService.subscribe(sub);
        return () => notificationService.unsubscribe(sub);
    }, []);

    return (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-30">
            <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                ) : (
                    <p className="p-4 text-center text-sm text-gray-500">You have no new notifications.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;