import React, { useState, useEffect } from 'react';
import { AdminAnalytics, Post, PlatformRevenue } from '../types';
import { UsersIcon, ChartBarIcon, MoneyIcon } from './icons/Icons';
import { monetizationService } from '../services/monetizationService';
import { socialService } from '../services/socialService';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white shadow-md p-6 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-brand-blue/10 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold font-orbitron text-gray-900">{value}</p>
        </div>
    </div>
);

const MonetizationOverview: React.FC = () => {
    const [platformRevenue, setPlatformRevenue] = useState<PlatformRevenue | null>(null);
    const [totalPayouts, setTotalPayouts] = useState(0);

    useEffect(() => {
        const calculateMetrics = () => {
            const revenueFromServices = monetizationService.getPlatformRevenue();
            const adRevenue = socialService.getTotalAdRevenue();
            const total = revenueFromServices.fromRoyalties + revenueFromServices.fromTips + adRevenue;
            
            setPlatformRevenue({
                fromRoyalties: revenueFromServices.fromRoyalties,
                fromTips: revenueFromServices.fromTips,
                fromAds: adRevenue,
                total: total
            });

            setTotalPayouts(monetizationService.getTotalPayouts());
        };

        calculateMetrics();
        const sub = () => calculateMetrics();
        monetizationService.subscribe(sub);
        socialService.subscribe(sub);

        return () => {
            monetizationService.unsubscribe(sub);
            socialService.unsubscribe(sub);
        }
    }, []);

    if (!platformRevenue) return null;

    const netProfit = platformRevenue.total - totalPayouts;

    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Monetization Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-700">Total Platform Revenue</p>
                    <p className="text-2xl font-bold font-orbitron text-green-800">{formatCurrency(platformRevenue.total)}</p>
                    <p className="text-xs text-green-600">From Ads, Tips & Royalties</p>
                </div>
                 <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-red-700">Total Artist Payouts</p>
                    <p className="text-2xl font-bold font-orbitron text-red-800">{formatCurrency(totalPayouts)}</p>
                    <p className="text-xs text-red-600">Royalties & Bonuses Paid</p>
                </div>
                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-blue-700">Net Platform Profit</p>
                    <p className="text-2xl font-bold font-orbitron text-blue-800">{formatCurrency(netProfit)}</p>
                    <p className="text-xs text-blue-600">After Artist Payouts</p>
                </div>
            </div>
        </div>
    )
}


const GenericGrowthChart: React.FC<{ data: { month: string, count: number }[], title: string, colorClass: string }> = ({ data, title, colorClass }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero
    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
            <div className="flex justify-around items-end h-64 gap-2">
                {data.map(item => (
                    <div key={item.month} className="flex flex-col items-center flex-1">
                        <div 
                            className={`w-full ${colorClass} rounded-t-md hover:opacity-80 transition-opacity`}
                            style={{ height: `${(item.count / maxCount) * 100}%` }}
                            title={`${item.count.toLocaleString()}`}
                        ></div>
                        <p className="text-xs text-gray-500 mt-2">{item.month}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TopPostsList: React.FC<{ posts: Post[] }> = ({ posts }) => (
    <div className="bg-white shadow-md p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Top Engaging Posts</h3>
        <div className="space-y-4">
            {posts.length > 0 ? posts.map(post => (
                <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 truncate">{post.content || "Repost"}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>by <span className="font-medium">{post.author.name}</span></span>
                        <span>&bull;</span>
                        <span>{post.likeCount} Likes</span>
                        <span>&bull;</span>
                        <span>{post.repostCount} Reposts</span>
                    </div>
                </div>
            )) : <p className="text-gray-500">No posts available.</p>}
        </div>
    </div>
);

const AdminAnalyticsDashboard: React.FC<{ analytics: AdminAnalytics }> = ({ analytics }) => {
    return (
        <div className="space-y-8">
            <MonetizationOverview />
            
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mt-12">User & Content Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={analytics.totalUsers} icon={<UsersIcon className="w-6 h-6 text-brand-blue" />} />
                <StatCard title="Active Users" value={analytics.activeUsers} icon={<UsersIcon className="w-6 h-6 text-green-600" />} />
                <StatCard title="Total Posts" value={analytics.totalPosts} icon={<ChartBarIcon className="w-6 h-6 text-purple-600" />} />
                <StatCard title="Engagement Rate" value={`${analytics.engagementRate}%`} icon={<ChartBarIcon className="w-6 h-6 text-orange-600" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GenericGrowthChart data={analytics.userGrowth} title="User Growth" colorClass="bg-brand-blue" />
                <GenericGrowthChart data={analytics.followerGrowth} title="Follower Growth" colorClass="bg-pink-500" />
            </div>
            <div className="grid grid-cols-1">
                 <TopPostsList posts={analytics.topPosts} />
            </div>
        </div>
    );
};

export default AdminAnalyticsDashboard;