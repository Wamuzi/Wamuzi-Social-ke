import React, { useState } from 'react';
import { Comment, User } from '../types';
import { userService } from '../services/userService';
import { socialService } from '../services/socialService';
import ReactionButton from './ReactionButton';

interface CommentItemProps {
    postId: string;
    comment: Comment;
    onReply: (parentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
    onReact: (commentId: string, reaction: string) => void;
    level: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ postId, comment, onReply, onDelete, onReact, level }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const currentUser = userService.getCurrentUser();

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim()) {
            onReply(comment.id, replyContent);
            setReplyContent('');
            setIsReplying(false);
        }
    };
    
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            onDelete(comment.id);
        }
    };
    
    const handleReact = (reaction: string) => {
        onReact(comment.id, reaction);
    };

    return (
        <div className="flex items-start gap-3">
            <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-8 h-8 rounded-full" />
            <div className="flex-grow">
                <div className={`rounded-lg p-2 ${comment.author.id === currentUser?.id ? 'bg-blue-50' : 'bg-gray-100'}`}>
                    <div className="flex items-baseline justify-between">
                        <p className="font-semibold text-gray-800 text-sm">{comment.author.name}</p>
                        <p className="text-xs text-gray-500">{new Date(comment.pubDate).toLocaleTimeString()}</p>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <ReactionButton
                        onReact={handleReact}
                        reactions={comment.reactions}
                        likeCount={comment.likeCount}
                        size="sm"
                    />
                    <span className="text-gray-400">&middot;</span>
                    <button onClick={() => setIsReplying(!isReplying)} className="text-xs font-semibold text-gray-500 hover:text-brand-blue">
                        {isReplying ? 'Cancel' : 'Reply'}
                    </button>
                     {currentUser?.id === comment.author.id && (
                        <>
                        <span className="text-gray-400">&middot;</span>
                        <button onClick={handleDelete} className="text-xs font-semibold text-gray-500 hover:text-red-500">
                           Delete
                        </button>
                        </>
                    )}
                </div>
                 {isReplying && currentUser && (
                    <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2">
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-6 h-6 rounded-full" />
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Replying to ${comment.author.name}...`}
                            className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue transition text-gray-800 text-sm"
                            autoFocus
                        />
                    </form>
                )}
                <div className="mt-3 space-y-3">
                    {comment.replies?.map(reply => (
                        <CommentItem key={reply.id} postId={postId} comment={reply} onReply={onReply} onDelete={onDelete} onReact={onReact} level={level + 1} />
                    ))}
                </div>
            </div>
        </div>
    );
};

interface CommentSectionProps {
    postId: string;
    comments: Comment[];
    onAddComment: (content: string, parentId?: string) => void;
    onDeleteComment: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments, onAddComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const currentUser = userService.getCurrentUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newComment.trim()) return;
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 300));
        onAddComment(newComment);
        setNewComment('');
        setIsLoading(false);
    };

    const handleReactToComment = (commentId: string, reaction: string) => {
        socialService.toggleCommentReaction(postId, commentId, reaction);
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {comments.map(comment => (
                <CommentItem key={comment.id} postId={postId} comment={comment} onReply={onAddComment} onDelete={onDeleteComment} onReact={handleReactToComment} level={0} />
            ))}
             {currentUser && (
                <form onSubmit={handleSubmit} className="flex items-start gap-3 pt-2">
                     <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                     <div className="flex-grow">
                         <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue transition text-gray-800 text-sm"
                            disabled={isLoading}
                        />
                        {isLoading && <p className="text-xs text-gray-500 mt-1">Posting...</p>}
                     </div>
                </form>
             )}
        </div>
    );
};

export default CommentSection;
