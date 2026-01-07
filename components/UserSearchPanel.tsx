import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';

interface UserSearchPanelProps {
    onSelectUser: (user: User) => void;
    onCancel: () => void;
}

const UserSearchPanel: React.FC<UserSearchPanelProps> = ({ onSelectUser, onCancel }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const currentUser = userService.getCurrentUser();

    useEffect(() => {
        if (query.trim()) {
            setResults(userService.searchUsers(query).filter(u => u.id !== currentUser?.id));
        } else {
            setResults([]);
        }
    }, [query, currentUser?.id]);

    return (
        <>
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">New Message</h2>
                    <button onClick={onCancel} className="text-sm font-semibold text-brand-blue">Cancel</button>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a user..."
                    className="w-full bg-gray-100 border-gray-300 rounded-md p-2"
                    autoFocus
                />
            </div>
            <div className="flex-grow overflow-y-auto">
                {results.length > 0 ? (
                    results.map(user => (
                        <div key={user.id} onClick={() => onSelectUser(user)} className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    ))
                ) : query.trim() ? (
                    <p className="p-4 text-center text-gray-500">No users found.</p>
                ) : (
                    <p className="p-4 text-center text-gray-500">Start typing to find someone.</p>
                )}
            </div>
        </>
    );
};

export default UserSearchPanel;