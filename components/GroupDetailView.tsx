import React, { useState, useEffect } from 'react';
import { Group, Post, User } from '../types';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { ViewState } from '../App';
import { ArrowLeftIcon, UsersIcon, PlusIcon, PencilIcon, TrashIcon, LockClosedIcon } from './icons/Icons';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import AddMemberModal from './AddMemberModal';
import EditGroupModal from './EditGroupModal';


interface GroupDetailViewProps {
    groupId: string;
    setView: (vs: ViewState) => void;
    onUserSelect: (user: User) => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId, setView, onUserSelect }) => {
    const [group, setGroup] = useState<Group | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const currentUser = userService.getCurrentUser();
    
    const isMember = currentUser ? group?.members.includes(currentUser.id) : false;
    const isCreatorOrAdmin = currentUser && group && (group.createdBy === currentUser.id || currentUser.role === 'admin');


    useEffect(() => {
        const updateGroupData = () => {
            const groupData = socialService.getGroupById(groupId);
            if (groupData) {
                setGroup(groupData);
                setPosts(socialService.getPostsForGroup(groupId));
            } else {
                setGroup(null); // Group might have been deleted
            }
        };
        updateGroupData();

        socialService.subscribe(updateGroupData);
        return () => socialService.unsubscribe(updateGroupData);

    }, [groupId]);

    const handleJoinLeave = () => {
        if (!currentUser) return; // Should not happen if button is shown
        if (isMember) {
            socialService.leaveGroup(groupId);
        } else {
            socialService.joinGroup(groupId);
        }
    };
    
    const handleDeleteGroup = () => {
        if (isCreatorOrAdmin && window.confirm(`Are you sure you want to delete the group "${group?.name}"? This action cannot be undone.`)) {
            socialService.deleteGroup(groupId);
            setView({ view: 'groups' });
        }
    };
    
    if (!group) {
        return <div className="p-8 text-center">Group not found or still loading...</div>;
    }

    return (
        <>
        {isAddMemberModalOpen && <AddMemberModal group={group} onClose={() => setIsAddMemberModalOpen(false)} />}
        {isEditModalOpen && isCreatorOrAdmin && <EditGroupModal group={group} onClose={() => setIsEditModalOpen(false)} />}
        <div className="bg-gray-50 min-h-full">
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm p-2 flex items-center gap-2 border-b">
                 <button onClick={() => setView({ view: 'groups' })} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6"/>
                </button>
                <h2 className="text-lg font-bold truncate">{group.name}</h2>
            </header>
            
            <div className="relative h-48 sm:h-64">
                <img src={group.coverImageUrl} alt={`${group.name} cover`} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/40"/>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 pb-8">
                <div className="relative bg-white shadow-md rounded-lg p-4 -mt-16 z-10">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                             <h1 className="text-2xl font-bold">{group.name}</h1>
                             <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                <UsersIcon className="w-4 h-4" /> {group.members.length} members &bull; {group.privacy === 'public' ? 'Public' : 'Private'} Group
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isMember && (
                                <button onClick={() => setIsAddMemberModalOpen(true)} className="p-2 bg-gray-200 rounded-full" title="Add Members">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button onClick={handleJoinLeave} className={`px-4 py-2 rounded-full font-semibold transition-colors ${isMember ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-brand-blue text-white hover:bg-blue-500'}`}>
                                {isMember ? 'Joined' : 'Join Group'}
                            </button>
                             {isCreatorOrAdmin && (
                                <>
                                <button onClick={() => setIsEditModalOpen(true)} className="p-2 bg-gray-200 rounded-full" title="Edit Group"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={handleDeleteGroup} className="p-2 bg-red-100 text-red-600 rounded-full" title="Delete Group"><TrashIcon className="w-5 h-5"/></button>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="mt-4 text-gray-600">{group.description}</p>
                </div>

                <div className="mt-6 space-y-6">
                     {(group.privacy === 'public' || isMember) ? (
                        <>
                            {isMember && <CreatePost groupId={groupId} setView={setView} />}
                            {posts.length > 0 ? (
                                posts.map(post => <PostCard key={post.id} post={post} onUserSelect={onUserSelect} setView={setView} onPromote={() => {}} onLinkClick={() => {}} />)
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                                    <p className="text-gray-500 font-semibold">No posts in this group yet.</p>
                                    {isMember && <p className="text-sm text-gray-500 mt-1">Be the first to share something!</p>}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-md">
                            <LockClosedIcon className="w-12 h-12 mx-auto text-gray-400" />
                            <h3 className="text-xl font-semibold mt-4">This Group is Private</h3>
                            <p className="text-gray-500 mt-2">Join this group to see or participate in conversations.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default GroupDetailView;