import React, { useState, useEffect } from 'react';
import { DistributorAnalytics, Song } from '../types';
import { analyticsService } from '../services/analyticsService';
import { radioService } from '../services/radioService';
import { ChartBarIcon, MusicNoteIcon, UsersIcon } from './icons/Icons';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white shadow-md p-6 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-brand-blue/10 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold font-orbitron text-gray-900">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ data: { label: string, value: number }[], title: string, colorClass: string }> = ({ data, title, colorClass }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
            <div className="space-y-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 w-12 text-right">{item.label}</p>
                        <div className="flex-grow bg-gray-200 rounded-full h-4">
                            <div
                                className={`${colorClass} h-4 rounded-full flex items-center justify-end pr-2`}
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                               <span className="text-xs font-bold text-white">{item.value.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TopSongsList: React.FC<{ songs: Song[] }> = ({ songs }) => (
    <div className="bg-white shadow-md p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Top Performing Songs</h3>
        <div className="space-y-3">
            {songs.length > 0 ? songs.map(song => (
                <div key={song.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-md object-cover" />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm">{song.title}</p>
                        <p className="text-xs text-gray-500">{song.artist}</p>
                    </div>
                    <p className="font-semibold text-sm">{song.playCount.toLocaleString()} plays</p>
                </div>
            )) : <p className="text-gray-500">No song data available for this distributor.</p>}
        </div>
    </div>
);

const AdminDistributorAnalytics: React.FC = () => {
    const [distributors, setDistributors] = useState<string[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<string>('');
    const [analytics, setAnalytics] = useState<DistributorAnalytics | null>(null);

    useEffect(() => {
        const allSongs = radioService.getState().musicLibrary;
        const uniqueDistributors = Array.from(new Set(allSongs.map(s => s.distributor).filter(Boolean))) as string[];
        setDistributors(uniqueDistributors);
        if (uniqueDistributors.length > 0 && !selectedDistributor) {
            setSelectedDistributor(uniqueDistributors[0]);
        }
    }, []);

    useEffect(() => {
        if (selectedDistributor) {
            const data = analyticsService.getAnalyticsForDistributor(selectedDistributor);
            setAnalytics(data);
        } else {
            setAnalytics(null);
        }
    }, [selectedDistributor]);

    return (
        <div className="space-y-8">
            <div className="bg-white shadow-md rounded-lg p-4 flex items-center gap-4">
                <label htmlFor="distributor-select" className="font-semibold">Select Distributor:</label>
                {distributors.length > 0 ? (
                    <select
                        id="distributor-select"
                        value={selectedDistributor}
                        onChange={(e) => setSelectedDistributor(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                        {distributors.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                ) : (
                    <p className="text-sm text-gray-500">No distributors found in the music library.</p>
                )}
            </div>
            
            {analytics ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <StatCard title="Total Plays" value={analytics.totalPlays.toLocaleString()} icon={<ChartBarIcon className="w-6 h-6 text-brand-blue" />} />
                        <StatCard title="Track Count" value={analytics.topPerformingSongs.length} icon={<MusicNoteIcon className="w-6 h-6 text-purple-600" />} />
                        <StatCard title="Audience" value="Global" icon={<UsersIcon className="w-6 h-6 text-green-600" />} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <BarChart
                            title="Peak Listening Times (UTC)"
                            data={analytics.peakListeningTimes.map(d => ({ label: d.hour, value: d.plays }))}
                            colorClass="bg-blue-500"
                        />
                         <BarChart
                            title="Listener Demographics"
                            data={analytics.listenerDemographics.map(d => ({ label: d.ageRange, value: d.percentage }))}
                            colorClass="bg-teal-500"
                        />
                    </div>
                    <TopSongsList songs={analytics.topPerformingSongs} />
                </>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">Select a distributor to view their analytics.</p>
                </div>
            )}
        </div>
    );
};

export default AdminDistributorAnalytics;