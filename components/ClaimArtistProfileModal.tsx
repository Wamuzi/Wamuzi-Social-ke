import React, { useState } from 'react';
import { userService } from '../services/userService';
import { XIcon, ImageIcon } from './icons/Icons';

interface ClaimArtistProfileModalProps {
    onClose: () => void;
}

const ClaimArtistProfileModal: React.FC<ClaimArtistProfileModalProps> = ({ onClose }) => {
    const [notes, setNotes] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError('File is too large. Please upload an image under 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setScreenshot(event.target.result as string);
                    setError('');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!screenshot) {
            setError('Please upload a screenshot as proof.');
            return;
        }
        if (!contactInfo.trim()) {
            setError('Please provide your contact information.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        const success = userService.requestArtistProfile({
            screenshotUrl: screenshot,
            notes: notes,
            contactInfo: contactInfo,
        });

        setIsLoading(false);
        if (success) {
            onClose();
        } else {
            setError('There was an error submitting your application. You may have one pending already.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Artist Verification</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="font-semibold text-gray-700">Proof of Artistry</label>
                            <p className="text-sm text-gray-500 mb-2">
                                Please upload a screenshot of your music distributor's dashboard (e.g., TuneCore, DistroKid) showing at least one of your songs.
                            </p>
                             <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                {screenshot ? (
                                    <div className="relative">
                                        <img src={screenshot} alt="Screenshot preview" className="max-h-48 rounded-md" />
                                        <button onClick={() => setScreenshot(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full text-xs">Remove</button>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-blue hover:text-blue-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="contactInfo" className="font-semibold text-gray-700">Contact Info</label>
                            <p className="text-sm text-gray-500 mb-1">Provide an email or phone number for verification.</p>
                            <input
                                id="contactInfo"
                                value={contactInfo}
                                onChange={e => setContactInfo(e.target.value)}
                                placeholder="e.g., artist-name@email.com"
                                className="w-full bg-gray-50 border-gray-300 rounded-md p-2 mt-1"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="notes" className="font-semibold text-gray-700">Additional Notes (Optional)</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Anything else we should know?"
                                className="w-full bg-gray-50 border-gray-300 rounded-md p-2 mt-1"
                                rows={2}
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm w-32 flex justify-center">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClaimArtistProfileModal;