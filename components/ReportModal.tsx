import React, { useState } from 'react';
import { socialService } from '../services/socialService';
import { XIcon, FlagIcon } from './icons/Icons';

interface ReportModalProps {
    contentId: string;
    contentType: 'post' | 'profile';
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ contentId, contentType, onClose }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;
        setIsSubmitting(true);
        
        socialService.reportContent(contentId, contentType, reason);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setTimeout(onClose, 2000);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                {isSubmitted ? (
                    <div className="p-8 text-center">
                        <CheckIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">Report Submitted</h2>
                        <p className="text-gray-600 mt-2">Thank you for helping keep our community safe. Our team will review your report shortly.</p>
                    </div>
                ) : (
                     <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FlagIcon className="w-5 h-5 text-red-500" />
                                Report {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                            </h2>
                            <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6">
                            <label htmlFor="reason" className="font-semibold text-gray-700">Reason for reporting</label>
                            <p className="text-sm text-gray-500 mb-2">Please provide details about why you are reporting this content.</p>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full bg-gray-50 border-gray-300 rounded-md p-2 mt-1"
                                rows={4}
                                required
                                minLength={10}
                                placeholder="e.g., This content is spam, harassment, or violates community guidelines..."
                            />
                        </div>
                        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                            <button type="submit" disabled={isSubmitting || !reason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold text-sm w-32 flex justify-center disabled:bg-red-400">
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default ReportModal;
