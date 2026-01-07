import React, { useState } from 'react';
import { Station } from '../types';
import { radioService } from '../services/radioService';
import { XIcon } from './icons/Icons';

interface StationEditModalProps {
    station?: Station;
    onClose: () => void;
}

const StationEditModal: React.FC<StationEditModalProps> = ({ station, onClose }) => {
    const [name, setName] = useState(station?.name || '');
    const [streamUrl, setStreamUrl] = useState(station?.streamUrl || '');
    const [logoUrl, setLogoUrl] = useState(station?.logoUrl || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !logoUrl.trim()) {
            setError('Station Name and Logo URL are required.');
            return;
        }

        try {
            if (logoUrl) new URL(logoUrl);
            if (streamUrl) new URL(streamUrl);
        } catch (_) {
            setError('Please enter valid URLs for Logo and Stream URL.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (station) { // Edit mode
                radioService.updateStation({ ...station, name, streamUrl, logoUrl });
            } else { // Add mode
                radioService.addStation({ name, streamUrl, logoUrl });
            }
            onClose();
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{station ? 'Edit Station' : 'Add New Station'}</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Station Name" className="w-full p-2 border rounded" required />
                        <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Logo URL" className="w-full p-2 border rounded" required />
                        <input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="Stream URL (for external streams)" className="w-full p-2 border rounded" />
                        {error && <p className="text-sm text-red-600">{error}</p>}
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

export default StationEditModal;
