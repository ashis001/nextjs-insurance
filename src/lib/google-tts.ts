/**
 * Google Text-to-Speech API Utility
 * 
 * This utility provides a function to convert text to speech using the Google TTS API.
 * It uses the API key stored in the NEXT_PUBLIC_GOOGLE_TTS_API_KEY environment variable.
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY;
const API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

export interface TTSOptions {
    languageCode?: string;
    name?: string; // Voice name, e.g., 'en-US-Standard-C'
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL' | 'SSML_VOICE_GENDER_UNSPECIFIED';
    audioEncoding?: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
}

/**
 * Synthesizes text to speech and returns the audio content as a base64 string.
 * @param text The text to synthesize
 * @param options Voice options
 */
export async function synthesizeSpeech(text: string, options: TTSOptions = {}): Promise<string> {
    if (!API_KEY) {
        throw new Error('Google TTS API Key is not configured in .env.local');
    }

    const payload = {
        input: { text },
        voice: {
            languageCode: options.languageCode || 'en-US',
            name: options.name || 'en-US-Standard-C',
            ssmlGender: options.ssmlGender || 'FEMALE',
        },
        audioConfig: {
            audioEncoding: options.audioEncoding || 'MP3',
            speakingRate: options.speakingRate || 1.0,
            pitch: options.pitch || 0,
        },
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google TTS API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.audioContent; // This is a base64 encoded string
    } catch (error) {
        console.error('Error in synthesizeSpeech:', error);
        throw error;
    }
}

// Global variable to keep track of the current audio being played
let currentAudio: HTMLAudioElement | null = null;

/**
 * Plays the synthesized speech using the browser's Audio object.
 * @param audioContent Base64 encoded audio content
 */
export function playAudio(audioContent: string): Promise<void> {
    // If there is already audio playing, stop it first
    stopSpeech();

    return new Promise((resolve, reject) => {
        try {
            const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
            currentAudio = audio;

            audio.onended = () => {
                currentAudio = null;
                resolve();
            };
            audio.onerror = (e) => {
                currentAudio = null;
                reject(e);
            };
            audio.play();
        } catch (error) {
            currentAudio = null;
            reject(error);
        }
    });
}

/**
 * Stops any currently playing audio.
 */
export function stopSpeech(): void {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

/**
 * Convenience function to speak text immediately.
 */
export async function speakText(text: string, options: TTSOptions = {}): Promise<void> {
    try {
        const audioContent = await synthesizeSpeech(text, options);
        await playAudio(audioContent);
    } catch (error) {
        console.error('Failed to speak text:', error);
    }
}
