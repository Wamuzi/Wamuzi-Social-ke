import { DistributorAnalytics, Song } from '../types';
import { radioService } from './radioService';

class AnalyticsService {
    
    getAnalyticsForDistributor(distributorName: string): DistributorAnalytics {
        const musicLibrary = radioService.getState().musicLibrary;
        const distributorSongs = musicLibrary.filter(s => s.distributor === distributorName);

        const totalPlays = distributorSongs.reduce((sum, song) => sum + song.playCount, 0);

        const topPerformingSongs = [...distributorSongs]
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 5);

        // Mock data for demonstration purposes
        const peakListeningTimes = this.generateMockPeakTimes(totalPlays);
        const listenerDemographics = this.generateMockDemographics();

        return {
            totalPlays,
            topPerformingSongs,
            peakListeningTimes,
            listenerDemographics,
        };
    }

    private generateMockPeakTimes = (totalPlays: number) => {
        const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
        // Weights to simulate morning commute, afternoon, and evening peaks
        const weights = [1,1,1,1,1,2,4,5,4,3,3,4,5,5,6,7,8,9,8,6,4,3,2,1];
        const totalWeight = weights.reduce((s, a) => s + a, 0);

        return hours.map((hour, index) => ({
            hour,
            plays: Math.floor((weights[index] / totalWeight) * totalPlays),
        }));
    }

    private generateMockDemographics = () => {
        return [
            { ageRange: '13-17', percentage: 15 },
            { ageRange: '18-24', percentage: 35 },
            { ageRange: '25-34', percentage: 25 },
            { ageRange: '35-44', percentage: 15 },
            { ageRange: '45+', percentage: 10 },
        ];
    }
}

export const analyticsService = new AnalyticsService();