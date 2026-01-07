import React, { useState, useRef, useEffect } from 'react';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { generateImageFromPrompt } from '../services/geminiService';
import { ImageIcon, ChartPieIcon, XIcon, SparklesIcon, MusicNoteIcon, VideoCameraIcon } from './icons/Icons';
import SelectSongModal from './SelectSongModal';
// FIX: ViewState is exported from App.tsx, not types.ts.
import { Song, Post } from '../types';
import { ViewState } from '../App';
import AttachedSongPlayer from './AttachedSongPlayer';

interface CreatePostProps {
    preselection?: { preAttachedSong: Song };
    groupId?: string;
    setView: (vs: ViewState) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ preselection, groupId, setView }) => {
    const [content, setContent] = useState('');
    const [attachment, setAttachment] = useState<{ type: 'image' | 'video'; url: string; } | null>(null);
    const [poll, setPoll] = useState<{ question: string; options: string[] } | null>(null);
    const [attachedSong, setAttachedSong] = useState<Song | null>(null);
    const [isCreatingPoll, setIsCreatingPoll] = useState(false);
    const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
    const [isSongSelectorOpen, setIsSongSelectorOpen] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const createPostRef = useRef<HTMLDivElement>(null);
    const currentUser = userService.getCurrentUser();
    
    useEffect(() => {
        if (preselection?.preAttachedSong) {
            setAttachedSong(preselection.preAttachedSong);
            setPoll(null);
            setIsCreatingPoll(false);
            createPostRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [preselection]);


    if (!currentUser) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('video')) {
                const MAX_VIDEO_SIZE_MB = 100;
                const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
                if (file.size > MAX_VIDEO_SIZE_BYTES) {
                    alert(`Video file is too large. Please upload a file under ${MAX_VIDEO_SIZE_MB}MB.`);
                    if (e.target) e.target.value = '';
                    return;
                }
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                if (url) {
                    const type = file.type.startsWith('video') ? 'video' : 'image';
                    setAttachment({ type, url });
                    setIsCreatingPoll(false);
                    setPoll(null);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePollOptionChange = (index: number, value: string) => {
        if (poll) {
            const newOptions = [...poll.options];
            newOptions[index] = value;
            setPoll({ ...poll, options: newOptions });
        }
    };
    
    const handleAddPollOption = () => {
        if (poll && poll.options.length < 4) {
            setPoll({ ...poll, options: [...poll.options, ''] });
        }
    };

    const handleRemovePollOption = (index: number) => {
        if (poll && poll.options.length > 2) {
            setPoll({ ...poll, options: poll.options.filter((_, i) => i !== index) });
        }
    };
    
    const togglePollCreator = () => {
        const creating = !isCreatingPoll;
        setIsCreatingPoll(creating);
        setAttachment(null);
        setAttachedSong(null);
        if (creating) {
            setPoll({ question: '', options: ['', ''] });
        } else {
            setPoll(null);
        }
    };

    const handleSongSelect = (song: Song) => {
        setAttachedSong(song);
        setPoll(null);
        setIsCreatingPoll(false);
        setIsSongSelectorOpen(false);
    };
    
    const handleGenerateImage = async () => {
        if (!aiPrompt.trim()) return;
        setIsGeneratingImage(true);
        const base64Data = await generateImageFromPrompt(aiPrompt);
        setIsGeneratingImage(false);
        if (base64Data) {
            const imageUrl = `data:image/png;base64,${base64Data}`;
            setAttachment({ type: 'image', url: imageUrl });
            setIsAIGeneratorOpen(false);
            setAiPrompt('');
            setPoll(null);
            setIsCreatingPoll(false);
            setAttachedSong(null);
        } else {
            alert('Failed to generate image. Please try a different prompt.');
        }
    };
    
    const resetForm = () => {
        setContent('');
        setAttachment(null);
        setPoll(null);
        setAttachedSong(null);
        setIsCreatingPoll(false);
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsPosting(true);

        // Simulate network delay for upload
        setTimeout(() => {
            socialService.addPost(content, attachment, poll || undefined, attachedSong || undefined, groupId);
            resetForm();
            setIsPosting(false);
        }, 1500);
    };

    const canPost = !isPosting && (content.trim() || attachment || attachedSong || (poll && poll.question.trim() && poll.options.every(o => o.trim())));
    const isImageWithSong = attachment?.type === 'image' && attachedSong;
    const isVideoWithSong = attachment?.type === 'video' && attachedSong;


    return (
        <div className="bg-white shadow-md rounded-lg p-4 relative" ref={createPostRef}>
            {isPosting && <div className="absolute inset-0 bg-white/50 z-10"></div>}
            <div className="flex items-start gap-3">
                <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-10 h-10 rounded-full cursor-pointer" 
                    onClick={() => setView({ view: 'profile', data: { userId: currentUser.id }})}
                />
                <form onSubmit={handleSubmit} className="flex-grow">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                        className="w-full bg-gray-100 border-transparent rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-blue transition text-gray-800 disabled:opacity-70"
                        rows={2}
                        disabled={isPosting}
                    />
                    
                    {(isImageWithSong || isVideoWithSong) ? (
                        <div className="mt-2 relative">
                            {isImageWithSong && <img src={attachment.url} alt="preview" className="rounded-lg max-h-80 w-full object-cover" />}
                            {isVideoWithSong && <video src={attachment.url} muted className="rounded-lg max-h-80 w-full object-cover" />}
                            
                            <div className="absolute inset-0 bg-black/30 rounded-lg flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => setAttachment(null)} disabled={isPosting} className="p-1 bg-black/50 text-white rounded-full hover:bg-black/80 disabled:opacity-50">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 bg-black/50 p-2 rounded text-white text-sm">
                                    <MusicNoteIcon className="w-5 h-5 flex-shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="font-semibold truncate">{attachedSong!.title}</p>
                                        <p className="text-xs truncate">{attachedSong!.artist}</p>
                                    </div>
                                    <button type="button" onClick={() => setAttachedSong(null)} disabled={isPosting} className="ml-auto p-1 bg-white/20 rounded-full flex-shrink-0 hover:bg-white/40 disabled:opacity-50">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {attachment && (
                                <div className="mt-2 relative">
                                    {attachment.type === 'image' ? (
                                        <img src={attachment.url} alt="preview" className="rounded-lg max-h-80 w-full object-cover" />
                                    ) : (
                                        <video src={attachment.url} controls className="rounded-lg max-h-80 w-full" />
                                    )}
                                    <button type="button" onClick={() => setAttachment(null)} disabled={isPosting} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80 disabled:opacity-50">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {attachedSong && (
                                <div className="mt-2 relative">
                                    <AttachedSongPlayer song={attachedSong} />
                                    <button type="button" onClick={() => setAttachedSong(null)} disabled={isPosting} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80 disabled:opacity-50">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {isCreatingPoll && poll && (
                        <div className="mt-2 p-3 border border-gray-200 rounded-lg space-y-2">
                             <input type="text" placeholder="Poll Question" value={poll.question} onChange={e => setPoll({...poll, question: e.target.value})} className="w-full bg-gray-50 border-gray-300 rounded-md p-2" disabled={isPosting}/>
                             {poll.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" placeholder={`Option ${index + 1}`} value={option} onChange={e => handlePollOptionChange(index, e.target.value)} className="w-full bg-gray-50 border-gray-300 rounded-md p-2" disabled={isPosting}/>
                                    {poll.options.length > 2 && <button type="button" onClick={() => handleRemovePollOption(index)} className="p-1 text-red-500" disabled={isPosting}><XIcon className="w-4 h-4" /></button>}
                                </div>
                             ))}
                             {poll.options.length < 4 && <button type="button" onClick={handleAddPollOption} className="text-sm font-semibold text-brand-blue" disabled={isPosting}>Add Option</button>}
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                            <input type="file" ref={attachmentInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                            <button type="button" onClick={() => attachmentInputRef.current?.click()} disabled={isPosting} className="p-2 text-gray-500 hover:text-brand-blue rounded-full hover:bg-gray-100 disabled:opacity-50" title="Add Image/Video">
                                <ImageIcon className="w-5 h-5"/>
                            </button>
                            <button type="button" onClick={() => setIsSongSelectorOpen(true)} disabled={isPosting} className="p-2 text-gray-500 hover:text-brand-blue rounded-full hover:bg-gray-100 disabled:opacity-50" title="Add Music">
                                <MusicNoteIcon className="w-5 h-5"/>
                            </button>
                             <button type="button" onClick={togglePollCreator} disabled={isPosting} className={`p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 ${isCreatingPoll ? 'text-brand-blue' : 'text-gray-500'}`} title="Create Poll">
                                <ChartPieIcon className="w-5 h-5"/>
                            </button>
                             <button type="button" onClick={() => setIsAIGeneratorOpen(true)} disabled={isPosting} className="p-2 text-gray-500 hover:text-brand-blue rounded-full hover:bg-gray-100 disabled:opacity-50" title="Generate with AI">
                                <SparklesIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!canPost}
                            className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold w-24 flex justify-center"
                        >
                            {isPosting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
            
            {isAIGeneratorOpen && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-brand-blue"/> Generate Image with AI</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">Describe the image you want to create.</p>
                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., A futuristic synthwave landscape with a retro car"
                            className="w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            rows={3}
                            disabled={isGeneratingImage}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsAIGeneratorOpen(false)} disabled={isGeneratingImage} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold">Cancel</button>
                            <button onClick={handleGenerateImage} disabled={isGeneratingImage || !aiPrompt.trim()} className="px-4 py-2 bg-brand-blue text-white rounded-md text-sm font-semibold disabled:bg-gray-400 flex items-center justify-center w-28">
                                {isGeneratingImage ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isSongSelectorOpen && (
                <SelectSongModal onSelect={handleSongSelect} onClose={() => setIsSongSelectorOpen(false)} />
            )}
        </div>
    );
};

export default CreatePost;
