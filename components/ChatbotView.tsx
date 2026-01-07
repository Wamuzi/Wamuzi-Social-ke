import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../services/chatbotService';
import { ChatbotState, ChatMessage } from '../types';
import { userService } from '../services/userService';
import { ViewState } from '../App';
import { ArrowLeftIcon } from './icons/Icons';

const LoadingDots: React.FC = () => (
    <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const currentUser = userService.getCurrentUser();
    const aiAvatar = 'https://i.ibb.co/6rW81S4/wamuzi-logo-512.png';

    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <img src={aiAvatar} alt="AI Avatar" className="w-6 h-6 rounded-full self-end" />}
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isUser ? 'bg-brand-blue text-white rounded-br-lg' : 'bg-white text-gray-800 border rounded-bl-lg'}`}>
                {message.isLoading ? <LoadingDots /> : <p className="whitespace-pre-wrap break-words">{message.text}</p>}
            </div>
            {isUser && currentUser && <img src={currentUser.avatarUrl} alt="User Avatar" className="w-6 h-6 rounded-full self-end" />}
        </div>
    );
};

interface ChatbotViewProps {
    setView: (vs: ViewState) => void;
}

const ChatbotView: React.FC<ChatbotViewProps> = ({ setView }) => {
    const [state, setState] = useState<ChatbotState>(chatbotService.getState());
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sub = (newState: ChatbotState) => {
            setState({ ...newState });
        };
        chatbotService.subscribe(sub);
        return () => chatbotService.unsubscribe(sub);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && !state.isResponding) {
            chatbotService.sendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="bg-gray-50 flex flex-col h-[calc(100vh-80px)]">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-2 flex items-center gap-2 border-b">
                <button onClick={() => setView({ view: 'feed' })} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <img src="https://i.ibb.co/6rW81S4/wamuzi-logo-512.png" alt="AI" className="w-8 h-8 rounded-full" />
                <h2 className="text-lg font-bold truncate">AI Chatbot</h2>
            </header>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {state.messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t bg-white flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={state.isResponding}
                        className="w-full bg-gray-100 border-transparent rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || state.isResponding}
                        className="bg-brand-blue text-white p-2 rounded-full font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M3.105 3.105a.75.75 0 0 1 .814-.158l12.685 4.228a.75.75 0 0 1 0 1.409l-12.685 4.228a.75.75 0 0 1-.972-.972l1.65-4.951a.75.75 0 0 1 0-.41L2.947 4.077a.75.75 0 0 1 .158-.972Z" />
                        </svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatbotView;