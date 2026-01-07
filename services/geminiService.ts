import { GoogleGenAI, Type } from '@google/genai';
import { Song } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The title of the song.' },
        artist: { type: Type.STRING, description: 'The artist of the song.' },
    },
    required: ['title', 'artist'],
};

export const findSongByDescription = async (description: string): Promise<Song | null> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Based on the following description, identify one song. Description: "${description}"`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });

        const text = result.text.trim();
        const songData = JSON.parse(text);

        if (songData.title && songData.artist) {
            const randomId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const seed = encodeURIComponent(`${songData.title} ${songData.artist}`);
            return {
                id: randomId,
                title: songData.title,
                artist: songData.artist,
                artistId: `generated-artist-${songData.artist.replace(/\s+/g, '-').toLowerCase()}`,
                albumArt: `https://picsum.photos/seed/${seed}/500/500`,
                duration: Math.floor(Math.random() * (240 - 180 + 1)) + 180, // Random duration 3-4 mins
                url: '',
                playCount: 0,
            };
        }
        return null;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
    if (!prompt) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // This is the base64 string
            }
        }
        return null; // No image part found
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        return null;
    }
};