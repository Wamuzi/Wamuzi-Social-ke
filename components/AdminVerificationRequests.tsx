import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { VerificationRequest, User } from '../types';
import { CheckIcon, XIcon, CheckBadgeIcon, TrashIcon } from './icons/Icons';

const AdminVerificationRequests: React.FC = () => {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [verifiedUsers, setVerifiedUsers] = useState<User[]>([]);

    useEffect(() => {
        const updateState = () => {
            setRequests(userService.getPendingVerificationRequests());
            setVerifiedUsers(userService.getVerifiedUsers());
        };
        updateState(); // Initial fetch

        userService.subscribe(updateState);
        return () => userService.unsubscribe(updateState);
    }, []);

    const handleApprove = (req: VerificationRequest) => {
        if (window.confirm(`Are you sure you want to approve ${req.user.name} for verification?`)) {
            userService.approveVerification(req.id);
        }
    };

    const handleReject = (req: VerificationRequest) => {
        if (window.confirm(`Are you sure you want to reject ${req.user.name}'s verification request?`)) {
            userService.rejectVerification(req.id);
        }
    };
    
    const handleUnverify = (user: User) => {
        if (window.confirm(`Are you sure you want to remove verification for ${user.name}?`)) {
            userService.removeVerification(user.id);
        }
    };

    const handleDeleteUser = (user: User) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE ${user.name}? This cannot be undone.`)) {
            userService.deleteUser(user.id);
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Requests */}
            <div className="bg-white shadow-md rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500"/> Pending Requests
                    </h3>
                    <p className="text-sm text-gray-500">Review new applications for the verified badge.</p>
                </div>
                <div className="space-y-3 p-4 max-h-[70vh] overflow-y-auto">
                    {requests.length > 0 ? (
                        requests.map(req => (
                            <div key={req.id} className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <img src={req.user.avatarUrl} alt={req.user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{req.user.name}</p>
                                        <p className="text-sm text-gray-500">{req.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex-grow w-full sm:w-auto">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${req.type === 'paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {req.type === 'paid' ? 'Subscription' : 'Follower Count'}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(req.submittedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => handleApprove(req)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition" title="Approve">
                                        <CheckIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleReject(req)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition" title="Reject">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No pending verification requests.</p>
                    )}
                </div>
            </div>
            
            {/* Verified Users */}
            <div className="bg-white shadow-md rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <CheckBadgeIcon className="w-5 h-5 text-green-500"/> Verified Users
                    </h3>
                    <p className="text-sm text-gray-500">Manage currently verified users.</p>
                </div>
                <div className="space-y-3 p-4 max-h-[70vh] overflow-y-auto">
                    {verifiedUsers.length > 0 ? (
                        verifiedUsers.map(user => (
                            <div key={user.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => handleUnverify(user)} className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition" title="Remove Verification">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                     <button onClick={() => handleDeleteUser(user)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition" title="Delete User">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No users are verified yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminVerificationRequests;