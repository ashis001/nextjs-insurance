"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { stopSpeech, setGlobalMuteState } from "@/lib/google-tts";

interface ChatContextType {
    isOpen: boolean;
    width: number;
    externalMessage: string | null;
    hasGreeted: boolean;
    setHasGreeted: (val: boolean) => void;
    isMuted: boolean;
    setIsMuted: (val: boolean) => void;
    toggleChat: () => void;
    openChat: (message?: string) => void;
    closeChat: () => void;
    clearExternalMessage: () => void;
    updateWidth: (newWidth: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [width, setWidth] = useState(384);
    const [externalMessage, setExternalMessage] = useState<string | null>(null);
    const [hasGreeted, setHasGreetedState] = useState(false);
    const [isMuted, setIsMutedState] = useState(false);

    // Load saved states from storage
    useEffect(() => {
        const savedWidth = localStorage.getItem("chat_panel_width");
        if (savedWidth) {
            setWidth(parseInt(savedWidth, 10));
        }
    }, []);

    const setHasGreeted = useCallback((val: boolean) => {
        setHasGreetedState(val);
    }, []);

    const toggleChat = useCallback(() => {
        setIsOpen((prev) => {
            const next = !prev;
            if (!next) {
                stopSpeech();
            } else {
                // If we are opening, ensure it is unmuted
                setIsMutedState(false);
                setGlobalMuteState(false);
            }
            return next;
        });
    }, []);

    const openChat = useCallback((message?: string) => {
        stopSpeech();
        setIsMutedState(false);
        setGlobalMuteState(false);
        if (message) setExternalMessage(message);
        setIsOpen(true);
    }, []);

    const closeChat = useCallback(() => {
        stopSpeech();
        setIsOpen(false);
        // We keep the mute state as is when closing, 
        // but it will reset on next open as per openChat logic
    }, []);

    const clearExternalMessage = useCallback(() => setExternalMessage(null), []);

    const updateWidth = useCallback((newWidth: number) => {
        const clampedWidth = Math.min(Math.max(newWidth, 280), 600);
        setWidth(clampedWidth);
        localStorage.setItem("chat_panel_width", clampedWidth.toString());
    }, []);

    const setIsMuted = useCallback((val: boolean) => {
        setIsMutedState(val);
        setGlobalMuteState(val);
    }, []);

    return (
        <ChatContext.Provider value={{
            isOpen,
            width,
            externalMessage,
            hasGreeted,
            setHasGreeted,
            isMuted,
            setIsMuted,
            toggleChat,
            openChat,
            closeChat,
            clearExternalMessage,
            updateWidth
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
