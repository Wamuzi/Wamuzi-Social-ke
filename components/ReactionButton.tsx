import React, { useState, useRef } from 'react';
import { userService } from '../services/userService';
import { HeartIcon } from './icons/Icons';

interface ReactionButtonProps {
    onReact: (reaction: string) => void;
    reactions: Record<string, string[]> | undefined;
    likeCount: number;
    size?: 'sm' | 'base';
    textColor?: string;
}

const EMOJIS = ['❤️', '😂', '😯', '😢', '😡', '👍'];

const ReactionButton: React.FC<ReactionButtonProps> = ({ onReact, reactions, likeCount, size = 'base', textColor = 'text-gray-500' }) => {
    const [showReactions, setShowReactions] = useState(false);
    const hideTimeoutRef = useRef<number | null>(null);
    const currentUser = userService.getCurrentUser();

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setShowReactions(true);
    };

    const handleMouseLeave = () => {
        hideTimeoutRef.current = window.setTimeout(() => {
            setShowReactions(false);
        }, 300);
    };

    const handleReactionClick = (e: React.MouseEvent, emoji: string) => {
        e.stopPropagation();
        onReact(emoji);
        setShowReactions(false);
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
    };

    const userReaction = currentUser ? Object.keys(reactions || {}).find(r => reactions![r].includes(currentUser!.id)) : undefined;

    // FIX: TypeScript infers the value part of Object.entries on a Record as `unknown`.
    // We cast the value to `string[]` to allow accessing the `length` property for sorting.
    const topReactions = Object.entries(reactions || {})
        .sort((a, b) => (b[1] as string[]).length - (a[1] as string[]).length)
        .slice(0, 3)
        .map(entry => entry[0]);

    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
    const popoverEmojiSize = size === 'sm' ? 'text-xl' : 'text-2xl';

    return (
        <div
            className="relative flex items-center gap-1.5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {showReactions && (
                <div className="absolute bottom-full mb-2 flex gap-1 bg-white shadow-lg rounded-full p-1 ring-1 ring-gray-200 z-10">
                    {EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={(e) => handleReactionClick(e, emoji)}
                            className={`p-1.5 rounded-full hover:bg-gray-200 transition-transform transform hover:scale-125 ${popoverEmojiSize}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={(e) => handleReactionClick(e, userReaction || '❤️')}
                title="Like"
                className={`flex items-center gap-1.5 group transition-colors duration-200 ${userReaction ? 'text-red-500' : `${textColor.replace('text-','hover:text-')} hover:text-red-500`}`}
            >
                <div className={`p-1.5 rounded-full transition-colors duration-200 ${userReaction ? `bg-red-500/10` : 'group-hover:bg-gray-100'}`}>
                    {userReaction ? <span className={size === 'sm' ? 'text-base' : 'text-lg'}>{userReaction}</span> : <HeartIcon className={iconSize} />}
                </div>
            </button>
             <div className="flex items-center">
                {topReactions.map((emoji, index) => <span key={emoji} className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} ${index > 0 ? '-ml-1' : ''}`}>{emoji}</span>)}
                {likeCount > 0 && <span className={`${textSize} font-medium ${textColor} ml-1`}>{likeCount}</span>}
            </div>
        </div>
    );
}

export default ReactionButton;
