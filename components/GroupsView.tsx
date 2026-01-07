import React, { useState, useEffect } from 'react';
import { Group } from '../types';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { ViewState } from '../App';
import { UsersIcon, PlusIcon } from './icons/Icons';
import CreateGroupModal from './CreateGroupModal';

interface GroupsViewProps {
    setView: (vs: ViewState) => void;
}

const GroupCard: React.FC<{ group: Group; onSelect: () => void; }> = ({ group, onSelect }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer" onClick={onSelect}>
        <img src={group.coverImageUrl} alt={group.name} className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity" />
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{group.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">{group.members.length} members</p>
        </div>
    </div>
);

const GroupsView: React.FC<GroupsViewProps> = ({ setView }) => {
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const currentUser = userService.getCurrentUser();

    useEffect(() => {
        const updateGroups = () => {
            const allGroups = socialService.getGroups();
            if (currentUser) {
                setMyGroups(allGroups.filter(g => g.members.includes(currentUser.id)));
                setDiscoverGroups(allGroups.filter(g => !g.members.includes(currentUser.id)));
            } else {
                setMyGroups([]);
                setDiscoverGroups(allGroups);
            }
        };
        
        updateGroups();
        socialService.subscribe(updateGroups);
        return () => socialService.unsubscribe(updateGroups);
    }, [currentUser]);

    const handleSelectGroup = (groupId: string) => {
        setView({ view: 'groupDetail', data: { groupId } });
    };

    return (
        <>
            {isCreateModalOpen && <CreateGroupModal onClose={() => setIsCreateModalOpen(false)} />}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <UsersIcon className="w-8 h-8"/> Community Groups
                    </h2>
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-blue-500 transition">
                        <PlusIcon className="w-5 h-5"/> Create Group
                    </button>
                </div>

                {myGroups.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">My Groups</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myGroups.map(group => (
                                <GroupCard key={group.id} group={group} onSelect={() => handleSelectGroup(group.id)} />
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-xl font-semibold mb-4">Discover Groups</h3>
                    {discoverGroups.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {discoverGroups.map(group => (
                                <GroupCard key={group.id} group={group} onSelect={() => handleSelectGroup(group.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-md">
                            <p className="text-gray-500">No new groups to discover right now.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default GroupsView;