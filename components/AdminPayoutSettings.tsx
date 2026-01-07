import React, { useState, useEffect } from 'react';
import { socialService } from '../services/socialService';
import { monetizationService } from '../services/monetizationService';
import { PlatformRevenue } from '../types';
import { MoneyIcon } from './icons/Icons';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const AdminPayoutSettings: React.FC = () => {
    const [payoutDetails, setPayoutDetails] = useState(socialService.getPayoutDetails());
    const [platformRevenue, setPlatformRevenue] = useState<PlatformRevenue | null>(null);
    const [isSaved, setIsSaved] = useState(false);

     useEffect(() => {
        const calculateRevenue = () => {
            const revenueFromServices = monetizationService.getPlatformRevenue();
            const adRevenue = socialService.getTotalAdRevenue();
            const total = revenueFromServices.fromRoyalties + revenueFromServices.fromTips + adRevenue;
            
            setPlatformRevenue({
                fromRoyalties: revenueFromServices.fromRoyalties,
                fromTips: revenueFromServices.fromTips,
                fromAds: adRevenue,
                total: total
            });
        };

        calculateRevenue();
        const sub = () => calculateRevenue();
        monetizationService.subscribe(sub);
        socialService.subscribe(sub);

        return () => {
            monetizationService.unsubscribe(sub);
            socialService.unsubscribe(sub);
        }
    }, []);

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
        socialService.updatePayoutDetails(payoutDetails);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-6">Platform Payout Settings</h2>
             <form onSubmit={handleSubmit} className="space-y-8">
                 {platformRevenue && (
                    <div className="bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2"><MoneyIcon className="w-6 h-6 text-green-600"/> Platform Earnings</h3>
                        <p className="text-sm text-gray-500 mb-4">Platform earnings are automatically deposited to the primary bank account configured below at the end of each month.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Accumulated Revenue</p>
                                <p className="text-2xl font-bold font-orbitron text-green-700">{formatCurrency(platformRevenue.total)}</p>
                            </div>
                             <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Breakdown (Royalties / Ads / Tips)</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {formatCurrency(platformRevenue.fromRoyalties)} / {formatCurrency(platformRevenue.fromAds)} / {formatCurrency(platformRevenue.fromTips)}
                                </p>
                            </div>
                        </div>
                    </div>
                 )}

                {/* Bank Account Details */}
                <div className="bg-white shadow-md p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Primary Bank Account (for Platform Revenue)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="bank.accountName" value={payoutDetails.bank.accountName} onChange={handleInputChange} placeholder="Account Holder Name" className="p-2 border rounded" />
                        <input name="bank.accountNumber" value={payoutDetails.bank.accountNumber} onChange={handleInputChange} placeholder="Account Number" className="p-2 border rounded" />
                        <input name="bank.bankName" value={payoutDetails.bank.bankName} onChange={handleInputChange} placeholder="Bank Name" className="p-2 border rounded" />
                        <input name="bank.swiftCode" value={payoutDetails.bank.swiftCode} onChange={handleInputChange} placeholder="SWIFT/BIC Code" className="p-2 border rounded" />
                    </div>
                </div>

                {/* PayPal Details */}
                <div className="bg-white shadow-md p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Alternative Payout Method (for Artist Payments)</h3>
                    <p className="text-sm text-gray-500 mb-2">If an artist selects PayPal, payments will be sent from this account.</p>
                    <input name="paypal.email" type="email" value={payoutDetails.paypal.email} onChange={handleInputChange} placeholder="PayPal Email Address" className="p-2 border rounded w-full md:w-1/2" />
                </div>

                <div className="flex justify-end items-center gap-4">
                    {isSaved && <p className="text-green-600 text-sm font-semibold">Settings saved!</p>}
                    <button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-md font-semibold hover:bg-blue-500 transition">
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPayoutSettings;