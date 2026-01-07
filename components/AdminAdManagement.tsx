import React, { useState, useEffect } from 'react';
import { AdCampaign, Post } from '../types';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { CheckIcon, XIcon } from './icons/Icons';

const PromoteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);

const CampaignRow: React.FC<{ campaign: AdCampaign; onApprove: (id: string) => void; onReject: (id: string) => void; }> = ({ campaign, onApprove, onReject }) => {
    const user = userService.getUserById(campaign.creatorId);
    const post = socialService.getPostById(campaign.postId);
    
    const getStatusChip = () => {
        switch(campaign.status) {
            case 'active': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
            case 'pending': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            case 'finished': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Finished</span>;
            case 'rejected': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
        }
    };

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusChip()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{user?.name || 'Unknown User'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">${campaign.budget} for {campaign.durationDays} days</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(campaign.endDate).toLocaleDateString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">{post?.content?.substring(0, 30) || 'Reel'}...</td>
            <td className="px-6 py-4 whitespace-nowrap">
                {campaign.status === 'pending' && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => onApprove(campaign.id)} className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200" title="Approve"><CheckIcon className="w-4 h-4" /></button>
                        <button onClick={() => onReject(campaign.id)} className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200" title="Reject"><XIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </td>
        </tr>
    );
};

const AdminAdManagement: React.FC = () => {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'finished' | 'rejected'>('pending');

    useEffect(() => {
        const updateCampaigns = () => setCampaigns(socialService.getAllCampaigns());
        updateCampaigns();
        const sub = () => updateCampaigns();
        socialService.subscribe(sub);
        return () => socialService.unsubscribe(sub);
    }, []);

    const handleApprove = (id: string) => {
        if (window.confirm("Are you sure you want to approve this campaign?")) {
            socialService.approveCampaign(id);
        }
    };
    
    const handleReject = (id: string) => {
        if (window.confirm("Are you sure you want to reject this campaign?")) {
            socialService.rejectCampaign(id);
        }
    };

    const filteredCampaigns = campaigns.filter(c => c.status === activeTab);

    return (
        <div className="bg-white shadow-md rounded-lg">
            <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <PromoteIcon className="w-5 h-5 text-teal-500" /> Advertising Campaigns
                </h3>
                <p className="text-sm text-gray-500">Monitor all user-created ad campaigns.</p>
            </div>
            <div className="border-b p-2 flex gap-2">
                 {['pending', 'active', 'finished', 'rejected'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({campaigns.filter(c => c.status === tab).length})
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ends On</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post Preview</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCampaigns.map(c => <CampaignRow key={c.id} campaign={c} onApprove={handleApprove} onReject={handleReject} />)}
                    </tbody>
                 </table>
                  {filteredCampaigns.length === 0 && <p className="text-center text-gray-500 py-8">No {activeTab} campaigns found.</p>}
            </div>
        </div>
    );
};

export default AdminAdManagement;