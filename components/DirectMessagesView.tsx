import React, { useState, useEffect } from 'react';
import { Conversation, User } from '../types';
import { messagingService } from '../services/messagingService';
import { userService } from '../services/userService';
import { PencilIcon } from './icons/Icons';
import ConversationView from './ConversationView';
import UserSearchPanel from './UserSearchPanel';
import VideoCallView from './VideoCallView';

interface DirectMessagesViewProps {
    initialConversationId?: string;
}

const DirectMessagesView: React.FC<DirectMessagesViewProps> = ({ initialConversationId }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
    const [isComposing, setIsComposing] = useState(false);
    const [activeCall, setActiveCall] = useState<User | null>(null);
    const currentUser = userService.getCurrentUser();

    useEffect(() => {
        const sub = (convos: Conversation[]) => {
            setConversations(convos);
        };
        messagingService.subscribe(sub);
        
        const initialConvos = messagingService.getConversations();
        setConversations(initialConvos);
        
        if (initialConversationId) {
            setSelectedConvoId(initialConversationId);
        } else {
            setSelectedConvoId(null);
        }
        
        return () => messagingService.unsubscribe(sub);
    }, [initialConversationId]);

    const handleSelectUser = (user: User) => {
        const conversation = messagingService.startOrGetConversation(user.id);
        setSelectedConvoId(conversation.id);
        setIsComposing(false);
    }

    if (!currentUser) return null;

    if (activeCall) {
        return <VideoCallView user={activeCall} onEndCall={() => setActiveCall(null)} />;
    }

    if (selectedConvoId) {
         const conversation = conversations.find(c => c.id === selectedConvoId);
         const otherParticipant = conversation?.participants.find(p => p.id !== currentUser.id);

         return (
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-md rounded-lg h-[calc(100vh-140px)] flex flex-col">
                    <ConversationView
                        key={selectedConvoId}
                        conversationId={selectedConvoId}
                        onBack={() => setSelectedConvoId(null)}
                        onStartCall={() => otherParticipant && setActiveCall(otherParticipant)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-md rounded-lg h-[calc(100vh-140px)] flex flex-col">
                {isComposing ? (
                    <UserSearchPanel
                        onSelectUser={handleSelectUser}
                        onCancel={() => setIsComposing(false)}
                    />
                ) : (
                    <>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Messages</h2>
                            <button onClick={() => setIsComposing(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {conversations.map(convo => {
                                const otherParticipant = convo.participants.find(p => p.id !== currentUser.id);
                                const lastMessage = convo.messages[convo.messages.length - 1];
                                if (!otherParticipant) return null;

                                return (
                                    <div 
                                        key={convo.id} 
                                        className={`p-3 cursor-pointer flex items-center space-x-3 transition-colors hover:bg-gray-50`}
                                        onClick={() => setSelectedConvoId(convo.id)}
                                    >
                                        <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-12 h-12 rounded-full" />
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-800 truncate">{otherParticipant.name}</p>
                                                {lastMessage && <p className="text-xs text-gray-500 flex-shrink-0">{new Date(lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                {lastMessage ? (
                                                    <p className="text-sm text-gray-600 truncate">{lastMessage.sender.id === currentUser.id ? 'You: ' : ''}{lastMessage.content || 'Attachment'}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No messages yet</p>
                                                )}
                                                {convo.unreadCount > 0 && <span className="bg-brand-blue text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{convo.unreadCount}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DirectMessagesView;