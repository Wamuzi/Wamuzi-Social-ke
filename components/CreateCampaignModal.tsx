import React, { useState } from 'react';
import { Post } from '../types';
import { socialService } from '../services/socialService';
import { XIcon } from './icons/Icons';

interface CreateCampaignModalProps {
    post: Post;
    onClose: () => void;
}

type Step = 'details' | 'payment' | 'card_form' | 'paypal_form' | 'submitted';

const PromoteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);

const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ post, onClose }) => {
    const [step, setStep] = useState<Step>('details');
    const [budget, setBudget] = useState(50);
    const [duration, setDuration] = useState(3);
    const [isLoading, setIsLoading] = useState(false);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('payment');
    };
    
    const handlePayment = () => {
        setIsLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            socialService.createCampaign(post.id, budget, duration);
            setIsLoading(false);
            setStep('submitted');
            setTimeout(onClose, 3000);
        }, 1500);
    };

    const getEstimatedReach = () => {
        return (budget * 100 * (duration / 2)).toLocaleString();
    };
    
    const CardForm = () => (
        <div className="space-y-4">
            <input placeholder="Card Number" className="w-full p-2 border rounded" />
            <div className="flex gap-4">
                <input placeholder="MM / YY" className="w-1/2 p-2 border rounded" />
                <input placeholder="CVC" className="w-1/2 p-2 border rounded" />
            </div>
            <input placeholder="Name on Card" className="w-full p-2 border rounded" />
            <button onClick={handlePayment} disabled={isLoading} className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                {isLoading ? 'Processing...' : `Pay $${budget}`}
            </button>
        </div>
    );

    const PayPalForm = () => (
        <div className="text-center space-y-4">
            <p>You will be redirected to PayPal to complete your payment securely.</p>
            <button onClick={handlePayment} disabled={isLoading} className="w-full p-3 bg-yellow-400 text-gray-800 font-semibold rounded-lg hover:bg-yellow-500 transition">
                 {isLoading ? 'Connecting...' : 'Connect with PayPal'}
            </button>
        </div>
    );

    const renderContent = () => {
        switch(step) {
            case 'submitted':
                return (
                     <div className="p-8 text-center">
                        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">Campaign Submitted!</h2>
                        <p className="text-gray-600 mt-2">Your campaign is pending review. You can track its status in the Ad Center.</p>
                    </div>
                );
            case 'card_form':
            case 'paypal_form':
                 return (
                    <div>
                         <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Complete Payment</h2>
                            <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {step === 'card_form' ? <CardForm /> : <PayPalForm />}
                        </div>
                         <div className="p-4 bg-gray-50 rounded-b-lg flex justify-start">
                            <button type="button" onClick={() => setStep('payment')} className="px-4 py-2 text-sm font-semibold"> &larr; Back</button>
                        </div>
                    </div>
                );
            case 'payment':
                 return (
                    <div>
                         <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Choose Payment Method</h2>
                            <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <p className="text-gray-600">Total Amount</p>
                                <p className="text-4xl font-bold text-gray-900">${budget}</p>
                                <p className="text-sm text-gray-500">for a {duration}-day campaign</p>
                            </div>
                            <div className="space-y-3">
                                <button onClick={() => setStep('card_form')} className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                                    Pay with Card
                                </button>
                                 <button onClick={() => setStep('paypal_form')} className="w-full p-3 bg-yellow-400 text-gray-800 font-semibold rounded-lg hover:bg-yellow-500 transition">
                                    Use PayPal
                                </button>
                            </div>
                        </div>
                         <div className="p-4 bg-gray-50 rounded-b-lg flex justify-start">
                            <button type="button" onClick={() => setStep('details')} className="px-4 py-2 text-sm font-semibold"> &larr; Back</button>
                        </div>
                    </div>
                );
            case 'details':
            default:
                 return (
                    <form onSubmit={handleDetailsSubmit}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold flex items-center gap-2"><PromoteIcon className="w-5 h-5"/> Promote Post</h2>
                            <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-700">Post Preview</h3>
                                <div className="p-2 bg-gray-50 rounded-md mt-1 border flex items-start gap-2">
                                    {post.attachment?.type === 'image' && <img src={post.attachment.url} alt="post preview" className="w-16 h-16 rounded object-cover" />}
                                     {post.attachment?.type === 'video' && post.attachment.imageAsVideoUrl && <img src={post.attachment.imageAsVideoUrl} alt="reel preview" className="w-16 h-16 rounded object-cover" />}
                                    <p className="text-sm text-gray-600 line-clamp-3">{post.content || "Reel"}</p>
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700">Budget (USD)</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <input type="range" min="10" max="500" step="5" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full" />
                                    <span className="font-bold text-lg w-20 text-right">${budget}</span>
                                </div>
                            </div>
                             <div>
                                <label className="font-semibold text-gray-700">Duration</label>
                                <div className="flex justify-between gap-2 mt-2">
                                    {[1, 3, 7, 14].map(d => (
                                        <button key={d} type="button" onClick={() => setDuration(d)} className={`w-full p-2 rounded-md font-semibold border-2 transition ${duration === d ? 'bg-brand-blue text-white border-brand-blue' : 'bg-gray-100 border-transparent hover:border-gray-300'}`}>
                                            {d} Day{d > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                <p className="text-sm text-blue-800">Estimated Reach</p>
                                <p className="text-2xl font-bold text-blue-900">{getEstimatedReach()} people</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm">
                                Continue
                            </button>
                        </div>
                    </form>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    );
};

export default CreateCampaignModal;