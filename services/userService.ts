import { User, ArtistApplication, VerificationRequest, PayoutDetails } from '../types';
import { radioService } from './radioService';

// NOTE: This is a frontend-only application. Authentication is simulated.
// In a real-world application, the frontend would send credentials to a secure backend
// over HTTPS, and would never handle or store passwords.

const MOCK_CURRENT_USER: User = {
    id: 'user-1',
    name: 'William Musungu',
    email: 'williammusungu56@gmail.com',
    password: 'password123',
    status: 'active',
    role: 'admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=wamuziuser',
    followersCount: 120,
    followingCount: 75,
    isFollowing: false,
    bio: 'Your favorite user on the best social radio app! 🎵',
    isOnline: true,
    skills: ['React', 'TypeScript', 'UI/UX Design', 'Social Media'],
    experience: '5+ years developing interactive web applications. Passionate about music and technology.',
    isVerified: true,
    payoutDetails: { bank: { accountName: '', accountNumber: '', bankName: '', swiftCode: '' }, paypal: { email: '' } }
};

const OTHER_MOCK_USERS: User[] = [
    { id: 'user-2', name: 'Charlie', email: 'charlie@example.com', password: 'password123', status: 'active', role: 'user', avatarUrl: 'https://i.pravatar.cc/150?u=charlie', followersCount: 1302, followingCount: 240, isFollowing: true, bio: 'Synthwave enthusiast & coffee addict.', isOnline: true, isArtist: true, isVerified: true, skills: ['Music Production', 'Synthesizers', 'DJing'], payoutDetails: { bank: { accountName: 'Charlie Artist', accountNumber: '123456789', bankName: 'Music Bank', swiftCode: 'MUSIBK' }, paypal: { email: '' } } },
    { id: 'user-3', name: 'Diana', email: 'diana@example.com', password: 'password123', status: 'active', role: 'moderator', avatarUrl: 'https://i.pravatar.cc/150?u=diana', followersCount: 876, followingCount: 501, isFollowing: false, bio: 'Here for the vibes and the news.', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), skills: ['Journalism', 'Podcasting'], payoutDetails: { bank: { accountName: '', accountNumber: '', bankName: '', swiftCode: '' }, paypal: { email: '' } } },
    { id: 'user-4', name: 'Evan', email: 'evan@example.com', password: 'password123', status: 'suspended', role: 'user', avatarUrl: 'https://i.pravatar.cc/150?u=evan', followersCount: 5001, followingCount: 449, isFollowing: true, bio: 'Broadcasting live from my imagination.', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), payoutDetails: { bank: { accountName: '', accountNumber: '', bankName: '', swiftCode: '' }, paypal: { email: '' } } },
]

class UserService {
    private currentUser: User | null = null;
    private users: Map<string, User> = new Map();
    private artistApplications: Map<string, ArtistApplication> = new Map();
    private verificationRequests: Map<string, VerificationRequest> = new Map();
    private subscribers: (() => void)[] = [];
    private followerGrowthData: { month: string; count: number }[] = [
        { month: 'Jan', count: 800 },
        { month: 'Feb', count: 1100 },
        { month: 'Mar', count: 1550 },
        { month: 'Apr', count: 2100 },
        { month: 'May', count: 0 }, // Initialized in constructor
    ];

    constructor() {
        this.users.set(MOCK_CURRENT_USER.id, MOCK_CURRENT_USER);
        OTHER_MOCK_USERS.forEach(user => this.users.set(user.id, user));
        
        // Auto-login the default user for demo purposes
        this.currentUser = MOCK_CURRENT_USER;
        
        const totalFollows = Array.from(this.users.values()).reduce((acc, user) => acc + user.followersCount, 0);
        this.followerGrowthData[this.followerGrowthData.length - 1].count = totalFollows;
    }

    private notify = () => {
        this.subscribers.forEach(callback => callback());
    }

    subscribe = (callback: () => void) => {
        this.subscribers.push(callback);
    }

    unsubscribe = (callback: () => void) => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }
    
    getCurrentUser = (): User | null => {
        return this.currentUser;
    }

    getUserById = (userId: string): User | undefined => {
        const user = this.users.get(userId);
        return user ? { ...user } : undefined;
    }
    
    getAllUsers = (): User[] => {
        return Array.from(this.users.values());
    }

    getArtists = (): User[] => {
        return this.getAllUsers().filter(u => u.isArtist);
    }

    getTrendingArtists = (): User[] => {
        const musicLibrary = radioService.getState().musicLibrary;
        const artistPlayCounts: { [artistId: string]: number } = {};

        musicLibrary.forEach(song => {
            if (!artistPlayCounts[song.artistId]) {
                artistPlayCounts[song.artistId] = 0;
            }
            artistPlayCounts[song.artistId] += song.playCount;
        });

        const sortedArtistIds = Object.keys(artistPlayCounts).sort((a, b) => artistPlayCounts[b] - artistPlayCounts[a]);
        
        const topArtistIds = sortedArtistIds.slice(0, 5);

        return topArtistIds.map(id => this.getUserById(id)).filter((u): u is User => !!u);
    }

    searchUsers = (query: string): User[] => {
        if (!query) return [];
        const lowerCaseQuery = query.toLowerCase();
        return Array.from(this.users.values()).filter(
            user => user.name.toLowerCase().includes(lowerCaseQuery) || user.email.toLowerCase().includes(lowerCaseQuery)
        );
    }
    
    findUserByName = (name: string): User | undefined => {
        if (!name) return undefined;
        // This is a simple case-insensitive search. In a real app, you might want a more robust lookup (e.g., by a unique username).
        const lowerCaseName = name.toLowerCase();
        return Array.from(this.users.values()).find(u => u.name.toLowerCase() === lowerCaseName);
    }

    login = (email: string, password?: string): boolean => {
        const lowerCaseEmail = email.toLowerCase();
        const user = Array.from(this.users.values()).find(u => u.email.toLowerCase() === lowerCaseEmail);
        
        if (user && user.password === password) {
            this.currentUser = user;
            this.notify();
            return true;
        }

        return false;
    }

    signUp = (data: { name: string; email: string; password?: string }): { user?: User; error?: string } => {
        const { name, email, password } = data;
        
        if (!name.trim() || !email.trim()) {
            return { error: 'Name and email are required.' };
        }
        if (!password || password.length < 6) {
            return { error: 'Password must be at least 6 characters long.' };
        }

        const existingUser = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            return { error: 'A user with this email already exists.' };
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            password,
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            status: 'active',
            role: 'user',
            followersCount: 0,
            followingCount: 0,
            isFollowing: false,
            bio: '',
            isOnline: true,
            isArtist: false,
            isVerified: false,
            skills: [],
            experience: '',
        };

        this.users.set(newUser.id, newUser);
        this.currentUser = newUser;
        this.notify();
        return { user: newUser };
    }


    logout = () => {
        this.currentUser = null;
        this.notify();
    }
    
    toggleFollow = (userId: string) => {
        const userToFollow = this.users.get(userId);
        if (!userToFollow || !this.currentUser || userId === this.currentUser.id) return;

        const originalFollowingState = userToFollow.isFollowing;
        userToFollow.isFollowing = !originalFollowingState;
        
        if (userToFollow.isFollowing) {
            userToFollow.followersCount++;
            this.currentUser.followingCount++;
            this.followerGrowthData[this.followerGrowthData.length - 1].count++;
        } else {
            userToFollow.followersCount--;
            this.currentUser.followingCount--;
            this.followerGrowthData[this.followerGrowthData.length - 1].count--;
        }
        
        this.users.set(userId, userToFollow);
        this.users.set(this.currentUser.id, this.currentUser);

        this.notify();
    }
    
    getFriends = (): User[] => {
        // In the mock data, `isFollowing` means the currentUser is following that user.
        return this.getAllUsers().filter(u => u.isFollowing && u.id !== this.currentUser?.id);
    }

    getMutualFollowersCount = (otherUserId: string): number => {
        if (otherUserId === 'user-2') return 12;
        if (otherUserId === 'user-3') return 5;
        if (otherUserId === 'user-4') return 2;
        return Math.floor(Math.random() * 10);
    }

    updateFullProfile = (updates: { name: string; bio: string; avatarUrl: string; skills: string[]; experience: string; }) => {
        if (!this.currentUser) return;
        
        const updatedUser = { 
            ...this.currentUser, 
            name: updates.name,
            bio: updates.bio,
            avatarUrl: updates.avatarUrl,
            skills: updates.skills,
            experience: updates.experience,
        };

        this.currentUser = updatedUser;
        this.users.set(this.currentUser.id, updatedUser);
        this.notify();
    }

    updateArtistPayoutDetails = (userId: string, details: PayoutDetails) => {
        const user = this.users.get(userId);
        if (user) {
            user.payoutDetails = details;
            this.users.set(userId, user);
            // If the current user is being updated, update the currentUser object as well
            if (this.currentUser?.id === userId) {
                this.currentUser.payoutDetails = details;
            }
            this.notify();
        }
    };

    // Artist Profile Methods
    requestArtistProfile = (applicationData: { screenshotUrl: string; notes: string; contactInfo: string; }) => {
        if (!this.currentUser) return false;
        if (this.artistApplications.has(this.currentUser.id)) {
            alert('You already have a pending or completed application.');
            return false;
        }

        const newApplication: ArtistApplication = {
            id: `app-${Date.now()}`,
            user: this.currentUser,
            ...applicationData,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };
        this.artistApplications.set(this.currentUser.id, newApplication);
        this.notify();
        alert('Your artist application has been submitted for review.');
        return true;
    }
    
    getArtistRequests = (): ArtistApplication[] => {
        return Array.from(this.artistApplications.values())
            .filter(app => app.status === 'pending')
            .sort((a,b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    }
    
    approveArtistProfile = (applicationId: string) => {
        this.updateArtistApplication(applicationId, { status: 'approved' });
    }
    
    rejectArtistProfile = (applicationId: string) => {
        this.updateArtistApplication(applicationId, { status: 'rejected' });
    }

    updateArtistApplication = (applicationId: string, updates: Partial<Pick<ArtistApplication, 'status' | 'notes' | 'contactInfo'>>) => {
        const application = Array.from(this.artistApplications.values()).find(a => a.id === applicationId);
        if (!application) return;

        const originalStatus = application.status;

        // Apply updates
        Object.assign(application, updates);
        
        const user = this.users.get(application.user.id);
        if (user) {
            // Handle status change side-effects
            if (updates.status && updates.status !== originalStatus) {
                if (updates.status === 'approved') {
                    user.isArtist = true;
                } else if (originalStatus === 'approved') {
                    user.isArtist = false;
                }
                this.users.set(user.id, user);
            }
        }
        
        this.artistApplications.set(application.user.id, application);
        this.notify();
    }

    approveArtistAndLinkMusic = (applicationId: string, songIds: string[]) => {
        const application = Array.from(this.artistApplications.values()).find(a => a.id === applicationId);
        if (!application) return;

        this.approveArtistProfile(applicationId);

        if (songIds.length > 0) {
            radioService.linkSongsToArtist(songIds, application.user.id, application.user.name);
        }
    }
    
    // User Verification Methods
    requestVerification = (type: 'organic' | 'paid'): boolean => {
        if (!this.currentUser) return false;
        if (this.verificationRequests.has(this.currentUser.id)) {
            alert('You already have a pending verification request.');
            return false;
        }
        
        const newRequest: VerificationRequest = {
            id: `vr-${Date.now()}`,
            user: this.currentUser,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            type,
        };
        
        this.verificationRequests.set(this.currentUser.id, newRequest);
        this.notify();
        return true;
    }

    getPendingVerificationRequests = (): VerificationRequest[] => {
        return Array.from(this.verificationRequests.values())
            .filter(req => req.status === 'pending')
            .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    }

    getVerifiedUsers = (): User[] => {
        return Array.from(this.users.values()).filter(user => user.isVerified);
    }

    approveVerification = (requestId: string) => {
        const request = Array.from(this.verificationRequests.values()).find(r => r.id === requestId);
        if (!request) return;

        const user = this.users.get(request.user.id);
        if (user) {
            user.isVerified = true;
            this.users.set(user.id, user);
            request.status = 'approved';
            this.verificationRequests.set(user.id, request);
            this.notify();
        }
    }
    
    rejectVerification = (requestId: string) => {
        const request = Array.from(this.verificationRequests.values()).find(r => r.id === requestId);
        if (request) {
            request.status = 'rejected';
            this.verificationRequests.set(request.user.id, request);
            this.notify();
        }
    }

    removeVerification = (userId: string) => {
        const user = this.users.get(userId);
        if (user) {
            // Prevent un-verifying the main admin for demo safety
            if (user.id === MOCK_CURRENT_USER.id && user.role === 'admin') {
                alert("For safety, the primary admin's verification status cannot be changed from the UI.");
                return;
            }
            user.isVerified = false;
            this.users.set(userId, user);
            this.notify();
        }
    }


    // Admin Methods
    suspendUser = (userId: string) => {
        const user = this.users.get(userId);
        if(user) {
            user.status = user.status === 'active' ? 'suspended' : 'active';
            this.users.set(userId, user);
            this.notify();
        }
    }

    deleteUser = (userId: string) => {
        if(this.users.has(userId)) {
            if (userId === MOCK_CURRENT_USER.id) {
                alert("For safety, the primary admin account cannot be deleted from the UI.");
                return;
            }
            if(this.currentUser?.id === userId) {
                this.logout();
            }
            this.users.delete(userId);
            this.notify();
        }
    }

    updateUserRole = (userId: string, role: User['role']) => {
        if (userId === MOCK_CURRENT_USER.id) {
            alert("For safety, the primary admin's role cannot be changed from the UI.");
            this.notify(); // re-render to reset the dropdown
            return;
        }
        const user = this.users.get(userId);
        if (user) {
            user.role = role;
            this.users.set(userId, user);
            this.notify();
        }
    }
    
    getFollowerGrowthData = (): { month: string; count: number }[] => {
        return this.followerGrowthData;
    }
}

export const userService = new UserService();