/**
 * Google Text-to-Speech API Utility
 * 
 * This utility provides a function to convert text to speech using the Google TTS API.
 * It uses the API key stored in the NEXT_PUBLIC_GOOGLE_TTS_API_KEY environment variable.
 */

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY;
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'AXdMgz6evoL7OPd7eU12';
const ELEVENLABS_MODEL = process.env.NEXT_PUBLIC_ELEVENLABS_MODEL || 'eleven_turbo_v2_5';

export interface TTSOptions {
    languageCode?: string;
    name?: string; // Voice name, e.g., 'en-US-Standard-C'
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL' | 'SSML_VOICE_GENDER_UNSPECIFIED';
    audioEncoding?: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
}

/**
 * Utility to strip markdown characters before sending to TTS
 */
function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*/g, '')    // Remove bold
        .replace(/\*/g, '')     // Remove italic/bullets
        .replace(/__/g, '')     // Remove bold underscores
        .replace(/_/g, '')      // Remove italic underscores
        .replace(/#/g, '')      // Remove headers
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link syntax but keep label
        .trim();
}

/**
 * Synthesizes text to speech and returns the audio content as a base64 string.
 * @param text The text to synthesize
 * @param options Voice options
 */
export async function synthesizeSpeech(text: string, options: TTSOptions = {}): Promise<string> {
    const cleanedText = stripMarkdown(text);

    // 1. Try Google TTS first if API key is available
    if (GOOGLE_API_KEY) {
        const GOOGLE_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

        const payload = {
            input: { text: cleanedText },
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
            const response = await fetch(GOOGLE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                return data.audioContent; // Base64 string
            }
            console.warn('Google TTS failed, trying ElevenLabs fallback...');
        } catch (error) {
            console.error('Google TTS error:', error);
        }
    }

    // 2. Try ElevenLabs if Google is unavailable or failed
    if (ELEVENLABS_API_KEY) {
        try {
            const voiceId = options.name || ELEVENLABS_VOICE_ID;
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text: cleanedText,
                    model_id: ELEVENLABS_MODEL,
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const base64 = btoa(
                    new Uint8Array(arrayBuffer)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                return base64;
            }
            const errorText = await response.text();
            console.error('ElevenLabs API Error:', errorText);
        } catch (error) {
            console.error('ElevenLabs failed:', error);
        }
    }

    throw new Error('No TTS provider available. Please check your .env.local file.');
}

// Global variables to keep track of the current audio and its resolve function
let currentAudio: HTMLAudioElement | null = null;
let resolveCurrentAudio: (() => void) | null = null;
let globalAudioMuted = false;

/**
 * Update the global mute state for the TTS utility.
 * When muted, all currently playing audio will stop and no new audio will start.
 */
export function setGlobalMuteState(muted: boolean): void {
    globalAudioMuted = muted;
    if (muted) {
        stopSpeech();
    }
}

/**
 * Plays the synthesized speech using the browser's Audio object.
 * @param audioContent Base64 encoded audio content
 */
export function playAudio(audioContent: string): Promise<void> {
    // If we are currently muted, don't play anything
    if (globalAudioMuted) {
        return Promise.resolve();
    }

    // If there is already audio playing, stop it first
    stopSpeech();

    return new Promise((resolve, reject) => {
        try {
            // Check again right before creating the audio object
            if (globalAudioMuted) return resolve();

            const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
            currentAudio = audio;
            resolveCurrentAudio = resolve;

            audio.onended = () => {
                currentAudio = null;
                resolveCurrentAudio = null;
                resolve();
            };
            audio.onerror = (e) => {
                currentAudio = null;
                resolveCurrentAudio = null;
                reject(e);
            };

            // Final check right before play
            if (globalAudioMuted) {
                currentAudio = null;
                resolve();
                return;
            }

            audio.play();
        } catch (error) {
            currentAudio = null;
            resolveCurrentAudio = null;
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
    if (resolveCurrentAudio) {
        resolveCurrentAudio();
        resolveCurrentAudio = null;
    }
}

/**
 * Convenience function to speak text immediately.
 */
export async function speakText(text: string, options: TTSOptions = {}): Promise<void> {
    if (globalAudioMuted) return;

    try {
        const audioContent = await synthesizeSpeech(text, options);

        // Critical check after synthesis delay
        if (globalAudioMuted) return;

        await playAudio(audioContent);
    } catch (error) {
        console.error('Failed to speak text:', error);
    }
}
