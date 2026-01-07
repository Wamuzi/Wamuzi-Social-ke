import React, { useState, useEffect } from 'react';
import { Group, User } from '../types';
import { userService } from '../services/userService';
import { socialService } from '../services/socialService';
import { XIcon, SearchIcon, PlusIcon } from './icons/Icons';

interface AddMemberModalProps {
    group: Group;
    onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ group, onClose }) => {
    const [friends, setFriends] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [addedMembers, setAddedMembers] = useState<Set<string>>(new Set());

    useEffect(() => {
        const potentialMembers = userService.getFriends().filter(
            friend => !group.members.includes(friend.id)
        );
        setFriends(potentialMembers);
    }, [group.members]);

    const handleAddMember = (user: User) => {
        socialService.addMemberToGroup(group.id, user.id);
        setAddedMembers(prev => new Set(prev).add(user.id));
    };

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Add Members</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-4 border-b">
                     <div className="relative">
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search for a friend..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-2">
                    {filteredFriends.map(user => (
                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-md">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold">{user.name}</p>
                            </div>
                            <button
                                onClick={() => handleAddMember(user)}
                                disabled={addedMembers.has(user.id)}
                                className="px-3 py-1.5 bg-brand-blue text-white text-xs font-semibold rounded-full hover:bg-blue-500 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <PlusIcon className="w-4 h-4" />
                                {addedMembers.has(user.id) ? 'Added' : 'Add'}
                            </button>
                        </div>
                    ))}
                     {filteredFriends.length === 0 && <p className="text-center text-gray-500 p-8">No friends found.</p>}
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;