import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { monetizationService } from '../services/monetizationService';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';

const AdminArtistPayouts: React.FC = () => {
    const [payoutQueue, setPayoutQueue] = useState<(User & { availableBalance: number })[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const updateQueue = () => {
            setPayoutQueue(monetizationService.getPayoutQueue());
        };
        updateQueue();

        const sub = () => updateQueue();
        monetizationService.subscribe(sub);
        // Also subscribe to user service to get payout detail updates
        userService.subscribe(sub);
        return () => {
            monetizationService.unsubscribe(sub);
            userService.unsubscribe(sub);
        }
    }, []);

    const handleProcessPayout = (artistId: string) => {
        setProcessingId(artistId);
        // Simulate network delay
        setTimeout(() => {
            monetizationService.processPayout(artistId);
            setProcessingId(null);
        }, 1000);
    };

    const platformPayoutDetails = socialService.getPayoutDetails();
    const isPlatformConfigured = !!(platformPayoutDetails.bank.accountNumber || platformPayoutDetails.paypal.email);

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Artist Payout Requests</h3>
                <p className="text-sm text-gray-500">Review and process payout requests from artists.</p>
                 {!isPlatformConfigured && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
                        Warning: Platform payout details are not configured. Please set them up in Payout Settings to ensure artists can be paid.
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Payout</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist Payout Method</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payoutQueue.map(artistInQueue => {
                            const artistDetails = userService.getUserById(artistInQueue.id);
                            const artistPayoutDetails = artistDetails?.payoutDetails;
                            const isArtistConfigured = !!(artistPayoutDetails?.paypal.email || artistPayoutDetails?.bank.accountNumber);
                            const artistMethod = artistPayoutDetails?.paypal.email ? 'PayPal' : 'Bank Transfer';

                            return (
                                <tr key={artistInQueue.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full" src={artistInQueue.avatarUrl} alt={artistInQueue.name} />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{artistInQueue.name}</div>
                                                <div className="text-sm text-gray-500">{artistInQueue.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                        ${artistInQueue.availableBalance.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {isArtistConfigured ? artistMethod : <span className="text-yellow-600 font-semibold">Not Configured</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleProcessPayout(artistInQueue.id)}
                                            disabled={!isPlatformConfigured || !isArtistConfigured || processingId === artistInQueue.id}
                                            className="px-3 py-1.5 bg-brand-blue text-white text-sm font-semibold rounded-md hover:bg-blue-500 transition disabled:bg-gray-400 w-36 flex justify-center"
                                            title={!isArtistConfigured ? "Artist has not configured their payout details" : ""}
                                        >
                                            {processingId === artistInQueue.id ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Process Payout'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {payoutQueue.length === 0 && (
                     <p className="text-center text-gray-500 py-12">No pending payout requests.</p>
                )}
            </div>
        </div>
    );
};

export default AdminArtistPayouts;