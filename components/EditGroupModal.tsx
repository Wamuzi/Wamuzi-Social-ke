import React, { useState, useRef } from 'react';
import { Group } from '../types';
import { socialService } from '../services/socialService';
import { XIcon, ImageIcon } from './icons/Icons';

interface EditGroupModalProps {
    group: Group;
    onClose: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, onClose }) => {
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description);
    const [coverImageUrl, setCoverImageUrl] = useState(group.coverImageUrl);
    const [privacy, setPrivacy] = useState<Group['privacy']>(group.privacy);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCoverImageUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setCoverImageUrl(''); // This will signal the service to use a default
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            setError('Group name and description are required.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            socialService.editGroup(group.id, { name, description, coverImageUrl, privacy });
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
                        <h2 className="text-xl font-semibold">Edit Group Details</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Group Name" className="w-full p-2 border rounded" required />
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Group Description" className="w-full p-2 border rounded" rows={3} required />
                        
                        <div>
                            <label className="font-semibold text-gray-700">Cover Image</label>
                            <div className="mt-2 flex items-center gap-4">
                                {coverImageUrl ? (
                                    <img src={coverImageUrl} alt="Cover preview" className="w-32 h-16 rounded-md object-cover bg-gray-100" />
                                ) : (
                                    <div className="w-32 h-16 rounded-md bg-gray-200 flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-2 self-center">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 border border-gray-300 text-sm font-semibold rounded-md hover:bg-gray-50">Change</button>
                                    {coverImageUrl && <button type="button" onClick={handleRemoveImage} className="text-red-600 text-sm font-semibold hover:bg-red-50 rounded-md px-3 py-1.5">Remove</button>}
                                </div>
                            </div>
                        </div>

                         <div>
                            <label className="font-semibold text-gray-700">Privacy</label>
                            <div className="mt-2 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="privacy" value="public" checked={privacy === 'public'} onChange={() => setPrivacy('public')} className="h-4 w-4 text-brand-blue focus:ring-brand-blue"/>
                                    <p className="font-medium">Public</p>
                                </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="privacy" value="private" checked={privacy === 'private'} onChange={() => setPrivacy('private')} className="h-4 w-4 text-brand-blue focus:ring-brand-blue"/>
                                     <p className="font-medium">Private</p>
                                </label>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm w-32 flex justify-center">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGroupModal;