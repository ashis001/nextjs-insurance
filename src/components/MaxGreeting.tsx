"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";

export default function MaxGreeting() {
    const { openChat, isOpen, hasGreeted, setHasGreeted } = useChat();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only run this logic if we are NOT currently open and haven't shown yet in this session
        if (isOpen || hasGreeted) {
            return;
        }

        const triggerSpeech = () => {
            speakText("Hi, I’m Max. Your Assistant. Ask me anything");
            window.removeEventListener('click', triggerSpeech);
            window.removeEventListener('keydown', triggerSpeech);
        };

        const timer = setTimeout(() => {
            if (!isOpen && !hasGreeted) {
                setIsVisible(true);
                setHasGreeted(true);
                sessionStorage.setItem("max_greeted_session", "true");

                // If the user has already interacted, speak immediately
                if (navigator.userActivation?.isActive) {
                    speakText("Hi, I’m Max. Your Assistant. Ask me anything");
                } else {
                    // Otherwise, wait for the first click or keypress
                    window.addEventListener('click', triggerSpeech);
                    window.addEventListener('keydown', triggerSpeech);
                }
            }
        }, 1500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', triggerSpeech);
            window.removeEventListener('keydown', triggerSpeech);
        };
    }, [isOpen, hasGreeted, setHasGreeted]);

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
                    {/* AI Profile Image */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-500/20 border-4 border-white">
                            <img
                                alt="Max AI"
                                src="https://cdnstaticfiles.blob.core.windows.net/cdnstaticfiles/agent_images/577c9033ea4a4f26a23d25e0c2d857d9_female5.jpg"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-lg" />
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
