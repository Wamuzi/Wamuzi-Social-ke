import React, { useState } from 'react';
import { ArtistApplication } from '../types';
import { userService } from '../services/userService';
import { XIcon } from './icons/Icons';

interface ArtistApplicationEditModalProps {
    application: ArtistApplication;
    onClose: () => void;
}

const ArtistApplicationEditModal: React.FC<ArtistApplicationEditModalProps> = ({ application, onClose }) => {
    const [contactInfo, setContactInfo] = useState(application.contactInfo);
    const [notes, setNotes] = useState(application.notes);
    const [status, setStatus] = useState(application.status);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        userService.updateArtistApplication(application.id, {
            contactInfo,
            notes,
            status,
        });
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Edit Application for {application.user.name}</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="status" className="font-semibold text-gray-700">Status</label>
                            <select id="status" value={status} onChange={e => setStatus(e.target.value as ArtistApplication['status'])} className="w-full p-2 border rounded bg-white mt-1">
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="contactInfo" className="font-semibold text-gray-700">Contact Info</label>
                            <input id="contactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label htmlFor="notes" className="font-semibold text-gray-700">Admin Notes</label>
                            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded mt-1" rows={3} placeholder="Internal notes for this application..." />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm w-24 flex justify-center">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArtistApplicationEditModal;
