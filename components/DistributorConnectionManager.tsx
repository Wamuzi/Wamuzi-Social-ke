import React, { useState } from 'react';
import { XIcon, PlusIcon } from './icons/Icons';
import { radioService } from '../services/radioService';

const initialDistributors = [
    { name: 'TuneCore', logo: 'https://picsum.photos/seed/tunecore/100/100' },
    { name: 'DistroKid', logo: 'https://picsum.photos/seed/distrokid/100/100' },
    { name: 'CD Baby', logo: 'https://picsum.photos/seed/cdbaby/100/100' },
    { name: 'Amuse', logo: 'https://picsum.photos/seed/amuse/100/100' },
    { name: 'Ditto Music', logo: 'https://picsum.photos/seed/ditto/100/100' },
    { name: 'UnitedMasters', logo: 'https://picsum.photos/seed/unitedmasters/100/100' },
    { name: 'Symphonic', logo: 'https://picsum.photos/seed/symphonic/100/100' },
    { name: 'ONErpm', logo: 'https://picsum.photos/seed/onerpm/100/100' },
    { name: 'LANDR', logo: 'https://picsum.photos/seed/landr/100/100' },
    { name: 'AWAL', logo: 'https://picsum.photos/seed/awal/100/100' },
    { name: 'Vydia', logo: 'https://picsum.photos/seed/vydia/100/100' },
    { name: 'Freecord', logo: 'https://picsum.photos/seed/freecord/100/100' },
];

const ConnectionModal: React.FC<{ distributorName: string; onClose: () => void; onConnect: () => void; }> = ({ distributorName, onClose, onConnect }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onConnect();
            onClose();
        }, 1000); // Simulate API call
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Connect to {distributorName}</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">Enter your API credentials to sync your music library. This is a simulation.</p>
                    <input placeholder="API Key" className="w-full p-2 border rounded" />
                    <input placeholder="API Secret" className="w-full p-2 border rounded" type="password" />
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                    <button onClick={handleConnect} disabled={isLoading} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm w-32 flex justify-center">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddDistributorModal: React.FC<{ onClose: () => void; onAdd: (dist: {name: string, logo: string}) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd({
            name: name.trim(),
            logo: logoUrl.trim() || `https://picsum.photos/seed/${name.trim()}/100/100`,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Add New Distributor</h2>
                    <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Distributor Name (e.g., MyLabel)" className="w-full p-2 border rounded" required />
                    <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Logo URL (Optional)" className="w-full p-2 border rounded" />
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-sm">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold text-sm">Add & Connect</button>
                </div>
            </form>
        </div>
    );
};


const DistributorConnectionManager: React.FC = () => {
    const [distributors, setDistributors] = useState(initialDistributors);
    const [connected, setConnected] = useState<Set<string>>(new Set());
    const [modalOpenFor, setModalOpenFor] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const handleConnect = (distributorName: string) => {
        setConnected(prev => new Set(prev).add(distributorName));
    };

    const handleDisconnect = (distributorName: string) => {
        setConnected(prev => {
            const newSet = new Set(prev);
            newSet.delete(distributorName);
            return newSet;
        });
    };
    
    const handleSync = () => {
        setSyncing(true);
        radioService.syncFromDistributors(Array.from(connected));
        setTimeout(() => {
            alert("Sync complete! New music may now be available in the submissions panel below.");
            setSyncing(false);
        }, 1000);
    };

    const handleAddDistributor = (newDist: { name: string; logo: string }) => {
        if (distributors.some(d => d.name.toLowerCase() === newDist.name.toLowerCase())) {
            alert("A distributor with this name already exists.");
            return;
        }
        setDistributors(prev => [...prev, newDist]);
        setIsAddModalOpen(false);
        setModalOpenFor(newDist.name);
    };


    return (
        <>
            {modalOpenFor && (
                <ConnectionModal
                    distributorName={modalOpenFor}
                    onClose={() => setModalOpenFor(null)}
                    onConnect={() => handleConnect(modalOpenFor)}
                />
            )}
            {isAddModalOpen && (
                <AddDistributorModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddDistributor}
                />
            )}
            <div className="bg-white shadow-md p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Distributor Connections</h3>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-semibold hover:bg-gray-200 transition">
                        <PlusIcon className="w-4 h-4" /> Add Distributor
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {distributors.map(dist => {
                        const isConnected = connected.has(dist.name);
                        return (
                            <div key={dist.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">{dist.name}</span>
                                {isConnected ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-green-600">Connected</span>
                                        <button onClick={handleSync} disabled={syncing} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50">
                                            {syncing ? 'Syncing...' : 'Sync'}
                                        </button>
                                        <button onClick={() => handleDisconnect(dist.name)} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200">Disconnect</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setModalOpenFor(dist.name)} className="px-4 py-1.5 bg-brand-blue text-white text-sm font-semibold rounded-md hover:bg-blue-500">
                                        Connect
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default DistributorConnectionManager;