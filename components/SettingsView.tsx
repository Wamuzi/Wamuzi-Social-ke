import React from 'react';
import { userService } from '../services/userService';
import { MoneyIcon, SparklesIcon, UsersIcon, LockClosedIcon, ShieldCheckIcon, BellIcon, TrashIcon } from './icons/Icons';

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-white shadow-md rounded-lg">
        <div className="p-6 border-b">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-brand-blue/10 text-brand-blue">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
        </div>
        <div className="p-6 prose prose-sm max-w-none text-gray-600">
            {children}
        </div>
    </div>
);

const SettingsView: React.FC = () => {
    const currentUser = userService.getCurrentUser();

    if (!currentUser) {
        return <div className="max-w-4xl mx-auto"><p>Please log in to view settings.</p></div>;
    }
    
    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure you want to PERMANENTLY DELETE your account? This action cannot be undone and all your data will be lost.")) {
            if (window.confirm("This is your final confirmation. Are you absolutely sure?")) {
                userService.deleteUser(currentUser.id);
            }
        }
    };

    const MonetizationContent = () => {
        const MONETIZATION_FOLLOWER_REQUIREMENT = 10000;
        const isEligibleForMonetization = currentUser.followersCount >= MONETIZATION_FOLLOWER_REQUIREMENT;
        const progressPercentage = Math.min((currentUser.followersCount / MONETIZATION_FOLLOWER_REQUIREMENT) * 100, 100);

        if (isEligibleForMonetization) {
            return (
                 <>
                    <p>Congratulations! You're eligible for our monetization tools (coming soon):</p>
                    <ul>
                        <li><strong>Creator Fund:</strong> Get rewarded for creating engaging content.</li>
                        <li><strong>Tips & Gifts:</strong> Allow followers to send you tips and gifts.</li>
                        <li><strong>Subscriptions:</strong> Offer exclusive content for a monthly fee.</li>
                    </ul>
                </>
            );
        }
        
        return (
            <div className="relative p-4 border rounded-lg bg-gray-50">
                <div className="absolute top-2 right-2 text-gray-400">
                    <LockClosedIcon className="w-5 h-5" />
                </div>
                 <h4 className="font-semibold text-gray-700">Reach 10,000 Followers to Unlock</h4>
                <p>Monetization tools are available to creators who have built a substantial audience.</p>
                <div className="mt-4">
                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{currentUser.followersCount.toLocaleString()} / {MONETIZATION_FOLLOWER_REQUIREMENT.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-brand-blue h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-orbitron text-gray-900 mb-8">Settings</h2>
            
            <div className="space-y-8">
                <SettingsCard title="Account" icon={<UsersIcon className="w-6 h-6"/>}>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold">Delete Your Account</p>
                                <p className="text-xs">Permanently delete your account and all of its content.</p>
                            </div>
                            <button onClick={handleDeleteAccount} className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-md hover:bg-red-200">
                                <TrashIcon className="w-4 h-4 inline -mt-0.5 mr-1"/> Delete
                            </button>
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Monetization" icon={<MoneyIcon className="w-6 h-6"/>}>
                    <MonetizationContent />
                </SettingsCard>

                <SettingsCard title="Affiliate Program" icon={<SparklesIcon className="w-6 h-6"/>}>
                    <p>Help grow the Wamuzi community and get rewarded. More details on commission rates and tracking will be available soon.</p>
                </SettingsCard>
                
                <SettingsCard title="Privacy & Safety" icon={<ShieldCheckIcon className="w-6 h-6"/>}>
                    <p>Manage who can see your content and how they interact with you. <em>(Settings coming soon)</em></p>
                </SettingsCard>
                
                 <SettingsCard title="Notifications" icon={<BellIcon className="w-6 h-6"/>}>
                    <p>Control which notifications you receive. <em>(Settings coming soon)</em></p>
                </SettingsCard>

            </div>
        </div>
    );
};

export default SettingsView;