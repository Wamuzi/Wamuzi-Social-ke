import React, { useState, useEffect } from 'react';
import { User, ArtistEarnings, PayoutRecord, Song } from '../types';
import { monetizationService } from '../services/monetizationService';
import { MoneyIcon, MusicNoteIcon, SparklesIcon, SettingsIcon } from './icons/Icons';
import ArtistPayoutSettings from './ArtistPayoutSettings';
import { userService } from '../services/userService';

interface ArtistMonetizationDashboardProps {
    user: User;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const PAYOUT_THRESHOLD = 50;

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white shadow-md p-6 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-green-500/10 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold font-orbitron text-gray-900">{String(value)}</p>
        </div>
    </div>
);


const PayoutWallet: React.FC<{ earnings: ArtistEarnings; user: User; }> = ({ earnings, user }) => {
    const isPayoutConfigured = !!(user.payoutDetails?.bank.accountNumber || user.payoutDetails?.paypal.email);
    const canRequestPayout = earnings.availableBalance >= PAYOUT_THRESHOLD && isPayoutConfigured && !earnings.payoutRequested;

    const handleRequest = () => {
        if (canRequestPayout) {
            monetizationService.requestArtistPayout(user.id);
        }
    };

    let buttonContent = 'Request Payout';
    let buttonDisabled = true;
    let buttonTitle = '';

    if (earnings.payoutRequested) {
        buttonContent = 'Payout Requested';
    } else if (earnings.availableBalance < PAYOUT_THRESHOLD) {
        buttonTitle = `You need at least $${PAYOUT_THRESHOLD} to request a payout.`;
    } else if (!isPayoutConfigured) {
        buttonTitle = 'Please configure your payout settings first.';
    } else {
        buttonDisabled = false;
    }


    return (
        <div className="bg-white shadow-md p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <p className="text-gray-500 text-sm">Your Wallet</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                    Once your balance reaches ${PAYOUT_THRESHOLD.toFixed(2)}, you can request a payout.
                </p>
                <p className="text-xs text-gray-500">Funds will be sent to your configured payout method within 5-7 business days of request.</p>
            </div>
            <button
                onClick={handleRequest}
                disabled={buttonDisabled}
                title={buttonTitle}
                className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg transition hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
                {buttonContent}
            </button>
        </div>
    )
}


const MainDashboard: React.FC<{ earnings: ArtistEarnings | null; songs: (Song & { earnings: number })[]; payouts: PayoutRecord[]; user: User; }> = ({ earnings, songs, payouts, user }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <StatCard 
                title="Available for Payout" 
                value={formatCurrency(earnings?.availableBalance || 0)} 
                icon={<MoneyIcon className="w-6 h-6 text-green-600"/>} 
            />
            <StatCard 
                title="Lifetime Earnings" 
                value={formatCurrency(earnings?.lifetimeEarnings || 0)} 
                icon={<MusicNoteIcon className="w-6 h-6 text-purple-600"/>} 
            />
        </div>
        
        {earnings && <PayoutWallet earnings={earnings} user={user} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow-md rounded-lg">
                <div className="p-4 border-b"><h3 className="text-xl font-semibold text-gray-900">Song Performance</h3></div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {songs.map(song => (
                        <div key={song.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-md object-cover" />
                            <div className="flex-grow"><p className="font-semibold text-sm">{song.title}</p><p className="text-xs text-gray-500">{song.playCount.toLocaleString()} plays</p></div>
                            <p className="font-semibold text-sm">{formatCurrency(song.earnings)}</p>
                        </div>
                    ))}
                    {songs.length === 0 && <p className="text-center text-gray-500 py-8">No songs with earnings yet.</p>}
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg">
                <div className="p-4 border-b"><h3 className="text-xl font-semibold text-gray-900">Payout History</h3></div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {payouts.length > 0 ? payouts.map(payout => (
                        <div key={payout.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-sm">{formatCurrency(payout.amount)}</p>
                                <p className="text-xs text-gray-500">Processed on {new Date(payout.processedDate).toLocaleDateString()}</p>
                            </div>
                            {payout.type === 'bonus' ? (
                                <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                                    <SparklesIcon className="w-3 h-3"/> Bonus
                                </span>
                            ) : (
                                <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {payout.method}
                                </span>
                            )}
                        </div>
                    )) : <p className="text-center text-gray-500 py-8">No payouts have been made yet.</p>}
                </div>
            </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
             <h3 className="text-lg font-semibold text-gray-900">How Royalties Work</h3>
             <p className="text-sm text-gray-600 mt-2">
                Wamuzi operates a closed-loop royalty system. We calculate your earnings based on the number of plays your tracks receive <strong>on our platform</strong>. Payouts come directly from us to your configured bank or PayPal account, not from your distributor.
             </p>
        </div>
    </div>
);


const ArtistMonetizationDashboard: React.FC<ArtistMonetizationDashboardProps> = ({ user }) => {
    const [earnings, setEarnings] = useState<ArtistEarnings | null>(null);
    const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
    const [songs, setSongs] = useState<(Song & { earnings: number })[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
    const [currentUser, setCurrentUser] = useState(userService.getUserById(user.id));

    useEffect(() => {
        const updateData = () => {
            setEarnings(monetizationService.getArtistEarnings(user.id));
            setPayouts(monetizationService.getPayoutHistory(user.id));
            setSongs(monetizationService.getArtistSongsWithEarnings(user.id));
            setCurrentUser(userService.getUserById(user.id));
        };
        
        updateData();
        const sub = () => updateData();
        monetizationService.subscribe(sub);
        userService.subscribe(sub);
        return () => {
            monetizationService.unsubscribe(sub);
            userService.unsubscribe(sub);
        }
    }, [user.id]);

    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-200">
                <button onClick={() => setActiveTab('dashboard')} className={`py-2 px-4 text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}>
                    <MoneyIcon className="w-4 h-4" /> Dashboard
                </button>
                 <button onClick={() => setActiveTab('settings')} className={`py-2 px-4 text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'settings' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}>
                    <SettingsIcon className="w-4 h-4" /> Payout Settings
                </button>
            </div>
            
            {activeTab === 'dashboard' && <MainDashboard earnings={earnings} songs={songs} payouts={payouts} user={currentUser} />}
            {activeTab === 'settings' && <ArtistPayoutSettings user={currentUser} />}
        </div>
    );
};

export default ArtistMonetizationDashboard;