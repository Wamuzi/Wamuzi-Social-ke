import React, { useState } from 'react';
import { socialService } from '../services/socialService';
import { XIcon } from './icons/Icons';
import { Group } from '../types';

interface CreateGroupModalProps {
    onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [privacy, setPrivacy] = useState<Group['privacy']>('public');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            setError('Group name and description are required.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        // Use a placeholder image if none is provided
        const finalCoverUrl = coverImageUrl.trim() || `https://picsum.photos/seed/${encodeURIComponent(name)}/800/400`;

        try {
            socialService.createGroup({ name, description, coverImageUrl: finalCoverUrl, privacy });
            setIsLoading(false);
            onClose();
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Create a New Group</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Group Name" className="w-full p-2 border rounded" required />
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Group Description" className="w-full p-2 border rounded" rows={3} required />
                        <input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="Cover Image URL (Optional)" className="w-full p-2 border rounded" />
                        <div>
                            <label className="font-semibold text-gray-700">Privacy</label>
                            <div className="mt-2 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="privacy" value="public" checked={privacy === 'public'} onChange={() => setPrivacy('public')} className="h-4 w-4 text-brand-blue focus:ring-brand-blue"/>
                                    <div>
                                        <p className="font-medium">Public</p>
                                        <p className="text-sm text-gray-500">Anyone can see who's in the group and what they post.</p>
                                    </div>
                                </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="privacy" value="private" checked={privacy === 'private'} onChange={() => setPrivacy('private')} className="h-4 w-4 text-brand-blue focus:ring-brand-blue"/>
                                     <div>
                                        <p className="font-medium">Private</p>
                                        <p className="text-sm text-gray-500">Only members can see who's in the group and what they post.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm w-32 flex justify-center">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;