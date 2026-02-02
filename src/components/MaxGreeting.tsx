"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";

export default function MaxGreeting() {
    const { openChat, isOpen, hasGreeted, setHasGreeted, isMuted } = useChat();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only run this logic if we are NOT currently open and haven't shown yet in this session
        if (isOpen || hasGreeted) {
            return;
        }

        const triggerSpeech = () => {
            speakText("Hi, I’m Nina. Your Assistant. Ask me anything");
            window.removeEventListener('click', triggerSpeech);
            window.removeEventListener('keydown', triggerSpeech);
        };

        const timer = setTimeout(() => {
            if (!isOpen && !hasGreeted) {
                setIsVisible(true);
                setHasGreeted(true);
                // Removed session storage setting

                // If the user has already interacted, speak immediately
                if (navigator.userActivation?.isActive) {
                    speakText("Hi, I’m Nina. Your Assistant. Ask me anything");
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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-nina-fade-in">
            <div className="bg-white rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.4)] max-w-[380px] w-full relative overflow-hidden animate-nina-scale-in">

                {/* Full-Bleed Hero Image */}
                <div className="relative h-80 w-full">
                    <img
                        alt="Nina AI"
                        src="https://cdnstaticfiles.blob.core.windows.net/cdnstaticfiles/agent_images/nina.jpeg"
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-transparent" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-lg animate-pulse">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-white text-[10px] font-bold uppercase tracking-[0.1em]">Active Now</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 pb-8 flex flex-col items-center">
                    <div className="text-center space-y-2 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/80">
                            Digital Assistant
                        </p>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Hi, I’m <span className="text-blue-600">Nina</span>.
                        </h3>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => {
                            openChat("What would you like to do today? I can help you to onboard a new company, file a claim, or onboard a new policy provider.");
                            setIsVisible(false);
                        }}
                        className="group relative w-full overflow-hidden rounded-2xl bg-[#0a1e3b] px-6 py-4 transition-all duration-300 hover:bg-blue-900 hover:shadow-xl hover:shadow-blue-900/20 active:scale-[0.98]"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-2 text-white font-bold tracking-wide">
                            <Sparkles size={18} className="text-blue-400 group-hover:animate-spin-slow" />
                            <span>Ask Nina</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes nina-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes nina-scale-in {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-nina-fade-in {
                    animation: nina-fade-in 0.4s ease-out forwards;
                }
                .animate-nina-scale-in {
                    animation: nina-scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
                .group-hover\:animate-spin-slow:hover {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
}
