"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";

export default function MaxGreeting() {
    const { openChat, isOpen } = useChat();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only run this logic if we are NOT currently open
        if (isOpen) {
            setIsVisible(false);
            return;
        }

        const hasShownInSession = sessionStorage.getItem("max_greeted_session");

        if (!hasShownInSession) {
            const timer = setTimeout(() => {
                // Double check isOpen before showing
                if (!sessionStorage.getItem("max_greeted_session")) {
                    setIsVisible(true);
                    sessionStorage.setItem("max_greeted_session", "true");
                    speakText("Hi, I’m Max. Your Assistant. Ask me anything");
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // If chat is opened while we are visible, hide immediately
    useEffect(() => {
        if (isOpen && isVisible) {
            setIsVisible(false);
        }
    }, [isOpen, isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-[6px] animate-nina-fade-in">
            <div className="bg-white rounded-[40px] shadow-[0_40px_120px_rgba(0,0,0,0.3)] p-12 max-w-sm w-full relative overflow-hidden animate-nina-scale-in">
                {/* Subtle Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    {/* Minimalist Icon */}
                    <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-md" />
                    </div>

                    {/* Typography */}
                    <div className="text-center space-y-3 mb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/80">
                            AI Assistant
                        </p>
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                            "Hi, I’m <span className="text-blue-600">Max</span>.<br />Your Assistant."
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">
                            Ask me anything
                        </p>
                    </div>

                    {/* Minimalist Button */}
                    <button
                        onClick={() => {
                            openChat("What would you like to do today? I can help you to onboard a new company or file a claim or onboard a new policy provider.");
                            setIsVisible(false);
                        }}
                        className="w-full bg-[#0a1e3b] text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-900 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                    >
                        Ask
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes nina-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes nina-scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-nina-fade-in {
                    animation: nina-fade-in 0.4s ease-out forwards;
                }
                .animate-nina-scale-in {
                    animation: nina-scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
