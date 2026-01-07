import { ArtistEarnings, PayoutRecord, Song, User } from '../types';
import { userService } from './userService';
import { radioService } from './radioService';
import { socialService } from './socialService';

type Subscriber = () => void;

const ROYALTY_RATE_PER_PLAY = 0.003;
const PAYOUT_THRESHOLD = 50;
const PLATFORM_ROYALTY_CUT = 0.30; // 30%
const PLATFORM_TIP_CUT = 0.15; // 15%

class MonetizationService {
    private subscribers: Subscriber[] = [];
    private earnings: Map<string, ArtistEarnings> = new Map();
    private payouts: PayoutRecord[] = [];
    private tips: Map<string, number> = new Map(); // artistId -> total tips received

    // Platform Revenue Tracking
    private platformRevenueFromRoyalties = 0;
    private platformRevenueFromTips = 0;

    constructor() {
        this.recalculateAllEarnings();
        // Recalculate whenever music plays or users change
        radioService.subscribe(this.recalculateAllEarnings);
        userService.subscribe(this.recalculateAllEarnings);
    }

    private notify = () => {
        this.subscribers.forEach(cb => cb());
    }

    subscribe = (callback: Subscriber) => {
        this.subscribers.push(callback);
    }

    unsubscribe = (callback: Subscriber) => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }

    recalculateAllEarnings = () => {
        const artists = userService.getArtists();
        const musicLibrary = radioService.getState().musicLibrary;
        
        // Reset platform revenue for recalculation
        this.platformRevenueFromRoyalties = 0;

        artists.forEach(artist => {
            const artistSongs = musicLibrary.filter(s => s.artistId === artist.id);
            const totalRoyalties = artistSongs.reduce((total, song) => total + (song.playCount * ROYALTY_RATE_PER_PLAY), 0);
            
            // Calculate platform and artist cut
            this.platformRevenueFromRoyalties += totalRoyalties * PLATFORM_ROYALTY_CUT;
            const lifetimeEarnings = totalRoyalties * (1 - PLATFORM_ROYALTY_CUT);

            const pastRoyaltyPayouts = this.payouts.filter(p => p.artistId === artist.id && p.type === 'royalty').reduce((total, p) => total + p.amount, 0);
            const availableBalance = lifetimeEarnings - pastRoyaltyPayouts;

            // Tip calculations
            const lifetimeTips = this.tips.get(artist.id) || 0;
            const artistPortionOfTips = lifetimeTips * (1 - PLATFORM_TIP_CUT);
            const pastTipPayouts = this.payouts.filter(p => p.artistId === artist.id && p.type === 'tip').reduce((total, p) => total + p.amount, 0);
            const availableTipBalance = artistPortionOfTips - pastTipPayouts;
            
            const existingEarnings = this.earnings.get(artist.id);

            this.earnings.set(artist.id, {
                lifetimeEarnings,
                availableBalance,
                lifetimeTips,
                availableTipBalance,
                payoutRequested: existingEarnings?.payoutRequested || false,
                lastPayoutDate: this.payouts
                    .filter(p => p.artistId === artist.id)
                    .sort((a,b) => new Date(b.processedDate).getTime() - new Date(a.processedDate).getTime())[0]?.processedDate
            });
        });
        this.notify();
    }
    
    processTip = (artistId: string, tipAmount: number) => {
        const currentTips = this.tips.get(artistId) || 0;
        this.tips.set(artistId, currentTips + tipAmount);
        
        this.platformRevenueFromTips += tipAmount * PLATFORM_TIP_CUT;
        
        this.recalculateAllEarnings(); // This will update artist balances and notify subscribers
    }

    getPlatformRevenue = (): { fromRoyalties: number; fromTips: number } => {
        return {
            fromRoyalties: this.platformRevenueFromRoyalties,
            fromTips: this.platformRevenueFromTips,
        };
    }
    
    getTotalPayouts = (): number => {
        return this.payouts.reduce((total, payout) => total + payout.amount, 0);
    }

    getArtistEarnings = (artistId: string): ArtistEarnings | null => {
        return this.earnings.get(artistId) || null;
    }

    requestArtistPayout = (artistId: string): boolean => {
        const artistEarnings = this.earnings.get(artistId);
        const artist = userService.getUserById(artistId);
        const artistPayoutDetails = artist?.payoutDetails;
        const isArtistConfigured = !!(artistPayoutDetails?.paypal.email || artistPayoutDetails?.bank.accountNumber);

        if (artistEarnings && artistEarnings.availableBalance >= PAYOUT_THRESHOLD && isArtistConfigured && !artistEarnings.payoutRequested) {
            artistEarnings.payoutRequested = true;
            this.earnings.set(artistId, artistEarnings);
            this.notify();
            return true;
        }
        return false;
    }

    getPayoutHistory = (artistId: string): PayoutRecord[] => {
        return this.payouts.filter(p => p.artistId === artistId).sort((a, b) => new Date(b.processedDate).getTime() - new Date(a.processedDate).getTime());
    }

    getArtistSongsWithEarnings = (artistId: string): (Song & { earnings: number })[] => {
        const musicLibrary = radioService.getState().musicLibrary;
        return musicLibrary
            .filter(s => s.artistId === artistId)
            .map(song => ({
                ...song,
                earnings: song.playCount * ROYALTY_RATE_PER_PLAY * (1 - PLATFORM_ROYALTY_CUT),
            }))
            .sort((a,b) => b.playCount - a.playCount);
    }

    getPayoutQueue = (): (User & { availableBalance: number })[] => {
        const queue: (User & { availableBalance: number })[] = [];
        this.earnings.forEach((earnings, artistId) => {
            if (earnings.availableBalance >= PAYOUT_THRESHOLD && earnings.payoutRequested) {
                const artist = userService.getUserById(artistId);
                if (artist) {
                    queue.push({ ...artist, availableBalance: earnings.availableBalance });
                }
            }
        });
        return queue.sort((a,b) => b.availableBalance - a.availableBalance);
    }

    processPayout = (artistId: string): boolean => {
        const artistEarnings = this.earnings.get(artistId);
        const artist = userService.getUserById(artistId);
        if (!artistEarnings || !artist || !artistEarnings.payoutRequested) {
            return false;
        }

        const artistPayoutDetails = artist.payoutDetails;
        const preferredMethod = artistPayoutDetails?.paypal.email ? 'PayPal' : 'Bank Transfer';

        const newPayout: PayoutRecord = {
            id: `payout-${Date.now()}`,
            artistId: artistId,
            amount: artistEarnings.availableBalance,
            processedDate: new Date().toISOString(),
            method: preferredMethod,
            type: 'royalty',
        };

        this.payouts.push(newPayout);
        artistEarnings.payoutRequested = false; // Reset the flag
        this.recalculateAllEarnings(); // This will update balances and notify subscribers
        return true;
    }

    getTopStreamedArtists = (limit: number = 10): (User & { totalPlays: number })[] => {
        const artists = userService.getArtists();
        const musicLibrary = radioService.getState().musicLibrary;
        
        const artistPlayCounts = artists.map(artist => {
            const totalPlays = musicLibrary
                .filter(song => song.artistId === artist.id)
                .reduce((sum, song) => sum + song.playCount, 0);
            return { ...artist, totalPlays };
        });
        
        return artistPlayCounts.sort((a, b) => b.totalPlays - a.totalPlays).slice(0, limit);
    }
    
    processBonusPayout = (artistId: string, amount: number, notes: string): boolean => {
        const artist = userService.getUserById(artistId);
        if (!artist || amount <= 0) return false;
        
        const payoutDetails = socialService.getPayoutDetails();
        const preferredMethod = payoutDetails.paypal.email ? 'PayPal' : 'Bank Transfer';

        const newBonusPayout: PayoutRecord = {
            id: `bonus-${Date.now()}`,
            artistId,
            amount,
            processedDate: new Date().toISOString(),
            method: preferredMethod,
            type: 'bonus',
            notes,
        };
        
        this.payouts.push(newBonusPayout);
        this.notify();
        return true;
    }
}

export const monetizationService = new MonetizationService();