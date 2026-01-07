import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { monetizationService } from '../services/monetizationService';
import { SparklesIcon } from './icons/Icons';

const AdminCreatorFund: React.FC = () => {
    const [topArtists, setTopArtists] = useState<(User & { totalPlays: number })[]>([]);
    const [bonusAmounts, setBonusAmounts] = useState<{ [artistId: string]: string }>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const artists = monetizationService.getTopStreamedArtists(10);
        setTopArtists(artists);
    }, []);

    const handleAmountChange = (artistId: string, amount: string) => {
        // Allow only numbers
        if (/^\d*\.?\d*$/.test(amount)) {
            setBonusAmounts(prev => ({ ...prev, [artistId]: amount }));
        }
    };
    
    const handleAwardBonus = (artist: User & { totalPlays: number }) => {
        const amount = parseFloat(bonusAmounts[artist.id]);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid bonus amount.");
            return;
        }

        if (window.confirm(`Are you sure you want to award a $${amount} bonus to ${artist.name}?`)) {
            setProcessingId(artist.id);
            // Simulate network delay
            setTimeout(() => {
                monetizationService.processBonusPayout(artist.id, amount, 'Creator Fund Monthly Bonus');
                setBonusAmounts(prev => ({...prev, [artist.id]: ''}));
                setProcessingId(null);
            }, 1500);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-500"/> Creator Fund
                </h3>
                <p className="text-sm text-gray-500">Award bonuses to the top performing artists for this period.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Plays</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus Amount (USD)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {topArtists.map((artist, index) => (
                            <tr key={artist.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-gray-700">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full" src={artist.avatarUrl} alt={artist.name} />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                                            <div className="text-sm text-gray-500">{artist.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{artist.totalPlays.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="text"
                                            value={bonusAmounts[artist.id] || ''}
                                            onChange={(e) => handleAmountChange(artist.id, e.target.value)}
                                            placeholder="e.g., 100"
                                            className="w-32 p-2 pl-6 border rounded-md"
                                        />
                                    </div>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleAwardBonus(artist)}
                                        disabled={processingId === artist.id || !bonusAmounts[artist.id]}
                                        className="px-3 py-1.5 bg-yellow-400 text-yellow-900 text-sm font-semibold rounded-md hover:bg-yellow-500 transition disabled:bg-gray-300 w-36 flex justify-center"
                                    >
                                        {processingId === artist.id ? <div className="w-5 h-5 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin"></div> : 'Award Bonus'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {topArtists.length === 0 && <p className="text-center text-gray-500 py-12">No artist data to display.</p>}
            </div>
        </div>
    );
};

export default AdminCreatorFund;