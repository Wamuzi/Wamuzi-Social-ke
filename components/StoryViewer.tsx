import React, { useState, useEffect, useRef } from 'react';
import { Story, StoryComment } from '../types';
import { XIcon, CommentIcon, EyeIcon, ShareIcon, CheckIcon } from './icons/Icons';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import ReactionButton from './ReactionButton';

interface StoryViewerProps {
    stories: Story[];
    onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds

const StoryCommentPanel: React.FC<{story: Story, onClose: () => void}> = ({ story, onClose }) => {
    const [comment, setComment] = useState('');
    const currentUser = userService.getCurrentUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(comment.trim() && currentUser) {
            socialService.addCommentToStory(story.id, comment);
            setComment('');
        }
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col justify-end z-20" onClick={onClose}>
            <div className="bg-white rounded-t-2xl p-4 h-[60vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="font-semibold">Comments ({story.comments.length})</h3>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="flex-grow overflow-y-auto space-y-3 py-2">
                    {story.comments.map(c => (
                        <div key={c.id} className="flex items-start gap-2">
                            <img src={c.commenter.avatarUrl} alt={c.commenter.name} className="w-8 h-8 rounded-full" />
                            <div>
                                <p className="text-sm"><span className="font-semibold">{c.commenter.name}</span> {c.content}</p>
                                <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    {story.comments.length === 0 && <p className="text-center text-gray-500 pt-8">No comments yet.</p>}
                </div>
                {currentUser && (
                     <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-2">
                        <img src={currentUser.avatarUrl} alt="You" className="w-8 h-8 rounded-full" />
                        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm"/>
                    </form>
                )}
            </div>
        </div>
    )
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [isShared, setIsShared] = useState(false);

    const timerRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const inputRef = useRef<HTMLInputElement>(null);
    const currentUser = userService.getCurrentUser();

    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (currentStory) {
            socialService.viewStory(currentStory.id);
        }
    }, [currentStory]);


    const goToNext = () => {
        if (currentIndex < stories.length - 1) setCurrentIndex(prev => prev + 1);
        else onClose();
    };

    const goToPrevious = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const pauseStory = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        const currentProgress = (elapsed / STORY_DURATION) * 100;
        setProgress(currentProgress);
    };

    const resumeStory = (duration = STORY_DURATION) => {
        startTimeRef.current = Date.now();
        const remainingTime = duration * (1 - progress / 100);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(goToNext, remainingTime);

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const totalElapsed = (progress/100 * duration) + elapsed;
            setProgress(Math.min((totalElapsed / duration) * 100, 100));
        }, 100);
    };
    
    useEffect(() => {
        if (!stories || stories.length === 0) { onClose(); return; }
        setProgress(0);
        if(!isCommentsOpen) resumeStory(STORY_DURATION);
        else pauseStory();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentIndex, stories, onClose, isCommentsOpen]);

    const handleReact = (reaction: string) => {
        socialService.toggleStoryReaction(currentStory.id, reaction);
    }

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isShared) return;
        socialService.shareStoryAsPost(currentStory);
        setIsShared(true);
        setTimeout(() => {
            setIsShared(false);
        }, 2000);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentInput.trim() && currentUser) {
            socialService.addCommentToStory(currentStory.id, commentInput.trim());
            setCommentInput('');
            inputRef.current?.blur();
        }
    }


    if (!currentStory) return null;
    const isAuthor = currentUser?.id === currentStory.author.id;

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative max-w-sm w-full aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden shadow-2xl select-none" onClick={e => e.stopPropagation()} onMouseDown={pauseStory} onMouseUp={() => resumeStory()} onTouchStart={pauseStory} onTouchEnd={() => resumeStory()}>
                
                {currentStory.mediaType === 'image' ? (
                    <img src={currentStory.mediaUrl} alt={`Story by ${currentStory.author.name}`} className="w-full h-full object-cover" />
                ) : (
                    <video src={currentStory.mediaUrl} autoPlay playsInline muted loop className="w-full h-full object-cover" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50"></div>
                
                <div className="absolute top-0 left-0 right-0 p-3">
                    <div className="flex gap-1">
                        {stories.map((_, index) => (
                            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white" style={{ width: `${index < currentIndex ? 100 : (index === currentIndex ? progress : 0)}%`, transition: index === currentIndex ? 'width 0.1s linear' : 'none' }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2"><img src={currentStory.author.avatarUrl} alt={currentStory.author.name} className="w-8 h-8 rounded-full border-2 border-white" /><p className="font-semibold text-white text-sm">{currentStory.author.name}</p></div>
                        <button onClick={onClose} className="text-white/80 hover:text-white"><XIcon className="w-6 h-6"/></button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                    {isAuthor ? (
                         <div className="p-2 text-white flex flex-col items-center">
                            <EyeIcon className="w-7 h-7"/>
                            <span className="text-xs">{currentStory.viewCount}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 w-full">
                            <form onSubmit={handleCommentSubmit} className="flex-grow">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Send a message..."
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    className="w-full bg-black/30 rounded-full px-4 py-2 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                                    onClick={e => e.stopPropagation()}
                                    onMouseDown={e => e.stopPropagation()}
                                    onMouseUp={e => e.stopPropagation()}
                                    onTouchStart={e => e.stopPropagation()}
                                    onTouchEnd={e => e.stopPropagation()}
                                    onFocus={pauseStory}
                                    onBlur={() => !isCommentsOpen && resumeStory()}
                                />
                            </form>
                            <button onClick={handleShare} className="p-2 text-white flex flex-col items-center flex-shrink-0" disabled={isShared}>
                                {isShared ? (
                                    <div className="w-7 h-7 flex items-center justify-center"><CheckIcon className="w-6 h-6"/></div>
                                ) : ( <ShareIcon className="w-7 h-7"/> )}
                                <span className="text-xs h-3">{isShared ? 'Shared!' : ''}</span>
                            </button>
                             <button onClick={() => setIsCommentsOpen(true)} className="p-2 text-white flex flex-col items-center flex-shrink-0">
                                <CommentIcon className="w-7 h-7"/> 
                                {currentStory.comments.length > 0 && <span className="text-xs">{currentStory.comments.length}</span>}
                            </button>
                             <div className="flex flex-col items-center text-white" onClick={e => e.stopPropagation()}>
                                <ReactionButton onReact={handleReact} reactions={currentStory.reactions} likeCount={currentStory.likeCount} textColor="text-white" />
                            </div>
                        </div>
                    )}
                    {isAuthor && (
                         <div className="flex items-center gap-2">
                            <button onClick={() => setIsCommentsOpen(true)} className="p-2 text-white flex flex-col items-center"><CommentIcon className="w-7 h-7"/> <span className="text-xs">{currentStory.comments.length}</span></button>
                            <div className="flex flex-col items-center text-white" onClick={e => e.stopPropagation()}>
                                <ReactionButton onReact={handleReact} reactions={currentStory.reactions} likeCount={currentStory.likeCount} textColor="text-white"/>
                            </div>
                        </div>
                    )}
                </div>

                {isCommentsOpen && <StoryCommentPanel story={currentStory} onClose={() => setIsCommentsOpen(false)} />}
                
                <div onClick={goToPrevious} className="absolute left-0 top-0 h-full w-1/3" aria-label="Previous story"></div>
                <div onClick={goToNext} className="absolute right-0 top-0 h-full w-1/3" aria-label="Next story"></div>
            </div>
        </div>
    );
};

export default StoryViewer;
