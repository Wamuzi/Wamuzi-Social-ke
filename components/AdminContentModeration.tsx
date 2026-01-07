import React, { useState } from 'react';
import { Post, Group } from '../types';
import { socialService } from '../services/socialService';
import { TrashIcon, PencilIcon } from './icons/Icons';

const PostModeration: React.FC = () => {
    const posts = socialService.getAllPosts().filter(p => p.attachment?.type !== 'video');
    const handleDelete = (post: Post) => {
        if(window.confirm(`Are you sure you want to delete this post by ${post.author.name}?`)) {
            socialService.deletePost(post.id);
        }
    }
    return (
        <div className="space-y-4">
            {posts.length > 0 ? posts.map(post => (
                <div key={post.id} className="p-4 bg-gray-50 rounded-lg flex items-start gap-4">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                           <div>
                                <span className="font-semibold text-gray-800">{post.author.name}</span>
                                {post.author.status === 'suspended' && <span className="ml-2 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Suspended</span>}
                           </div>
                            <p className="text-xs text-gray-500">{new Date(post.pubDate).toLocaleString()}</p>
                        </div>
                         <p className="text-gray-700 mt-1 whitespace-pre-wrap">{post.content}</p>
                         {post.originalPost && <div className="text-xs text-gray-500 mt-1">Repost of a post by {post.originalPost.author.name}</div>}
                    </div>
                    <button onClick={() => handleDelete(post)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition flex-shrink-0" title="Delete Post">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )) : <p className="text-center py-8 text-gray-500">No posts to moderate.</p>}
        </div>
    );
};

const ReelModeration: React.FC = () => {
    const reels = socialService.getReels();
    const [editingReelId, setEditingReelId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');

    const handleDelete = (post: Post) => {
        if(window.confirm(`Are you sure you want to delete this reel by ${post.author.name}?`)) {
            socialService.deletePost(post.id);
        }
    }

    const handleEditStart = (reel: Post) => {
        setEditingReelId(reel.id);
        setEditedContent(reel.content);
    };

    const handleEditCancel = () => {
        setEditingReelId(null);
        setEditedContent('');
    };

    const handleEditSave = () => {
        if (editingReelId) {
            socialService.editPost(editingReelId, editedContent);
            handleEditCancel();
        }
    };

    return (
         <div className="space-y-4">
            {reels.length > 0 ? reels.map(reel => (
                <div key={reel.id} className="p-4 bg-gray-50 rounded-lg flex items-start gap-4">
                     <video src={reel.attachment!.url} className="w-20 h-32 rounded-md object-cover bg-black" />
                     <div className="flex-grow">
                        {editingReelId === reel.id ? (
                            <div>
                                <textarea 
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="w-full p-2 border rounded text-sm"
                                    rows={3}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={handleEditSave} className="px-3 py-1 text-sm bg-blue-500 text-white rounded">Save</button>
                                    <button onClick={handleEditCancel} className="px-3 py-1 text-sm bg-gray-200 rounded">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-700 mt-1 line-clamp-2">{reel.content}</p>
                        )}
                         <div className="text-xs text-gray-500 mt-2">By <span className="font-semibold">{reel.author.name}</span> on {new Date(reel.pubDate).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleEditStart(reel)} className="p-2 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition" title="Edit Reel Caption">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(reel)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition" title="Delete Reel">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )) : <p className="text-center py-8 text-gray-500">No reels to moderate.</p>}
        </div>
    );
};

const GroupModeration: React.FC = () => {
    const groups = socialService.getGroups();
    const handleDelete = (group: Group) => {
        if(window.confirm(`Are you sure you want to delete the group "${group.name}"? This will also delete all its posts.`)) {
            socialService.deleteGroup(group.id);
        }
    }
    return (
        <div className="space-y-4">
            {groups.map(group => (
                 <div key={group.id} className="p-4 bg-gray-50 rounded-lg flex items-start gap-4">
                    <img src={group.coverImageUrl} alt={group.name} className="w-24 h-16 rounded-md object-cover" />
                    <div className="flex-grow">
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{group.members.length} members</p>
                    </div>
                    <button onClick={() => handleDelete(group)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition flex-shrink-0" title="Delete Group">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    );
};


const AdminContentModeration: React.FC = () => {
    const [activeTab, setActiveTab] = useState('posts');

    const TabButton: React.FC<{tab: string, label: string}> = ({tab, label}) => (
        <button 
            onClick={() => setActiveTab(tab)} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab 
                    ? 'bg-brand-blue/10 text-brand-blue' 
                    : 'text-gray-500 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'posts': return <PostModeration />;
            case 'reels': return <ReelModeration />;
            case 'groups': return <GroupModeration />;
            default: return null;
        }
    }

    return (
        <div className="bg-white shadow-md rounded-lg">
            <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Content Moderation</h3>
                <p className="text-sm text-gray-500">Review and manage all user-generated content.</p>
            </div>
             <div className="p-2 border-b flex flex-wrap gap-2">
                <TabButton tab="posts" label="Posts" />
                <TabButton tab="reels" label="Reels" />
                <TabButton tab="groups" label="Groups" />
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminContentModeration;