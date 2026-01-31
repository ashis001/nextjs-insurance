"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ChatContextType {
    isOpen: boolean;
    width: number;
    externalMessage: string | null;
    toggleChat: () => void;
    openChat: (message?: string) => void;
    closeChat: () => void;
    clearExternalMessage: () => void;
    updateWidth: (newWidth: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [width, setWidth] = useState(384); // Default 96 (384px)
    const [externalMessage, setExternalMessage] = useState<string | null>(null);

    // Load saved width from localStorage if available
    useEffect(() => {
        const savedWidth = localStorage.getItem("chat_panel_width");
        if (savedWidth) {
            setWidth(parseInt(savedWidth, 10));
        }
    }, []);

    const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);
    const openChat = useCallback((message?: string) => {
        if (message) setExternalMessage(message);
        setIsOpen(true);
    }, []);
    const closeChat = useCallback(() => setIsOpen(false), []);
    const clearExternalMessage = useCallback(() => setExternalMessage(null), []);

    const updateWidth = useCallback((newWidth: number) => {
        const clampedWidth = Math.min(Math.max(newWidth, 280), 600); // Min 280px, Max 600px
        setWidth(clampedWidth);
        localStorage.setItem("chat_panel_width", clampedWidth.toString());
    }, []);

    return (
        <ChatContext.Provider value={{
            isOpen,
            width,
            externalMessage,
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
