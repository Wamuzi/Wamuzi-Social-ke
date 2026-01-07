import React, { useState, useEffect, useRef, useCallback } from 'react';
import { socialService } from '../services/socialService';
import { Post, User } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, PlayIcon, ReplayIcon, VolumeUpIcon, VolumeOffIcon, XIcon, MusicNoteIcon, PencilIcon } from './icons/Icons';
import SocialShare from './SocialShare';
import CommentSection from './CommentSection';
import { radioService } from '../services/radioService';
import { ViewState } from '../App';
import { userService } from '../services/userService';

const ReelItem: React.FC<{ post: Post; setView: (vs: ViewState) => void; isUnmuted: boolean; onToggleMute: () => void; }> = ({ post, setView, isUnmuted, onToggleMute }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasBeenViewed = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [radioState, setRadioState] = useState(radioService.getState());
    const [isEditingCaption, setIsEditingCaption] = useState(false);
    const [editedCaption, setEditedCaption] = useState(post.content);

    const currentUser = userService.getCurrentUser();
    const isAuthor = currentUser?.id === post.author.id;

    const userReaction = currentUser ? Object.keys(post.reactions || {}).find(r => post.reactions![r].includes(currentUser.id)) : undefined;
    const isLiked = !!userReaction;

    useEffect(() => {
        const sub = (state: any) => setRadioState(state);
        radioService.subscribe(sub);
        return () => radioService.unsubscribe(sub);
    }, []);

    const isThisSongPlaying = radioState.currentSong?.id === post.audioTrack?.id && radioState.isPlaying;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!hasBeenViewed.current) {
                        socialService.incrementReelViewCount(post.id);
                        hasBeenViewed.current = true;
                    }
                     if (post.audioTrack) {
                        radioService.playSongFromLibrary(post.audioTrack);
                        if (videoRef.current) videoRef.current.muted = true; // Ensure video sound is off
                    }

                    videoRef.current?.play().then(() => {
                        setIsPlaying(true);
                        setHasEnded(false);
                    }).catch(e => {
                        setIsPlaying(false);
                    });
                } else {
                    const currentRadioState = radioService.getState();
                     if (post.audioTrack && currentRadioState.isPlaying && currentRadioState.currentSong?.id === post.audioTrack.id) {
                       radioService.stop();
                    }
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            },
            { threshold: 0.8 }
        );

        const currentVideo = videoRef.current;
        if (currentVideo) {
            observer.observe(currentVideo);
        }

        return () => {
            if (currentVideo) {
                observer.unobserve(currentVideo);
            }
        };
    }, [post.id, post.audioTrack]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
                setHasEnded(false);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleReplay = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
            setHasEnded(false);
        }
    }
    
    const handleLike = () => {
        socialService.toggleReaction(post.id, '❤️');
    }
    
    const handleAddComment = (content: string, parentId?: string) => {
        socialService.addComment(post.id, content, parentId);
    };

    const handleDeleteComment = (commentId: string) => {
        socialService.deleteComment(post.id, commentId);
    };

    const handleUseSound = () => {
        if (post.audioTrack) {
            setView({ view: 'feed', data: { preAttachedSong: post.audioTrack } });
        }
    };

    const handleEditCaptionClick = () => {
        if (isPlaying) {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
        setEditedCaption(post.content);
        setIsEditingCaption(true);
    };
    
    const handleCancelEdit = () => {
        setIsEditingCaption(false);
    };

    const handleSaveCaption = () => {
        if (editedCaption !== post.content) {
            socialService.editPost(post.id, editedCaption);
        }
        setIsEditingCaption(false);
    };
    
    const shareText = post.content 
        ? `${post.content} - Reel by ${post.author.name} on Wamuzi`
        : `Check out this reel from ${post.author.name} on Wamuzi!`;
        
    const handleToggleMuteOrPlayback = () => {
        if (post.audioTrack) {
            radioService.togglePlay();
        } else {
            onToggleMute();
        }
    };
    
    const isAudioActive = post.audioTrack ? radioState.isPlaying && radioState.currentSong?.id === post.audioTrack.id : isUnmuted;
    
    return (
        <div className="relative h-full w-full snap-start flex items-center justify-center">
            <video
                ref={videoRef}
                src={post.attachment!.url}
                muted={post.audioTrack ? true : !isUnmuted}
                playsInline
                loop
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onEnded={() => { setIsPlaying(false); setHasEnded(true); }}
                preload="auto"
            />
            
            <div className="absolute top-4 left-4 right-4 text-white z-10 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full border-2 border-white"/>
                    <span className="font-semibold">{post.author.name}</span>
                </div>
                 <button onClick={handleToggleMuteOrPlayback} className="p-2 bg-black/30 rounded-full">
                    {isAudioActive ? <VolumeUpIcon className="w-5 h-5"/> : <VolumeOffIcon className="w-5 h-5"/>}
                </button>
            </div>

             <div className="absolute bottom-16 left-4 right-16 text-white z-10">
                 <div className="flex items-center gap-2">
                    {post.content ? (
                        <p className="text-sm">{post.content}</p>
                    ) : (
                        isAuthor && <p className="text-sm text-white/70">No caption</p>
                    )}
                    {isAuthor && (
                        <button onClick={handleEditCaptionClick} className="p-1 bg-black/30 rounded-full flex-shrink-0">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {post.audioTrack && (
                    <div className="flex items-center gap-2 mt-2">
                        <MusicNoteIcon className="w-4 h-4" />
                        <p className="text-xs font-semibold">{post.audioTrack.title} - {post.audioTrack.artist}</p>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-16 right-2 flex flex-col items-center gap-4 z-10 text-white">
                <button onClick={handleLike} className="flex flex-col items-center">
                    <HeartIcon className="w-8 h-8" isFilled={isLiked}/>
                    <span className="text-xs font-semibold">{post.likeCount}</span>
                </button>
                 <button onClick={() => setIsCommentsOpen(true)} className="flex flex-col items-center">
                    <CommentIcon className="w-8 h-8"/>
                    <span className="text-xs font-semibold">{post.comments.length}</span>
                </button>
                 <div className="flex flex-col items-center">
                    <PlayIcon className="w-8 h-8"/>
                    <span className="text-xs font-semibold">{(post.viewCount || 0).toLocaleString()}</span>
                </div>
                 <div className="flex flex-col items-center">
                    <SocialShare shareText={shareText} isPopupVersion={true} />
                </div>
                 {post.audioTrack && (
                    <button onClick={handleUseSound} className="mt-2">
                        <img src={post.audioTrack.albumArt} alt="album art" className={`w-10 h-10 rounded-full border-2 border-white object-cover ${isThisSongPlaying ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                     {hasEnded ? (
                        <button onClick={handleReplay} className="p-4 bg-white/20 rounded-full pointer-events-auto">
                            <ReplayIcon className="w-12 h-12 text-white" />
                        </button>
                    ) : (
                        <PlayIcon className="w-16 h-16 text-white/70" />
                    )}
                </div>
            )}
            
            {isCommentsOpen && (
                <div className="absolute inset-0 bg-black/70 flex flex-col justify-end z-20">
                    <div className="bg-white rounded-t-2xl p-4 h-[60vh] flex flex-col">
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <h3 className="font-semibold">Comments ({post.comments.length})</h3>
                            <button onClick={() => setIsCommentsOpen(false)}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                             <CommentSection postId={post.id} comments={post.comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />
                        </div>
                    </div>
                </div>
            )}
            
            {isEditingCaption && (
                <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center p-4" onClick={handleCancelEdit}>
                    <div className="bg-white rounded-lg p-4 w-full max-w-sm text-black" onClick={e => e.stopPropagation()}>
                        <h3 className="font-semibold mb-2">Edit Caption</h3>
                        <textarea
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                            className="w-full p-2 border rounded text-gray-800"
                            rows={4}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                            <button onClick={handleSaveCaption} className="px-3 py-1 bg-brand-blue text-white rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReelsView: React.FC<{ setView: (vs: ViewState) => void; }> = ({ setView }) => {
    const [reels, setReels] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [unmutedReelId, setUnmutedReelId] = useState<string | null>(null);

    const fetchReels = useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500));
        const { reels: newReels, hasMore: newHasMore } = socialService.getRecommendedReels({ page, limit: 5 });
        setReels(prev => [...prev, ...newReels]);
        setPage(prev => prev + 1);
        setHasMore(newHasMore);
        setIsLoading(false);
    }, [isLoading, hasMore, page]);

    const observer = useRef<IntersectionObserver>();
    const lastReelElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchReels();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, fetchReels]);

    useEffect(() => {
        const handleSocialUpdate = () => {
            setReels(prevReels =>
                prevReels.map(reel => {
                    const updatedPost = socialService.getPostById(reel.id);
                    return updatedPost ? updatedPost : reel;
                })
            );
        };

        socialService.subscribe(handleSocialUpdate);

        return () => {
            socialService.unsubscribe(handleSocialUpdate);
        };
    }, []);

    useEffect(() => {
        if (reels.length === 0 && hasMore && !isLoading) {
            fetchReels();
        }
    }, [reels.length, hasMore, isLoading, fetchReels]);

    if (reels.length === 0 && !isLoading) {
        return <div className="text-center p-8 text-white bg-black h-full flex items-center justify-center">No reels to show.</div>;
    }

    return (
        <div 
            className="h-[calc(100vh-80px)] w-full bg-black overflow-y-auto snap-y snap-mandatory"
            // 80px is a rough estimate for header height
        >
            {reels.map((reel, index) => {
                const isLastElement = reels.length === index + 1;
                return (
                    <div ref={isLastElement ? lastReelElementRef : null} key={reel.id} className="h-full w-full snap-start">
                         <ReelItem
                            post={reel}
                            setView={setView}
                            isUnmuted={unmutedReelId === reel.id}
                            onToggleMute={() => setUnmutedReelId(prev => prev === reel.id ? null : reel.id)}
                         />
                    </div>
                );
            })}
             {isLoading && (
                <div className="h-full w-full snap-start flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            {!hasMore && reels.length > 0 && (
                <div className="h-full w-full snap-start flex flex-col items-center justify-center text-white">
                    <ReplayIcon className="w-12 h-12 mb-2"/>
                    <p>You've seen all reels!</p>
                </div>
            )}
        </div>
    );
};

export default ReelsView;