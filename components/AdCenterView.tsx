import React, { useState, useEffect } from 'react';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { AdCampaign, Post } from '../types';
import { ViewState } from '../App';

const PromoteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);

interface AdCenterViewProps {
    setView: (vs: ViewState) => void;
}

const CampaignCard: React.FC<{ campaign: AdCampaign }> = ({ campaign }) => {
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        const foundPost = socialService.getPostById(campaign.postId);
        setPost(foundPost || null);
    }, [campaign.postId]);

    if (!post) {
        return <div className="bg-white shadow-md rounded-lg p-4 text-gray-500">Loading post data...</div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-start gap-4">
                {post.attachment?.type === 'image' && <img src={post.attachment.url} alt="post preview" className="w-20 h-20 rounded-md object-cover flex-shrink-0" />}
                {post.attachment?.type === 'video' && post.attachment.imageAsVideoUrl && <img src={post.attachment.imageAsVideoUrl} alt="reel preview" className="w-20 h-20 rounded-md object-cover flex-shrink-0" />}
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-600 line-clamp-2">{post.content || "Reel"}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {campaign.status}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Started on {new Date(campaign.startDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
                <div><p className="text-sm text-gray-500">Budget</p><p className="font-bold text-lg">${campaign.budget}</p></div>
                <div><p className="text-sm text-gray-500">Duration</p><p className="font-bold text-lg">{campaign.durationDays} days</p></div>
                <div><p className="text-sm text-gray-500">Reach</p><p className="font-bold text-lg">{campaign.reach.toLocaleString()}</p></div>
                <div><p className="text-sm text-gray-500">Clicks</p><p className="font-bold text-lg">{campaign.clicks.toLocaleString()}</p></div>
            </div>
        </div>
    );
};

const AdCenterView: React.FC<AdCenterViewProps> = ({ setView }) => {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const currentUser = userService.getCurrentUser();

    useEffect(() => {
        if (currentUser) {
            setCampaigns(socialService.getCampaignsByUser(currentUser.id));
        }
    }, [currentUser]);

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-orbitron text-gray-900 mb-8 flex items-center gap-3">
                <PromoteIcon className="w-8 h-8"/> Ad Center
            </h2>
            <div className="space-y-6">
                {campaigns.length > 0 ? (
                    campaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} />)
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold">No Campaigns Yet</h3>
                        <p className="text-gray-500 mt-2">Promote one of your posts to get started!</p>
                        <button onClick={() => setView({ view: 'feed' })} className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-md font-semibold">
                            Go to Feed
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdCenterView;