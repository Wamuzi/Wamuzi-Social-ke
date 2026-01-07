import React, { useState, useEffect, useRef } from 'react';
import { ViewState, View } from '../App';
import { newsService } from '../services/newsService';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { User } from '../types';
import { SettingsIcon, NewspaperIcon, PlayCircleIcon, BellIcon, MessageIcon, SearchIcon, MenuIcon, XIcon, FilmIcon, UserCircleIcon, LogoutIcon, UsersIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons/Icons';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
    currentView: View | 'admin';
    setView: (view: ViewState) => void;
    isAdmin: boolean;
    viewState?: ViewState;
}

const WamuziLogo: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="flex items-center gap-2 cursor-pointer" onClick={onClick}>
        <span className="text-xl font-serif-logo font-bold text-brand-dark-blue">WAMUZI</span>
        <span className="bg-brand-blue text-white px-2 py-0.5 rounded-md text-lg font-sans font-bold">SOCIAL</span>
    </div>
);


const UserSearchBar: React.FC<{ setView: (view: ViewState) => void, onSelect?: () => void }> = ({ setView, onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim()) {
            const searchResults = userService.searchUsers(query);
            setResults(searchResults);
            setIsResultsVisible(true);
        } else {
            setResults([]);
            setIsResultsVisible(false);
        }
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsResultsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectUser = (user: User) => {
        setView({ view: 'profile', data: { userId: user.id } });
        setQuery('');
        setResults([]);
        setIsResultsVisible(false);
        onSelect?.();
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative">
                 <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setIsResultsVisible(true)}
                    className="bg-gray-100 rounded-full pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
            </div>
           
            {isResultsVisible && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-md border border-gray-200 z-30 max-h-80 overflow-y-auto">
                    {results.map(user => (
                        <div key={user.id} onClick={() => handleSelectUser(user)} className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer">
                            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                            <div>
                                <p className="font-semibold text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const PromoteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);


const UserMenu: React.FC<{ setView: (vs: ViewState) => void; closeMenu: () => void; }> = ({ setView, closeMenu }) => {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) return null;
    
    const handleNavigation = (view: View, data?: any) => {
        setView({ view, data });
        closeMenu();
    }
    
    const handleLogout = () => {
        closeMenu();
        userService.logout();
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-2xl border border-gray-200 z-30 overflow-hidden">
            <div className="p-3 border-b">
                <p className="font-semibold text-sm truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
            <div className="p-1">
                 <button onClick={() => handleNavigation('profile', { userId: currentUser.id })} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"><UserCircleIcon className="w-5 h-5"/> Profile</button>
                 <button onClick={() => handleNavigation('adCenter')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"><PromoteIcon className="w-5 h-5"/> Ad Center</button>
                 <button onClick={() => handleNavigation('settings')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"><SettingsIcon className="w-5 h-5"/> Settings</button>
            </div>
            <div className="p-1 border-t">
                 <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"><LogoutIcon className="w-5 h-5"/> Logout</button>
            </div>
        </div>
    );
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, isAdmin, viewState }) => {
    const [hasNewArticles, setHasNewArticles] = useState(false);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [isNotifsOpen, setIsNotifsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    useEffect(() => {
        const sub = (state: { hasNew: boolean }) => setHasNewArticles(state.hasNew);
        newsService.subscribe(sub);

        const notifSub = (state: { unreadCount: number }) => setUnreadNotifs(state.unreadCount);
        notificationService.subscribe(notifSub);

        return () => {
            newsService.unsubscribe(sub);
            notificationService.unsubscribe(notifSub);
        }
    }, []);
    
    const currentUser = userService.getCurrentUser();
    
    const handleDrawerProfileClick = () => {
        if (currentUser) {
            setView({ view: 'profile', data: { userId: currentUser.id } });
            setIsDrawerOpen(false);
        }
    };
    
    const handleNotifsToggle = () => {
        setIsNotifsOpen(!isNotifsOpen);
        if(!isNotifsOpen) {
            notificationService.markAllAsRead();
        }
    }

    const NavButton: React.FC<{ view: View; label: string; children: React.ReactNode; hasNotification?: boolean }> = ({ view, label, children, hasNotification }) => (
        <button
            onClick={() => setView({ view })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 relative ${
                currentView === view
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
        >
            {children}
            <span className="hidden md:inline">{label}</span>
            {hasNotification && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
        </button>
    );

    const DrawerNavButton: React.FC<{ view: View; label: string; children: React.ReactNode; hasNotification?: boolean }> = ({ view, label, children, hasNotification }) => (
        <button
            onClick={() => {
                setView({ view });
                setIsDrawerOpen(false);
            }}
            className={`flex w-full items-center gap-4 px-4 py-3 rounded-lg text-lg transition-colors duration-200 relative ${
                currentView === view
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
            {children}
            <span className="font-medium">{label}</span>
            {hasNotification && <div className="absolute top-1/2 -translate-y-1/2 right-4 w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
        </button>
    );

    return (
        <>
            <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
                <WamuziLogo onClick={() => setView({ view: 'feed' })} />
                
                <nav className="flex items-center gap-1 sm:gap-2">
                    {isAdmin ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-700">
                            <SettingsIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Admin</span>
                        </div>
                    ) : (
                        <>
                            <div className="hidden lg:flex items-center gap-2">
                                <NavButton view="feed" label="Feed" hasNotification={hasNewArticles}>
                                    <NewspaperIcon className="w-5 h-5" />
                                </NavButton>
                                <NavButton view="player" label="Radio">
                                    <PlayCircleIcon className="w-5 h-5" />
                                </NavButton>
                                <NavButton view="chatbot" label="Chatbot">
                                    <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                                </NavButton>
                                <NavButton view="groups" label="Groups">
                                    <UsersIcon className="w-5 h-5" />
                                </NavButton>
                                <NavButton view="reels" label="Reels">
                                    <FilmIcon className="w-5 h-5" />
                                </NavButton>
                            </div>
                            
                            <div className="h-6 w-px bg-gray-200 mx-2 hidden lg:block"></div>
                            
                            <div className="hidden sm:block">
                                <UserSearchBar setView={setView} />
                            </div>
                            
                            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>


                            <button onClick={() => setView({ view: 'messages' })} className="hidden lg:flex p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition relative" aria-label="Messages">
                                <MessageIcon className="w-6 h-6" />
                            </button>
                            
                            <div className="relative">
                                 <button onClick={handleNotifsToggle} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition relative" aria-label="Notifications">
                                    <BellIcon className="w-6 h-6" />
                                    {unreadNotifs > 0 && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>}
                                </button>
                                {isNotifsOpen && <NotificationsPanel onClose={() => setIsNotifsOpen(false)} />}
                            </div>
                            
                            <div className="relative">
                                <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="hidden lg:flex p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition" aria-label="Profile">
                                    <img src={currentUser?.avatarUrl} alt="My Profile" className="w-7 h-7 rounded-full" />
                                </button>
                                {isUserMenuOpen && <UserMenu setView={setView} closeMenu={() => setIsUserMenuOpen(false)} />}
                            </div>
                            
                             <button onClick={() => setIsDrawerOpen(true)} className="lg:hidden p-2 ml-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition" aria-label="Open menu">
                                <MenuIcon className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </nav>
            </header>

            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60" onClick={() => setIsDrawerOpen(false)}></div>
                
                {/* Drawer Panel */}
                <div className={`relative h-full w-72 max-w-[80vw] bg-white shadow-xl transition-transform duration-300 ease-in-out transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <WamuziLogo onClick={() => { setView({ view: 'feed' }); setIsDrawerOpen(false); }} />
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-500 hover:text-gray-800">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 border-b">
                         <UserSearchBar setView={setView} onSelect={() => setIsDrawerOpen(false)} />
                    </div>
                    <nav className="p-4 space-y-2">
                         <DrawerNavButton view="feed" label="Feed" hasNotification={hasNewArticles}>
                            <NewspaperIcon className="w-6 h-6" />
                        </DrawerNavButton>
                        <DrawerNavButton view="player" label="Radio">
                            <PlayCircleIcon className="w-6 h-6" />
                        </DrawerNavButton>
                        <DrawerNavButton view="chatbot" label="Chatbot">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                        </DrawerNavButton>
                         <DrawerNavButton view="groups" label="Groups">
                            <UsersIcon className="w-6 h-6" />
                        </DrawerNavButton>
                        <DrawerNavButton view="reels" label="Reels">
                            <FilmIcon className="w-6 h-6" />
                        </DrawerNavButton>
                        <div className="border-t border-gray-200 my-2"></div>
                        <DrawerNavButton view="messages" label="Messages">
                            <MessageIcon className="w-6 h-6" />
                        </DrawerNavButton>
                         <button
                            onClick={handleDrawerProfileClick}
                            className={`flex w-full items-center gap-4 px-4 py-3 rounded-lg text-lg transition-colors duration-200 relative ${
                                currentView === 'profile' && viewState?.data?.userId === currentUser?.id
                                    ? 'bg-brand-blue text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <UserCircleIcon className="w-6 h-6" />
                            <span className="font-medium">Profile</span>
                        </button>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Header;