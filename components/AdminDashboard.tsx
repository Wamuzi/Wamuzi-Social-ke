import React, { useState, useEffect } from 'react';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';
import AdminUserManagement from './AdminUserManagement';
import AdminContentModeration from './AdminContentModeration';
import AdminRadioNewsManager from './AdminRadioNewsManager';
import AdminArtistRequests from './AdminArtistRequests';
import AdminReportsView from './AdminReportsView';
import AdminVerificationRequests from './AdminVerificationRequests';
import AdminAdManagement from './AdminAdManagement';
import AdminArtistPayouts from './AdminArtistPayouts';
import AdminDistributorAnalytics from './AdminDistributorAnalytics';
import AdminCreatorFund from './AdminCreatorFund';
import AdminPayoutSettings from './AdminPayoutSettings';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { radioService } from '../services/radioService';
import { newsService } from '../services/newsService';
import { ChartBarIcon, UsersIcon, ShieldCheckIcon, BroadcastIcon, MusicNoteIcon, FlagIcon, CheckBadgeIcon, MoneyIcon, BriefcaseIcon, SparklesIcon, SettingsIcon } from './icons/Icons';


const PromoteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);


const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [key, setKey] = useState(Date.now()); // Used to force re-renders on service updates

    useEffect(() => {
        const forceUpdate = () => setKey(Date.now());
        // A simple way to make sure the dashboard gets latest data when services change
        const services = [socialService, userService, radioService, newsService];
        services.forEach(service => service.subscribe(forceUpdate));
        return () => services.forEach(service => service.unsubscribe(forceUpdate));
    }, []);
    
    const analytics = socialService.getAdminAnalytics();

    const TabButton: React.FC<{tab: string, label: string, icon: React.ReactNode}> = ({tab, label, icon}) => (
        <button 
            onClick={() => setActiveTab(tab)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab 
                    ? 'bg-brand-blue text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    const renderActiveTab = () => {
        switch(activeTab) {
            case 'analytics': return <AdminAnalyticsDashboard analytics={analytics} />;
            case 'distributor_analytics': return <AdminDistributorAnalytics />;
            case 'users': return <AdminUserManagement />;
            case 'content': return <AdminContentModeration />;
            case 'ads': return <AdminAdManagement />;
            case 'radio_news': return <AdminRadioNewsManager radioState={radioService.getState()} newsState={newsService.getState()} />;
            case 'artists': return <AdminArtistRequests />;
            case 'verification': return <AdminVerificationRequests />;
            case 'reports': return <AdminReportsView />;
            case 'payouts': return <AdminArtistPayouts />;
            case 'creator_fund': return <AdminCreatorFund />;
            case 'payout_settings': return <AdminPayoutSettings />;
            default: return null;
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8" key={key}>
            <h2 className="text-3xl font-bold font-orbitron text-gray-900">Admin Dashboard</h2>

            {/* Main Nav */}
            <div className="p-2 bg-gray-100 rounded-lg flex flex-wrap gap-2">
                <TabButton tab="analytics" label="Platform Analytics" icon={<ChartBarIcon className="w-5 h-5"/>} />
                <TabButton tab="distributor_analytics" label="Distributor Analytics" icon={<BriefcaseIcon className="w-5 h-5"/>} />
                <TabButton tab="users" label="Users" icon={<UsersIcon className="w-5 h-5"/>} />
                <TabButton tab="content" label="Content" icon={<ShieldCheckIcon className="w-5 h-5"/>} />
                <TabButton tab="ads" label="Ad Campaigns" icon={<PromoteIcon className="w-5 h-5"/>} />
                <TabButton tab="radio_news" label="Radio & News" icon={<BroadcastIcon className="w-5 h-5"/>} />
                <TabButton tab="artists" label="Artist Requests" icon={<MusicNoteIcon className="w-5 h-5"/>} />
                <TabButton tab="verification" label="Verification" icon={<CheckBadgeIcon className="w-5 h-5"/>} />
                <TabButton tab="reports" label="Reports" icon={<FlagIcon className="w-5 h-5"/>} />
                <TabButton tab="payouts" label="Payouts" icon={<MoneyIcon className="w-5 h-5"/>} />
                <TabButton tab="creator_fund" label="Creator Fund" icon={<SparklesIcon className="w-5 h-5"/>} />
                <TabButton tab="payout_settings" label="Payout Settings" icon={<SettingsIcon className="w-5 h-5"/>} />
            </div>

            <div className="mt-6">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default AdminDashboard;