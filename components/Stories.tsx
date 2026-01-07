import React, { useState, useEffect, useRef } from 'react';
import { User, Story } from '../types';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { AddToStoryIcon } from './icons/Icons';

interface StoriesProps {
    onViewStory: (user: User) => void;
}

const Stories: React.FC<StoriesProps> = ({ onViewStory }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const currentUser = userService.getCurrentUser();
    const addStoryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleStoryUpdate = (updatedStories: Story[]) => {
            // Group stories by user, taking the most recent one for the preview
            const userStoryMap = new Map<string, Story>();
            updatedStories.forEach(story => {
                if (!userStoryMap.has(story.author.id) || new Date(story.createdAt) > new Date(userStoryMap.get(story.author.id)!.createdAt)) {
                    userStoryMap.set(story.author.id, story);
                }
            });
            setStories(Array.from(userStoryMap.values()).sort((a,b) => b.author.id === currentUser?.id ? 1 : -1));
        };

        socialService.subscribeStories(handleStoryUpdate);
        handleStoryUpdate(socialService.getStories()); // Initial load

        return () => socialService.unsubscribeStories(handleStoryUpdate);
    }, [currentUser]);

    const handleAddStoryClick = () => {
        addStoryInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const mediaType = file.type.startsWith('video') ? 'video' : 'image';
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                if (url) {
                    socialService.addStory(url, mediaType);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset file input value to allow re-uploading the same file
        if (e.target) e.target.value = '';
    };

    if (!currentUser) return null;

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <input 
                type="file" 
                ref={addStoryInputRef} 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleFileChange}
            />
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                {/* Add Story Button */}
                <div className="flex-shrink-0 text-center w-20">
                    <button onClick={handleAddStoryClick} className="relative w-16 h-16 rounded-full flex items-center justify-center">
                        <img src={currentUser.avatarUrl} alt="Your Story" className="w-full h-full rounded-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                           <AddToStoryIcon className="w-6 h-6 text-brand-blue" />
                        </div>
                    </button>
                    <p className="text-xs mt-1 truncate">Your Story</p>
                </div>
                
                {/* Other users' stories */}
                {stories.filter(s => s.author.id !== currentUser.id).map(story => (
                    <div key={story.author.id} className="flex-shrink-0 text-center w-20">
                        <button onClick={() => onViewStory(story.author)} className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                             <div className="bg-white p-0.5 rounded-full">
                                <img src={story.author.avatarUrl} alt={story.author.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                        </button>
                        <p className="text-xs mt-1 truncate">{story.author.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stories;