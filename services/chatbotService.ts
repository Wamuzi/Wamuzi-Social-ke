import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { ChatbotState, ChatMessage } from '../types';

type Subscriber = (state: ChatbotState) => void;

class ChatbotService {
    private ai: GoogleGenAI;
    private chat: Chat;
    private subscribers: Subscriber[] = [];
    private state: ChatbotState = {
        messages: [],
        isResponding: false,
    };

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        this.chat = this.ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: 'You are a helpful and friendly assistant for the Wamuzi Media social platform. Keep your answers concise and informative.'
            },
        });

        // Initialize with a welcome message
        this.state.messages.push({
            id: `ai-welcome-${Date.now()}`,
            sender: 'ai',
            text: "Hello! I'm your friendly AI assistant. How can I help you today?",
        });
    }

    private notify = () => {
        this.subscribers.forEach(callback => callback(this.state));
    }

    subscribe = (callback: Subscriber) => {
        this.subscribers.push(callback);
        callback(this.state);
    }

    unsubscribe = (callback: Subscriber) => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }

    getState = (): ChatbotState => {
        return this.state;
    }

    sendMessage = async (text: string) => {
        if (!text.trim() || this.state.isResponding) return;

        // Add user message to state
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: text.trim(),
        };
        this.state.messages.push(userMessage);

        // Add loading indicator
        const loadingMessage: ChatMessage = {
            id: `ai-loading-${Date.now()}`,
            sender: 'ai',
            text: '',
            isLoading: true,
        };
        this.state.messages.push(loadingMessage);
        this.state.isResponding = true;
        this.notify();

        try {
            const result: GenerateContentResponse = await this.chat.sendMessage({ message: text.trim() });
            const responseText = result.text;

            // Replace loading message with actual response
            const responseMessage: ChatMessage = {
                id: loadingMessage.id, // Keep the same ID to replace
                sender: 'ai',
                text: responseText || "Sorry, I'm having trouble connecting. Please try again.",
                isLoading: false,
            };
            
            const loadingIndex = this.state.messages.findIndex(m => m.id === loadingMessage.id);
            if(loadingIndex !== -1) {
                this.state.messages[loadingIndex] = responseMessage;
            } else {
                // Fallback in case loading message is not found
                this.state.messages.push(responseMessage);
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: ChatMessage = {
                id: loadingMessage.id,
                sender: 'ai',
                text: 'Oops! Something went wrong. Please try again in a moment.',
                isLoading: false,
            };
            const loadingIndex = this.state.messages.findIndex(m => m.id === loadingMessage.id);
            if(loadingIndex !== -1) {
                this.state.messages[loadingIndex] = errorMessage;
            }
        } finally {
            this.state.isResponding = false;
            this.notify();
        }
    }
}

export const chatbotService = new ChatbotService();