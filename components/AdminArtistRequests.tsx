import React, { useState } from 'react';
import { userService } from '../services/userService';
import { ArtistApplication } from '../types';
import { CheckIcon, XIcon, EyeIcon, PencilIcon } from './icons/Icons';
import ArtistApplicationEditModal from './ArtistApplicationEditModal';
import ApproveArtistModal from './ApproveArtistModal';

const AdminArtistRequests: React.FC = () => {
    const requests = userService.getArtistRequests();
    const [editingApp, setEditingApp] = useState<ArtistApplication | null>(null);
    const [approvingApp, setApprovingApp] = useState<ArtistApplication | null>(null);

    const handleReject = (app: ArtistApplication) => {
        if (window.confirm(`Are you sure you want to reject ${app.user.name}'s application?`)) {
            userService.rejectArtistProfile(app.id);
        }
    };
    
    const viewScreenshot = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <>
            {editingApp && <ArtistApplicationEditModal application={editingApp} onClose={() => setEditingApp(null)} />}
            {approvingApp && <ApproveArtistModal application={approvingApp} onClose={() => setApprovingApp(null)} />}
            <div className="bg-white shadow-md rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">Artist Profile Requests</h3>
                    <p className="text-sm text-gray-500">Review and approve or reject applications for artist status.</p>
                </div>
                <div className="space-y-3 p-4 max-h-[70vh] overflow-y-auto">
                    {requests.length > 0 ? (
                        requests.map(app => (
                            <div key={app.id} className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <img src={app.user.avatarUrl} alt={app.user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{app.user.name}</p>
                                        <p className="text-sm text-gray-500">{app.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex-grow w-full sm:w-auto">
                                    <p className="text-sm text-gray-600"><strong>Contact:</strong> {app.contactInfo}</p>
                                    <p className="text-sm text-gray-600 mt-1"><strong>Notes:</strong> {app.notes || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                     <button onClick={() => setEditingApp(app)} className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition" title="Edit Application">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => viewScreenshot(app.screenshotUrl)} className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition" title="View Screenshot">
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setApprovingApp(app)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition" title="Approve">
                                        <CheckIcon className="w-5 h-5" />
                                    </button>
                                     <button onClick={() => handleReject(app)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition" title="Reject">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No pending artist requests.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminArtistRequests;