import React, { useState, useEffect, useRef } from 'react';
import { Conversation, User, DirectMessage } from '../types';
import { messagingService } from '../services/messagingService';
import { userService } from '../services/userService';
import { ArrowLeftIcon, CheckIcon, DoubleCheckIcon, PaperClipIcon, DocumentTextIcon, XIcon, VideoCameraIcon } from './icons/Icons';
import LinkRenderer from './LinkRenderer';

const formatLastSeen = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'last seen just now';
    if (diffSeconds < 3600) return `last seen ${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `last seen ${Math.floor(diffSeconds / 3600)} hours ago`;
    
    return `last seen on ${date.toLocaleDateString()}`;
};

const MessageStatus: React.FC<{ status: DirectMessage['status'] }> = ({ status }) => {
    if (status === 'sent') {
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
    }
    if (status === 'delivered') {
        return <DoubleCheckIcon className="w-4 h-4 text-gray-400" />;
    }
    if (status === 'read') {
        return <DoubleCheckIcon className="w-4 h-4 text-blue-500" />;
    }
    return null;
};


interface ConversationViewProps {
    conversationId: string;
    onBack: () => void;
    onStartCall: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId, onBack, onStartCall }) => {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<DirectMessage['attachment'] | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentUser = userService.getCurrentUser();

    useEffect(() => {
        const updateConvo = () => {
            const convo = messagingService.getConversationById(conversationId);
            setConversation(convo || null);
        };
        updateConvo();
        
        const sub = () => updateConvo();
        messagingService.subscribe(sub);
        
        return () => messagingService.unsubscribe(sub);
    }, [conversationId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages]);
    
    if (!currentUser) return null;
    
    const otherParticipant = conversation?.participants.find(p => p.id !== currentUser.id);
    const otherUserDetails = otherParticipant ? userService.getUserById(otherParticipant.id) : null;

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() || attachment) {
            messagingService.sendMessage(conversationId, newMessage, attachment || undefined);
            setNewMessage('');
            setAttachment(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const url = event.target.result as string;
                    let type: DirectMessage['attachment']['type'] = 'document';
                    if (file.type.startsWith('image/')) {
                        type = 'image';
                    } else if (file.type.startsWith('audio/')) {
                        type = 'audio';
                    }
                    setAttachment({
                        type,
                        url,
                        fileName: file.name,
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!conversation || !otherParticipant || !otherUserDetails) {
        return <div className="flex-grow flex items-center justify-center text-gray-500">Loading conversation...</div>;
    }
    
    return (
        <div className="flex-grow flex flex-col h-full">
            <header className="p-4 border-b flex items-center gap-3 flex-shrink-0">
                 <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-10 h-10 rounded-full" />
                <div className="flex-grow">
                    <h3 className="font-semibold leading-tight">{otherParticipant.name}</h3>
                    <p className="text-xs leading-tight text-gray-500">
                        {otherUserDetails.isOnline ? 'Online' : formatLastSeen(otherUserDetails.lastSeen)}
                    </p>
                </div>
                <button onClick={onStartCall} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <VideoCameraIcon className="w-6 h-6" />
                </button>
            </header>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                {conversation.messages.map(message => (
                    <div key={message.id} className={`flex items-end gap-2 ${message.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                         {message.sender.id !== currentUser.id && <img src={message.sender.avatarUrl} className="w-6 h-6 rounded-full self-end" />}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.sender.id === currentUser.id ? 'bg-brand-blue text-white rounded-br-lg' : 'bg-white text-gray-800 border rounded-bl-lg'}`}>
                             {message.attachment && (
                                <div className={message.content ? 'mb-2' : ''}>
                                    {message.attachment.type === 'image' && (
                                        <img src={message.attachment.url} alt="attachment" className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(message.attachment.url, '_blank')} />
                                    )}
                                    {message.attachment.type === 'audio' && (
                                        <audio src={message.attachment.url} controls className="w-full" />
                                    )}
                                    {message.attachment.type === 'document' && (
                                        <a
                                            href={message.attachment.url}
                                            download={message.attachment.fileName}
                                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${message.sender.id === currentUser.id ? 'bg-blue-400 hover:bg-blue-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                                        >
                                            <DocumentTextIcon className={`w-8 h-8 flex-shrink-0 ${message.sender.id === currentUser.id ? 'text-white' : 'text-gray-600'}`} />
                                            <div className="overflow-hidden">
                                                <span className={`text-sm font-medium break-all ${message.sender.id === currentUser.id ? 'text-white' : 'text-gray-800'}`}>{message.attachment.fileName}</span>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            )}
                             {message.content && <p className="whitespace-pre-wrap break-words"><LinkRenderer text={message.content} /></p>}
                             {message.sender.id === currentUser.id && (
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-xs opacity-70">{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <MessageStatus status={message.status} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <footer className="p-4 border-t bg-white flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,audio/*,application/pdf,.doc,.docx,.txt,.zip" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-brand-blue rounded-full hover:bg-gray-100">
                        <PaperClipIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-grow relative">
                         <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-gray-100 border-transparent rounded-full px-4 py-2"
                        />
                         {attachment && (
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border rounded-lg shadow-md max-w-full">
                                <div className="flex items-center gap-2">
                                    {attachment.type === 'image' && <img src={attachment.url} alt="Preview" className="max-h-24 rounded" />}
                                    {attachment.type === 'audio' && <audio src={attachment.url} controls className="max-w-xs h-10" />}
                                    {attachment.type === 'document' && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                            <DocumentTextIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 truncate">{attachment.fileName}</span>
                                        </div>
                                    )}
                                     <button onClick={() => setAttachment(null)} className="p-0.5 bg-gray-700 text-white rounded-full self-start -mt-3 -mr-3 flex-shrink-0">
                                        <XIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="bg-brand-blue text-white px-4 py-2 rounded-full font-semibold">Send</button>
                </form>
            </footer>
        </div>
    );
};

export default ConversationView;