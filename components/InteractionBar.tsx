import React, { useState } from 'react';
import { RepostIcon, CommentIcon, ShareIcon, AddToStoryIcon } from './icons/Icons';
import { Post } from '../types';
import SocialShare from './SocialShare';
import { userService } from '../services/userService';
import ReactionButton from './ReactionButton';

interface InteractionBarProps {
    post: Post;
    onReact: (reaction: string) => void;
    onRepost: (postId: string) => void;
    onCommentClick: () => void;
    onShareToStory?: () => void;
    onCreateCampaign: (postId: string) => void;
}

const PromoteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);

const InteractionBar: React.FC<InteractionBarProps> = ({ post, onReact, onRepost, onCommentClick, onShareToStory, onCreateCampaign }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const currentUser = userService.getCurrentUser();
    const isAuthor = currentUser?.id === post.author.id;
    
    return (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
                <button
                    onClick={onCommentClick}
                    title="Comment"
                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 group transition-colors"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors"><CommentIcon className="w-5 h-5" /></div>
                    {post.comments.length > 0 && <span className="text-sm font-medium">{post.comments.length}</span>}
                </button>
                 <button
                    onClick={() => onRepost(post.id)}
                    title="Repost"
                    className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 group transition-colors"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors"><RepostIcon className="w-5 h-5" /></div>
                    {post.repostCount > 0 && <span className="text-sm font-medium">{post.repostCount}</span>}
                </button>
                <ReactionButton onReact={onReact} reactions={post.reactions} likeCount={post.likeCount} />
            </div>
             <div className="flex items-center gap-2">
                {onShareToStory && (
                     <button
                        onClick={onShareToStory}
                        title="Add to Story"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-purple-500 group transition-colors"
                    >
                        <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors"><AddToStoryIcon className="w-5 h-5" /></div>
                    </button>
                 )}
                 {isAuthor && (
                     <button
                        onClick={() => onCreateCampaign(post.id)}
                        title="Promote Post"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-teal-500 group transition-colors"
                    >
                        <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors"><PromoteIcon className="w-5 h-5" /></div>
                    </button>
                 )}
                <div className="relative">
                     <button
                        onClick={() => setIsShareOpen(!isShareOpen)}
                        title="Share"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-500 group transition-colors"
                    >
                        <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors"><ShareIcon className="w-5 h-5" /></div>
                    </button>
                    {isShareOpen && (
                        <div className="absolute bottom-full right-0 mb-2 p-2 bg-white shadow-lg rounded-lg border border-gray-200 z-10">
                            <SocialShare
                                shareText={`Check out this post from ${post.author.name} on Wamuzi Social!`}
                                shareUrl={`#post/${post.id}`}
                                isPopupVersion={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractionBar;
