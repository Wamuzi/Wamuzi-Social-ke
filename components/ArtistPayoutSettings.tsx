import React, { useState } from 'react';
import { PayoutDetails, User } from '../types';
import { userService } from '../services/userService';

interface ArtistPayoutSettingsProps {
    user: User;
}

const ArtistPayoutSettings: React.FC<ArtistPayoutSettingsProps> = ({ user }) => {
    const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>(user.payoutDetails || {
        bank: { accountName: '', accountNumber: '', bankName: '', swiftCode: '' },
        paypal: { email: '' },
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [category, field] = name.split('.');
        setPayoutDetails(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [field]: value,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        userService.updateArtistPayoutDetails(user.id, payoutDetails);
        setTimeout(() => {
            setIsLoading(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-6">Payout Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Configure how you receive your earnings. Payments are processed automatically when your balance reaches the payout threshold.</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white shadow-md p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="bank.accountName" value={payoutDetails.bank.accountName} onChange={handleInputChange} placeholder="Account Holder Name" className="p-2 border rounded" />
                        <input name="bank.accountNumber" value={payoutDetails.bank.accountNumber} onChange={handleInputChange} placeholder="Account Number" className="p-2 border rounded" />
                        <input name="bank.bankName" value={payoutDetails.bank.bankName} onChange={handleInputChange} placeholder="Bank Name" className="p-2 border rounded" />
                        <input name="bank.swiftCode" value={payoutDetails.bank.swiftCode} onChange={handleInputChange} placeholder="SWIFT/BIC Code" className="p-2 border rounded" />
                    </div>
                </div>

                <div className="bg-white shadow-md p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">PayPal Details</h3>
                    <input name="paypal.email" type="email" value={payoutDetails.paypal.email} onChange={handleInputChange} placeholder="PayPal Email Address" className="p-2 border rounded w-full md:w-1/2" />
                </div>

                <div className="flex justify-end items-center gap-4">
                    {isSaved && <p className="text-green-600 text-sm font-semibold">Settings saved!</p>}
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-brand-blue text-white rounded-md font-semibold hover:bg-blue-500 transition w-32 flex justify-center">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArtistPayoutSettings;