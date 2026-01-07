import React, { useState } from 'react';
import { Post, User } from '../types';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { RepostIcon, PencilSquareIcon, EyeIcon, HeartIcon, CommentIcon, ShareIcon, UserCircleIcon } from './icons/Icons';
import InteractionBar from './InteractionBar';
import CommentSection from './CommentSection';
import LinkRenderer from './LinkRenderer';
import { ViewState } from '../App';
import AttachedSongPlayer from './AttachedSongPlayer';

const PostContent: React.FC<{ text: string; onUserSelect: (user: User) => void; onLinkClick: (url: string) => void }> = ({ text, onUserSelect, onLinkClick }) => {
    // Basic regex to find @mentions
    const mentionRegex = /(@\w+)/g;
    const parts = text.split(mentionRegex);

    return (
        <p className="text-gray-700 whitespace-pre-wrap mb-3">
            {parts.map((part, i) => {
                if (mentionRegex.test(part)) {
                    const username = part.substring(1);
                    const user = userService.findUserByName(username);
                    if (user) {
                        return <strong key={i} className="text-brand-blue cursor-pointer" onClick={(e) => { e.stopPropagation(); onUserSelect(user); }}>{part}</strong>;
                    }
                }
                return <LinkRenderer key={i} text={part} onLinkClick={onLinkClick} />;
            })}
        </p>
    );
};

const PostCard: React.FC<{ post: Post; onUserSelect: (user: User) => void; setView: (vs: ViewState) => void; onPromote: (postId: string) => void; onLinkClick: (url: string) => void; }> = ({ post, onUserSelect, setView, onPromote, onLinkClick }) => {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const currentUser = userService.getCurrentUser();
    
    const targetPost = post.originalPost || post;
    
    const handleCommentClick = () => setIsCommentsOpen(!isCommentsOpen);
    const handleAddComment = (content: string, parentId?: string) => socialService.addComment(targetPost.id, content, parentId);
    const handleDeleteComment = (commentId: string) => socialService.deleteComment(targetPost.id, commentId);

    const handleSaveEdit = () => {
        socialService.editPost(post.id, editedContent);
        setIsEditing(false);
    };
    
    const handleReact = (reaction: string) => {
        socialService.toggleReaction(targetPost.id, reaction);
    };

    const handleShareToStory = () => {
        if (targetPost.attachment) {
            socialService.addStory(targetPost.attachment.url, targetPost.attachment.type);
            alert('Post shared to your story!');
        }
    };

    const isAuthor = currentUser?.id === targetPost.author.id;


    const renderPostContent = (p: Post) => {
        const isAuthor = currentUser?.id === p.author.id;

        return (
            <div className={`w-full ${p.originalPost ? 'mt-3 border border-gray-200 rounded-lg p-3' : ''}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 mb-3">
                        <img src={p.author.avatarUrl} alt={p.author.name} className="w-10 h-10 rounded-full cursor-pointer" onClick={(e) => { e.stopPropagation(); onUserSelect(p.author); }} loading="lazy" />
                        <div>
                            <p className="font-semibold text-gray-800 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); onUserSelect(p.author); }}>{p.author.name}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(p.pubDate).toLocaleString()}
                                {p.isSponsored && <span className="font-semibold text-gray-600"> &middot; Sponsored</span>}
                            </p>
                        </div>
                    </div>
                    {isAuthor && !p.originalPost && !p.poll && !p.attachment && (
                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }} className="p-2 text-gray-500 hover:text-brand-blue rounded-full">
                            <PencilSquareIcon className="w-5 h-5"/>
                        </button>
                    )}
                </div>
                
                <div onClick={() => !isCommentsOpen && setIsCommentsOpen(true)} className="cursor-pointer">
                    {isEditing ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} className="w-full bg-gray-100 border-gray-300 rounded-md p-2" rows={3}/>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 rounded-md text-sm">Cancel</button>
                                <button onClick={handleSaveEdit} className="px-3 py-1 bg-brand-blue text-white rounded-md text-sm">Save</button>
                            </div>
                        </div>
                    ) : (
                        p.content && <PostContent text={p.content} onUserSelect={onUserSelect} onLinkClick={onLinkClick} />
                    )}
                    
                    {p.attachment && (
                        <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
                            {p.attachment.type === 'image' && <img src={p.attachment.url} alt="Post attachment" className="w-full h-auto max-h-[60vh] object-contain" loading="lazy" />}
                        </div>
                    )}

                    {p.audioTrack && (
                        <div className="mt-3">
                            <AttachedSongPlayer song={p.audioTrack} />
                        </div>
                    )}
                </div>
            </div>
        )
    };
    
    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            {post.originalPost && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <RepostIcon className="w-4 h-4" />
                    <p>
                        <span className="font-semibold hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); onUserSelect(post.author); }}>{post.author.name}</span> reposted
                    </p>
                </div>
            )}
            {renderPostContent(targetPost)}
            {isAuthor && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Post Analytics</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1" title="Impressions"><EyeIcon className="w-4 h-4"/> {targetPost.reach || targetPost.viewCount || 0}</span>
                        <span className="flex items-center gap-1" title="Likes"><HeartIcon className="w-4 h-4"/> {targetPost.likeCount}</span>
                        <span className="flex items-center gap-1" title="Comments"><CommentIcon className="w-4 h-4"/> {targetPost.comments.length}</span>
                        <span className="flex items-center gap-1" title="Reposts"><RepostIcon className="w-4 h-4"/> {targetPost.repostCount}</span>
                        <span className="flex items-center gap-1" title="Shares"><ShareIcon className="w-4 h-4"/> {targetPost.shares || 0}</span>
                        <span className="flex items-center gap-1" title="Profile Visits from Post"><UserCircleIcon className="w-4 h-4"/> {targetPost.profileVisits || 0}</span>
                    </div>
                </div>
            )}
            <InteractionBar 
                post={targetPost} 
                onReact={handleReact} 
                onRepost={() => socialService.repost(targetPost.id)} 
                onCommentClick={handleCommentClick}
                onCreateCampaign={onPromote}
                onShareToStory={isAuthor && targetPost.attachment ? handleShareToStory : undefined}
            />
            {isCommentsOpen && <CommentSection postId={targetPost.id} comments={targetPost.comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />}
        </div>
    );
};

export default PostCard;