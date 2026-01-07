import React, { useState, useEffect, useRef } from 'react';
import { User, Post, UserAnalytics, Song, RadioState } from '../types';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { radioService } from '../services/radioService';
import { messagingService } from '../services/messagingService';
import { notificationService } from '../services/notificationService';
import { monetizationService } from '../services/monetizationService';
import { ChartBarIcon, RepostIcon, PencilIcon, MessageIcon, MusicNoteIcon, BriefcaseIcon, AcademicCapIcon, XIcon, PlayIcon, FilmIcon, PauseIcon, CheckBadgeIcon, HeartIcon, CommentIcon, EyeIcon, UserCircleIcon, ShareIcon, LogoutIcon, MoneyIcon } from './icons/Icons';
import { ViewState } from '../App';
import ClaimArtistProfileModal from './ClaimArtistProfileModal';
import SelectSongModal from './SelectSongModal';
import ArtistMonetizationDashboard from './ArtistMonetizationDashboard';

const TipModal: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
    const [amount, setAmount] = useState('5');
    const [customAmount, setCustomAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleTip = () => {
        const finalAmount = parseFloat(customAmount || amount);
        if (isNaN(finalAmount) || finalAmount <= 0) {
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            monetizationService.processTip(user.id, finalAmount);
            setIsSubmitting(false);
            setIsSubmitted(true);
            setTimeout(onClose, 2000);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                {isSubmitted ? (
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-semibold">Thank You!</h2>
                        <p className="text-gray-600 mt-2">Your tip has been sent to {user.name}.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b text-center">
                            <h2 className="text-xl font-semibold">Send a Tip to {user.name}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-center gap-2">
                                {['1', '5', '10'].map(val => (
                                    <button key={val} onClick={() => { setAmount(val); setCustomAmount(''); }} className={`px-4 py-2 rounded-full font-semibold border-2 transition ${amount === val && !customAmount ? 'bg-brand-blue text-white border-brand-blue' : 'bg-gray-100 border-transparent hover:border-gray-300'}`}>
                                        ${val}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={e => { setCustomAmount(e.target.value); setAmount(''); }}
                                    placeholder="Or enter a custom amount"
                                    className="w-full p-2 pl-6 border rounded"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                            <button onClick={handleTip} disabled={isSubmitting} className="w-full px-4 py-2 bg-brand-blue text-white rounded-md font-semibold hover:bg-blue-500 transition disabled:bg-gray-400">
                                {isSubmitting ? 'Sending...' : `Send Tip`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


const PostCard: React.FC<{ post: Post; onUserSelect: (user: User) => void }> = ({ post, onUserSelect }) => (
    <div className="bg-white shadow-md rounded-lg p-4">
         {post.originalPost && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <RepostIcon className="w-4 h-4" />
                <p><span className="font-semibold hover:underline cursor-pointer" onClick={() => onUserSelect(post.author)}>{post.author.name}</span> reposted</p>
            </div>
        )}
        <div className="flex items-center gap-3 mb-3">
            <img src={(post.originalPost || post).author.avatarUrl} alt={(post.originalPost || post).author.name} className="w-10 h-10 rounded-full cursor-pointer" onClick={() => onUserSelect((post.originalPost || post).author)} />
            <div>
                <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-800 hover:underline cursor-pointer" onClick={() => onUserSelect((post.originalPost || post).author)}>{(post.originalPost || post).author.name}</p>
                    {(post.originalPost || post).author.isVerified && <CheckBadgeIcon className="w-4 h-4 text-brand-blue" title="Verified" />}
                </div>
                <p className="text-xs text-gray-500">{new Date((post.originalPost || post).pubDate).toLocaleString()}</p>
            </div>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{(post.originalPost || post).content}</p>
        {post.originalPost && <div className="mt-3 border border-gray-200 rounded-lg p-3"><PostCard post={post.originalPost} onUserSelect={onUserSelect} /></div>}
    </div>
);

const PostAnalyticsList: React.FC<{ posts: Post[] }> = ({ posts }) => (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Post & Reel Performance</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {posts.map(post => (
                <div key={post.id} className="p-3 bg-gray-50 rounded-lg flex gap-4">
                    {post.attachment?.type === 'video' && post.attachment.imageAsVideoUrl ? (
                         <img src={post.attachment.imageAsVideoUrl} alt="Reel preview" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                    ) : post.attachment?.type === 'image' ? (
                         <img src={post.attachment.url} alt="Post preview" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                    ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center text-gray-400">
                           <PencilIcon className="w-8 h-8"/>
                        </div>
                    )}
                    <div className="flex-grow">
                        <p className="text-sm text-gray-700 line-clamp-2">{post.content || "Reel"}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" /> {post.viewCount || post.reach || 0}</span>
                            <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4" /> {post.likeCount}</span>
                            <span className="flex items-center gap-1"><CommentIcon className="w-4 h-4" /> {post.comments.length}</span>
                            <span className="flex items-center gap-1"><RepostIcon className="w-4 h-4" /> {post.repostCount}</span>
                            <span className="flex items-center gap-1"><ShareIcon className="w-4 h-4" /> {post.shares || 0}</span>
                             <span className="flex items-center gap-1"><UserCircleIcon className="w-4 h-4" /> {post.profileVisits || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AnalyticsDisplay: React.FC<{ analytics: UserAnalytics }> = ({ analytics }) => (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Your Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Profile Views</p><p className="text-2xl font-bold font-orbitron">{analytics.profileViews.toLocaleString()}</p></div>
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Post Impressions</p><p className="text-2xl font-bold font-orbitron">{analytics.postImpressions.toLocaleString()}</p></div>
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Reel Views</p><p className="text-2xl font-bold font-orbitron">{analytics.reelViews.toLocaleString()}</p></div>
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Engagement Rate</p><p className="text-2xl font-bold font-orbitron">{analytics.engagementRate}%</p></div>
        </div>
    </div>
);

const MusicSection: React.FC<{ artistId: string; setView: (vs: ViewState) => void; }> = ({ artistId, setView }) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [radioState, setRadioState] = useState(radioService.getState());

    useEffect(() => {
        const sub = (state: RadioState) => setRadioState(state);
        radioService.subscribe(sub);
        return () => radioService.unsubscribe(sub);
    }, []);

    useEffect(() => {
        // This is a mock; in a real app, you'd fetch this from the radioService
        const allSongs = radioService.getState().musicLibrary;
        setSongs(allSongs.filter(s => s.artistId === artistId));
    }, [artistId]);

    const handleUseSound = (song: Song) => {
        setView({ view: 'feed', data: { preAttachedSong: song } });
    };
    
    const handlePlaybackToggle = (song: Song) => {
        const isThisSongPlaying = radioState.currentSong?.id === song.id && radioState.isPlaying;
        if (isThisSongPlaying) {
            radioService.togglePlay();
        } else {
            radioService.playSongFromLibrary(song);
        }
    };

    if (songs.length === 0) {
        return <p className="text-center text-gray-500 py-8">This artist hasn't released any music on the platform yet.</p>
    }

    return (
        <div className="space-y-3">
            {songs.map(song => {
                 const isThisSongPlaying = radioState.currentSong?.id === song.id && radioState.isPlaying;
                 const progress = isThisSongPlaying ? (radioState.playbackPosition / song.duration) * 100 : 0;
                 
                 return (
                    <div key={song.id} className={`bg-white shadow-md rounded-lg p-3 flex items-center gap-4 transition-all ${isThisSongPlaying ? 'ring-2 ring-brand-blue' : ''}`}>
                        <div className="relative w-14 h-14 flex-shrink-0">
                            <img src={song.albumArt} alt={song.title} className="w-full h-full rounded-md object-cover" />
                            <button 
                                onClick={() => handlePlaybackToggle(song)} 
                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white rounded-md opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                            >
                                {isThisSongPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                            </button>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold truncate">{song.title}</p>
                            <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                             {isThisSongPlaying && (
                                <div className="relative h-1 bg-gray-200 rounded-full mt-2">
                                    <div className="absolute top-0 left-0 h-full bg-brand-blue rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleUseSound(song)} className="px-3 py-1.5 bg-brand-blue text-white text-xs font-semibold rounded-full hover:bg-blue-500 transition">Use this Sound</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


interface ProfileViewProps {
    user: User;
    onUserSelect: (user: User) => void;
    setView: (viewState: ViewState) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserSelect, setView }) => {
    const [profileData, setProfileData] = useState<User>(user);
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [isAnthemSelectorOpen, setIsAnthemSelectorOpen] = useState(false);
    const [isTipping, setIsTipping] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', bio: '', avatarUrl: '', skills: [] as string[], experience: '', anthem: null as Song | null });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = userService.getCurrentUser();
    const isCurrentUserProfile = currentUser?.id === profileData.id;
    const mutualFollowersCount = isCurrentUserProfile ? 0 : userService.getMutualFollowersCount(profileData.id);

    useEffect(() => {
        const updateUserState = () => {
            const latestUserData = userService.getUserById(user.id);
            if (latestUserData) {
                setProfileData(latestUserData);
                setPosts(socialService.getPostsByUser(user.id));
                if (currentUser?.id === user.id) {
                     setAnalytics(socialService.getUserAnalytics(user.id) || null);
                }
                 if (!isEditing) {
                    setEditForm({ name: latestUserData.name, bio: latestUserData.bio, avatarUrl: latestUserData.avatarUrl, skills: latestUserData.skills || [], experience: latestUserData.experience || '', anthem: null });
                 }
            }
        };
        updateUserState();
        setActiveTab('posts');
        if (isEditing && user.id !== currentUser?.id) setIsEditing(false);

        userService.subscribe(updateUserState);
        return () => userService.unsubscribe(updateUserState);
    }, [user.id, isEditing, currentUser?.id]);

    const handleFollowToggle = () => {
        userService.toggleFollow(profileData.id);
        if (!profileData.isFollowing && currentUser) {
            notificationService.addNotification({ type: 'follow', user: currentUser }, profileData.id);
        }
    };

    const handleMessageClick = () => {
        const conversation = messagingService.startOrGetConversation(profileData.id);
        setView({ view: 'messages', data: { conversationId: conversation.id } });
    }

    const handleEditToggle = () => setIsEditing(!isEditing);
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setEditForm(prev => ({ ...prev, avatarUrl: event.target.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!editForm.name.trim()) { alert("Name cannot be empty."); return; }
        userService.updateFullProfile(editForm);
        setIsEditing(false);
    }
    
    const handleSelectAnthem = (song: Song) => {
        setEditForm(prev => ({ ...prev, anthem: song }));
        setIsAnthemSelectorOpen(false);
    };

    const ProfileHeader = () => (
         <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img src={profileData.avatarUrl} alt={profileData.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg" />
            <div className="flex-grow text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-3xl font-bold text-gray-900">{profileData.name}</h2>
                    {profileData.isVerified && <CheckBadgeIcon className="w-6 h-6 text-brand-blue" title="Verified" />}
                    {profileData.isArtist && <MusicNoteIcon className="w-6 h-6 text-purple-500" title="Verified Artist" />}
                </div>
                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{profileData.bio}</p>
                <div className="flex justify-center sm:justify-start gap-6 mt-4">
                    <div><span className="font-bold">{profileData.followersCount}</span> <span className="text-gray-500">Followers</span></div>
                    <div><span className="font-bold">{profileData.followingCount}</span> <span className="text-gray-500">Following</span></div>
                </div>
                 {!isCurrentUserProfile && mutualFollowersCount > 0 && (<div className="text-sm text-gray-500 mt-2 flex justify-center sm:justify-start"><p>{mutualFollowersCount} mutual followers</p></div>)}
            </div>
            <div className="flex items-center gap-2">
                {isCurrentUserProfile ? (
                    <>
                        <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"><PencilIcon className="w-4 h-4" /> Edit Profile</button>
                        <button onClick={() => userService.logout()} className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700">
                            <LogoutIcon className="w-4 h-4" /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        {profileData.isArtist && (
                            <button onClick={() => setIsTipping(true)} className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors bg-green-100 text-green-700 hover:bg-green-200"><MoneyIcon className="w-4 h-4" /> Tip</button>
                        )}
                        <button onClick={handleMessageClick} className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"><MessageIcon className="w-4 h-4" /> Message</button>
                        <button onClick={handleFollowToggle} className={`px-4 py-2 rounded-full font-semibold transition-colors ${profileData.isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-brand-blue text-white hover:bg-blue-500'}`}>{profileData.isFollowing ? 'Following' : 'Follow'}</button>
                    </>
                )}
            </div>
        </div>
    );
    
    const EditProfileForm = () => (
         <div className="space-y-6">
             <div className="flex flex-col items-center gap-4">
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                <img src={editForm.avatarUrl} alt="Avatar preview" className="w-32 h-32 rounded-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fileInputRef.current?.click()} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-brand-blue hover:underline">Change Photo</button>
            </div>
            <div><label className="text-sm font-medium text-gray-700">Name</label><input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))} className="w-full bg-gray-50 border-gray-300 rounded-md p-2 mt-1"/></div>
            <div><label className="text-sm font-medium text-gray-700">Bio</label><textarea value={editForm.bio} onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))} className="w-full bg-gray-50 border-gray-300 rounded-md p-2 mt-1" rows={3}></textarea></div>
             <div>
                <label className="text-sm font-medium text-gray-700">Profile Anthem</label>
                {editForm.anthem ? (
                     <div className="flex items-center gap-2 mt-1 p-2 border rounded-md">
                        <img src={editForm.anthem.albumArt} className="w-10 h-10 rounded" />
                        <div><p className="font-semibold">{editForm.anthem.title}</p><p className="text-sm text-gray-500">{editForm.anthem.artist}</p></div>
                        <button type="button" onClick={() => setIsAnthemSelectorOpen(true)} className="ml-auto px-3 py-1 text-sm bg-gray-200 rounded-md">Change</button>
                    </div>
                ): (
                    <button type="button" onClick={() => setIsAnthemSelectorOpen(true)} className="w-full mt-1 p-4 border-2 border-dashed rounded-md text-gray-500 hover:bg-gray-50">Set a song as your anthem</button>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={handleEditToggle} className="px-4 py-2 rounded-md font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-md font-semibold bg-brand-blue text-white hover:bg-blue-500">Save Changes</button>
            </div>
        </div>
    );
    
    const SkillsEditor = () => {
        const [newSkill, setNewSkill] = useState('');
        const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
                e.preventDefault();
                setEditForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                setNewSkill('');
            }
        };
        const handleRemoveSkill = (skillToRemove: string) => {
            setEditForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
        };
        return (
            <div>
                 <label className="text-sm font-medium text-gray-700">Skills</label>
                 <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md bg-gray-50">
                    {editForm.skills.map(skill => (
                        <div key={skill} className="bg-brand-blue/20 text-brand-blue text-sm font-semibold px-2 py-1 rounded-md flex items-center gap-1.5">
                            {skill}
                            <button onClick={() => handleRemoveSkill(skill)}><XIcon className="w-3 h-3"/></button>
                        </div>
                    ))}
                     <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={handleAddSkill} placeholder="Add a skill and press Enter" className="flex-grow bg-transparent focus:outline-none"/>
                 </div>
            </div>
        );
    };

    const AboutSection = () => (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
            {isEditing ? (
                 <>
                    <SkillsEditor />
                    <div><label className="text-sm font-medium text-gray-700">Experience / CV</label><textarea value={editForm.experience} onChange={e => setEditForm(prev => ({...prev, experience: e.target.value}))} className="w-full bg-gray-50 border-gray-300 rounded-md p-2 mt-1" rows={10}></textarea></div>
                 </>
            ) : (
                <>
                    <div><h3 className="text-lg font-semibold flex items-center gap-2"><AcademicCapIcon className="w-5 h-5"/> Skills</h3>{profileData.skills && profileData.skills.length > 0 ? (<div className="flex flex-wrap gap-2 mt-2">{profileData.skills.map(skill => (<span key={skill} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>))}</div>) : (<p className="text-gray-500 mt-2">No skills listed.</p>)}</div>
                    <div><h3 className="text-lg font-semibold flex items-center gap-2"><BriefcaseIcon className="w-5 h-5"/> Experience</h3>{profileData.experience ? (<p className="text-gray-700 mt-2 whitespace-pre-wrap">{profileData.experience}</p>) : (<p className="text-gray-500 mt-2">No experience listed.</p>)}</div>
                </>
            )}
        </div>
    );

    return (
        <>
        {isTipping && <TipModal user={profileData} onClose={() => setIsTipping(false)} />}
        {isAnthemSelectorOpen && <SelectSongModal onSelect={handleSelectAnthem} onClose={() => setIsAnthemSelectorOpen(false)} />}
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                {isEditing && isCurrentUserProfile ? <EditProfileForm /> : <ProfileHeader />}
            </div>

            {isCurrentUserProfile && !profileData.isArtist && !isEditing && (
                 <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="font-semibold text-gray-700">Apply for Artist Verification</p>
                        <p className="text-sm text-gray-500">Get a verified badge and unlock artist features.</p>
                    </div>
                    <button onClick={() => setIsClaimModalOpen(true)} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold whitespace-nowrap">
                        Become an Artist
                    </button>
                </div>
            )}
            
            <div className="flex gap-4 border-b border-gray-200 mb-6">
                 <button onClick={() => setActiveTab('posts')} className={`py-2 px-4 text-sm font-semibold transition-colors ${activeTab === 'posts' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}>Posts</button>
                 <button onClick={() => setActiveTab('about')} className={`py-2 px-4 text-sm font-semibold transition-colors ${activeTab === 'about' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}>About</button>
                 {profileData.isArtist && <button onClick={() => setActiveTab('music')} className={`py-2 px-4 text-sm font-semibold transition-colors ${activeTab === 'music' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}>Music</button>}
                {isCurrentUserProfile && (<button onClick={() => setActiveTab('analytics')} className={`py-2 px-4 text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'analytics' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}><ChartBarIcon className="w-4 h-4" /> Analytics</button>)}
                {isCurrentUserProfile && profileData.isArtist && (<button onClick={() => setActiveTab('monetization')} className={`py-2 px-4 text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'monetization' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-800'}`}><MoneyIcon className="w-4 h-4" /> Monetization</button>)}
            </div>
            
            <div className="space-y-6">
                {activeTab === 'posts' && (posts.length > 0 ? posts.map(post => <PostCard key={post.id} post={post} onUserSelect={onUserSelect} />) : <p className="text-center text-gray-500 py-8">This user hasn't posted yet.</p>)}
                {activeTab === 'about' && <AboutSection />}
                {activeTab === 'music' && profileData.isArtist && <MusicSection artistId={user.id} setView={setView} />}
                {activeTab === 'analytics' && analytics && (
                    <div className="space-y-6">
                        <AnalyticsDisplay analytics={analytics} />
                        <PostAnalyticsList posts={posts} />
                    </div>
                )}
                {activeTab === 'monetization' && isCurrentUserProfile && profileData.isArtist && <ArtistMonetizationDashboard user={user} />}
            </div>
        </div>
        {isClaimModalOpen && <ClaimArtistProfileModal onClose={() => setIsClaimModalOpen(false)} />}
        </>
    );
};

export default ProfileView;