"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    X,
    Send,
    MessageSquare,

    Mic,
    MicOff,
    Volume2,
    VolumeX
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { fetchAllCorporates } from "@/lib/db";
import { Corporate } from "@/lib/types";
import { speakText, stopSpeech } from "@/lib/google-tts";
import clsx from "clsx";

interface Message {
    id: string;
    text: string;
    sender: "user" | "assistant";
    timestamp: string;
    actions?: { label: string; value: string }[];
}

export default function RightChatPanel() {
    const router = useRouter();
    const {
        isOpen,
        closeChat,
        width,
        updateWidth,
        externalMessage,
        clearExternalMessage,
        isMuted,
        setIsMuted,
    } = useChat();
    const [inputValue, setInputValue] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false); // Persistent voice mode
    const [pendingContext, setPendingContext] = useState<string | null>(null); // NEW: Track conversational state
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef("");
    const isVoiceModeRef = useRef(false); // Using ref for immediate sync in callbacks
    const [isTyping, setIsTyping] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const isResizingRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInterruptedRef = useRef(false);
    const activeMessageTextRef = useRef<string | null>(null);



    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false; // Stop after one phrase
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0])
                        .map((result: any) => result.transcript)
                        .join("");

                    transcriptRef.current = transcript;
                    setInputValue(transcript);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    if (transcriptRef.current.trim()) {
                        handleSend(transcriptRef.current);
                        transcriptRef.current = "";
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                    setIsVoiceMode(false);
                    isVoiceModeRef.current = false;
                };
            }
        }
    }, []);

    const toggleListening = () => {
        if (isListening || isVoiceMode) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setIsVoiceMode(false);
            isVoiceModeRef.current = false;
            stopSpeech();
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
                setIsVoiceMode(true);
                isVoiceModeRef.current = true;
            } catch (err) {
                console.error("Failed to start speech recognition:", err);
            }
        }
    };

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hi, I'm **Nina**. Your Assistant. Ask me anything",
            sender: "assistant",
            timestamp: "", // Initialize empty to prevent hydration mismatch
        },
    ]);

    const speakWithIndicator = async (text: string) => {
        try {
            // Stop listening before speaking to prevent state conflicts
            if (isListening) {
                recognitionRef.current?.stop();
                setIsListening(false);
            }

            setIsSpeaking(true);
            await speakText(text);
        } finally {
            setIsSpeaking(false);
        }
    };

    // Effect to handle unmuting while a message is being typed
    useEffect(() => {
        if (!isMuted && activeMessageTextRef.current && isTyping && !isSpeaking) {
            speakWithIndicator(activeMessageTextRef.current);
        }
    }, [isMuted, isTyping, isSpeaking]);



    const streamMessage = async (text: string, sender: "assistant" | "user", actions?: { label: string; value: string }[]) => {
        isInterruptedRef.current = false;
        const id = Date.now().toString();
        const baseMsg: Message = {
            id,
            text: "",
            sender,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, baseMsg]);

        const words = text.split(" ");
        let currentText = "";
        activeMessageTextRef.current = text;
        const speechPromise = speakWithIndicator(text);

        for (let i = 0; i < words.length; i++) {
            if (isInterruptedRef.current) return;

            currentText += (i === 0 ? "" : " ") + words[i];
            setMessages(prev => prev.map(m => m.id === id ? { ...m, text: currentText } : m));
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        if (actions && !isInterruptedRef.current) {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, actions } : m));
        }

        await speechPromise;
        activeMessageTextRef.current = null;

        // Auto-reactivate mic if voice mode is active and not interrupted
        if (isVoiceModeRef.current && !isInterruptedRef.current) {
            setTimeout(() => {
                try {
                    recognitionRef.current?.start();
                    setIsListening(true);
                } catch (err) {
                    console.error("Auto-mic start failed:", err);
                }
            }, 300);
        }
    };

    // Handle Entry Logic (Popup vs Top Bar)
    useEffect(() => {
        if (isOpen) {
            isInterruptedRef.current = false;

            const secondMsg = "What would you like to do today? I can help you to onboard a new company or file a claim or onboard a new policy provider.";
            const thirdMsg = "You can talk to or you can type text here.";

            // CASE A: Opened via Top Bar (or any direct external trigger)
            if (externalMessage) {
                const timer = setTimeout(async () => {
                    const isStandardGreeting = externalMessage.toLowerCase().includes("hi, i’m nina") ||
                        externalMessage.toLowerCase().includes("hi, i'm nina") ||
                        externalMessage.toLowerCase().includes("hi, i’m max") ||
                        externalMessage.toLowerCase().includes("hi, i'm max");
                    const isIntroQuestion = externalMessage.includes("What would you like to do today?");

                    // ONLY clear if it's a new session/greeting from the header
                    if (isStandardGreeting || isIntroQuestion) {
                        setMessages([]); // Reset chat for fresh start
                    }

                    // If opened via Popup (Question), insert the implied first greeting
                    if (isIntroQuestion) {
                        const hiddenGreeting: Message = {
                            id: "0",
                            text: "Hi, I'm **Nina**. Your Assistant. Ask me anything",
                            sender: "assistant",
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setMessages([hiddenGreeting]);
                        // Small delay to ensure order
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    // 1st Visible Streamed Message: The trigger message
                    await streamMessage(externalMessage, "assistant");

                    // If it was the standard "Hi I'm Nina", we follow up with the Question + Tips
                    if (isStandardGreeting) {
                        if (!isInterruptedRef.current) {
                            await streamMessage(secondMsg, "assistant");
                        }
                        if (!isInterruptedRef.current) {
                            await streamMessage(thirdMsg, "assistant");
                        }
                    }
                    // If it was ALREADY the Question (from popup), we just follow up with the Tips
                    else if (isIntroQuestion) {
                        if (!isInterruptedRef.current) {
                            await streamMessage(thirdMsg, "assistant");
                        }
                    }

                    clearExternalMessage();
                }, 500);
                return () => clearTimeout(timer);
            }
            // CASE B: Opened via Popup (No externalMessage, initial state only)
            else if (messages.length === 1 && messages[0].id === "1") {
                const timer = setTimeout(async () => {
                    // 2nd Message
                    if (!isInterruptedRef.current) {
                        await streamMessage(secondMsg, "assistant");
                    }
                    // 3rd Message
                    if (!isInterruptedRef.current) {
                        await streamMessage(thirdMsg, "assistant");
                    }
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [externalMessage, isOpen, clearExternalMessage]);


    // Fix Hydration mismatch for time
    useEffect(() => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === "1" && !msg.timestamp
                    ? {
                        ...msg,
                        timestamp: new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    }
                    : msg,
            ),
        );
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizingRef.current) return;
            const newWidth = window.innerWidth - e.clientX;
            updateWidth(newWidth);
        },
        [updateWidth],
    );

    const stopResizing = useCallback(() => {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
    }, []);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        setIsResizing(true);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, handleMouseMove, stopResizing]);
    const handleSend = async (overrideValue?: string) => {
        // Stop current listening for processing
        recognitionRef.current?.stop();
        setIsListening(false);

        stopSpeech();
        isInterruptedRef.current = true; // Stop any ongoing stream

        const textToSend = overrideValue || inputValue;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI Thinking & Data Fetching
        setTimeout(async () => {
            isInterruptedRef.current = false; // Reset to allow the new response to stream
            const corporates = await fetchAllCorporates();
            const query = textToSend.toLowerCase().trim();

            // --- CONTEXTUAL INTENT RESOLUTION ---
            if (pendingContext === "onboarding_sample_prompt") {
                const positiveResponses = ["yes", "sure", "ok", "yep", "do it", "use sample", "sample data"];
                const negativeResponses = ["no", "never mind", "skip", "real", "real customer"];

                if (positiveResponses.some(r => query.includes(r))) {
                    setPendingContext(null);
                    localStorage.setItem("max_guide_step", "add_customer");
                    router.push("/corporate-customers");
                    return;
                } else if (negativeResponses.some(r => query.includes(r))) {
                    setPendingContext(null);
                    if (query.includes("real")) {
                        await streamMessage("Alright, let's set up a real customer. Navigate to the Corporate Customers page and click 'Add New Customer'.", "assistant");
                        return;
                    }
                }
            }
            // Clear context if user says something unrelated
            setPendingContext(null);

            let responseText = "";

            // --- KNOWLEDGE BASE LOGIC (Analyzing Project Workflows) ---
            if (query.includes("onboard") || query.includes("onboarding")) {
                if (isInterruptedRef.current) return;
                setIsTyping(false);
                const introText = "Got it. You want to know how to create a new customer or organization.";
                await streamMessage(introText, "assistant");

                // Visual pause before follow-up typing animation
                setIsTyping(true);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setIsTyping(false);

                const followUpText = "Would you like to do a sample onboarding first?";
                setPendingContext("onboarding_sample_prompt"); // Set the context for the next turn
                await streamMessage(followUpText, "assistant", [
                    { label: "Use Sample Data", value: "sample" },
                    { label: "Use Real Customer", value: "real" },
                ]);
                return;
            }

            if (
                query.includes("how to") ||
                query.includes("steps") ||
                query.includes("guide") ||
                query.includes("add")
            ) {
                if (query.includes("member")) {
                    responseText =
                        "To add a **New Member**, follow these steps:\n\n" +
                        "1. Go to the **Corporate Customers** section from the sidebar.\n" +
                        "2. Select the specific company you want to add members to.\n" +
                        "3. Navigate to the **Tiers/Plans** section of that corporate profile.\n" +
                        "4. Click on **Manage Members** or **Upload Roster** (CSV) within the specific plan tier.";
                } else if (query.includes("corporate") || query.includes("customer")) {
                    responseText =
                        "To add a **New Corporate Customer**:\n\n" +
                        "1. Navigate to the **Corporate Customers** page.\n" +
                        "2. Click the white **'Add New Customer'** button in the top right header (navy background).\n" +
                        "3. Fill in the organization name and advisor details to get started.";
                } else if (query.includes("advisor") || query.includes("broker")) {
                    responseText =
                        "To manage **Advisors**, use the **Advisors** link in the sidebar to view your registered brokers and their associated corporate clients.";
                } else {
                    responseText =
                        "I can help with that! Are you looking to add a member, a corporate customer, or manage settings? Just ask 'How do I add a member?' for a full guide.";
                }
            }
            // --- DATA RETRIEVAL LOGIC ---
            else if (
                query.includes("corporates") ||
                query.includes("customers") ||
                query.includes("list")
            ) {
                if (corporates.length > 0) {
                    responseText =
                        `I found **${corporates.length}** corporate customers in the system: \n\n` +
                        corporates
                            .slice(0, 5)
                            .map((c) => `• **${c.name}** (${c.broker || "No Advisor"})`)
                            .join("\n") +
                        (corporates.length > 5
                            ? `\n...and ${corporates.length - 5} more.`
                            : "");
                } else {
                    responseText =
                        "I couldn't find any corporate customers in the database right now.";
                }
            } else if (query.includes("count") || query.includes("how many")) {
                responseText = `There are currently **${corporates.length}** corporate customers registered in your dashboard.`;
            } else {
                // Try searching for a specific corporate name
                const found = corporates.find((c) =>
                    query.includes((c.name || "").toLowerCase()),
                );
                if (found) {
                    responseText =
                        `Here is the info for **${found.name}**:\n\n` +
                        `• **Advisor**: ${found.broker || "Not assigned"}\n` +
                        `• **Email**: ${found.contactEmail || "N/A"}\n` +
                        `• **Status**: ${found.corporateInfoCompleted ? "Profile Completed" : "In Progress"}`;
                } else {
                    responseText =
                        "I'm here to assist! I can help you find corporate data (e.g., 'List customers') or guide you through workflows (e.g., 'How to add a new member').";
                }
            }

            if (responseText) {
                setIsTyping(false);
                await streamMessage(responseText, "assistant");
            } else if (!query.includes("onboard") && !query.includes("onboarding")) {
                // Fallback if no responseText set and not handled by special blocks
                setIsTyping(false);
            }
        }, 2000);
    };

    return (
        <div
            className={clsx(
                "fixed top-0 right-0 h-full bg-white z-[9999] flex flex-col border-l border-gray-300 shadow-[-4px_0_20px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "translate-x-full overflow-hidden w-0",
            )}
            style={{
                width: isOpen ? `${width}px` : "0px",
                transition: isResizing
                    ? "none"
                    : "width 300ms ease-in-out, transform 300ms ease-in-out",
            }}>
            {/* Resize Handle */}
            <div
                onMouseDown={startResizing}
                className={clsx(
                    "absolute left-0 top-0 h-full w-1 cursor-col-resize z-[10000] transition-colors",
                    isResizing ? "bg-[#1e3a5f]" : "hover:bg-[#1e3a5f]/30",
                )}
                title='Drag to resize'>
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-6 bg-gray-200 rounded-full' />
            </div>

            {/* Header */}
            <div className='flex items-center justify-between p-4 bg-white border-b border-gray-200'>
                <div className='flex items-center gap-3'>
                    <div className='relative'>
                        <div className={clsx(
                            'w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white shadow-md relative z-10 transition-all duration-500',
                            isSpeaking ? 'ring-2 ring-green-500 ring-offset-2' :
                                isListening ? 'ring-2 ring-yellow-400 ring-offset-2' : 'bg-[#1e3a5f]'
                        )}>
                            <img
                                alt='Voice Assistant'
                                src='https://cdnstaticfiles.blob.core.windows.net/cdnstaticfiles/agent_images/nina.jpeg'
                                className='w-full h-full rounded-full object-cover object-top'
                            />
                        </div>
                        {isSpeaking && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
                                <div className="absolute inset-[-4px] rounded-full bg-green-400 animate-ping opacity-20" style={{ animationDelay: '0.4s' }} />
                                <div className="absolute inset-[-8px] rounded-full border-2 border-green-300 animate-pulse opacity-10" />
                            </>
                        )}
                        {isListening && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30" />
                                <div className="absolute inset-[-4px] rounded-full bg-yellow-300 animate-ping opacity-20" style={{ animationDelay: '0.4s' }} />
                                <div className="absolute inset-[-8px] rounded-full border-2 border-yellow-200 animate-pulse opacity-10" />
                            </>
                        )}
                    </div>
                    <div>
                        <h3 className='text-[#1e3a5f] font-bold text-sm tracking-tight'>
                            NINA CHAT
                        </h3>
                        {/*  🔊 STRONG SPEAKING WAVE */}
                        {/* <div className='flex items-center gap-2'>
          
              <div className='flex items-end gap-[2px] h-[10px]'>
                <span
                  className={clsx(
                    "w-[2px] rounded-sm bg-green-500 transition-all",
                    isSpeaking
                      ? "h-[10px] animate-[microWave_0.9s_infinite] shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                      : "h-[6px]",
                  )}
                />
                <span
                  className={clsx(
                    "w-[2px] rounded-sm bg-green-500 transition-all",
                    isSpeaking
                      ? "h-[8px] animate-[microWave_0.7s_infinite] shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                      : "h-[5px]",
                  )}
                />
                <span
                  className={clsx(
                    "w-[2px] rounded-sm bg-green-500 transition-all",
                    isSpeaking
                      ? "h-[9px] animate-[microWave_1.1s_infinite] shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                      : "h-[6px]",
                  )}
                />
              </div>

           
              <span className='text-[10px] font-semibold  text-gray-500'>
                {isSpeaking ? "Speaking..." : "Online & Ready"}
              </span>
            </div> */}

                        <p className='text-gray-500 text-[10px] flex items-center gap-2 font-semibold'>
                            <span className='relative flex h-2 w-2'>
                                {isSpeaking && (
                                    <>
                                        <span className='absolute inset-[-2px] inline-flex h-full w-full rounded-full bg-green-400 animate-ping opacity-75' />
                                        <span className='absolute inset-[-4px] inline-flex h-full w-full rounded-full bg-green-300 animate-pulse opacity-40' />
                                    </>
                                )}
                                {isListening && (
                                    <>
                                        <span className='absolute inset-[-2px] inline-flex h-full w-full rounded-full bg-yellow-400 animate-ping opacity-75' />
                                        <span className='absolute inset-[-4px] inline-flex h-full w-full rounded-full bg-yellow-300 animate-pulse opacity-40' />
                                    </>
                                )}
                                <span className={clsx(
                                    'relative inline-flex rounded-full h-2 w-2 transition-colors duration-300',
                                    isListening ? 'bg-yellow-400' : 'bg-green-500'
                                )} />
                            </span>
                            {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Online"}
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-1'>
                    <button
                        onClick={() => {
                            setIsMuted(!isMuted);
                        }}
                        className={clsx(
                            'p-2 rounded-full transition-all',
                            isMuted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        )}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={() => {
                            isInterruptedRef.current = true;
                            stopSpeech();
                            closeChat();
                        }}
                        className='text-gray-400 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-full'>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className='flex-1 overflow-y-auto p-5 pb-10 space-y-6 bg-[#f8fafc]'>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex flex-col gap-1.5",
                            msg.sender === "user"
                                ? "items-end ml-auto max-w-[85%]"
                                : "max-w-[85%]",
                        )}>
                        <div
                            className={clsx(
                                "p-4 rounded-2xl shadow-sm text-[14px] leading-relaxed border whitespace-pre-wrap",
                                msg.sender === "user"
                                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f]/10 rounded-tr-none shadow-lg"
                                    : "bg-white text-gray-700 border-gray-200 rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
                            )}>
                            {msg.text
                                .split("**")
                                .map((part, i) =>
                                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
                                )}

                            {/* Action Buttons */}
                            {msg.actions && (
                                <div className='mt-4 flex flex-col gap-2'>
                                    {msg.actions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Clear pending context immediately
                                                setPendingContext(null);

                                                if (action.value === "real") {
                                                    handleSend("Use Real Customer");
                                                } else if (action.value === "sample") {
                                                    localStorage.setItem("max_guide_step", "add_customer");
                                                    router.push("/corporate-customers");
                                                } else {
                                                    handleSend(action.label);
                                                }
                                            }}
                                            className='w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#1e3a5f] hover:bg-blue-50 hover:border-blue-200 transition-all text-left flex items-center justify-between group'>
                                            {action.label}
                                            <div className='w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-400 group-hover:text-blue-600 transition-colors'>
                                                →
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span
                            className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider",
                                msg.sender === "user"
                                    ? "text-gray-500 mr-1"
                                    : "text-gray-400 ml-1",
                            )}>
                            {msg.sender === "assistant" ? "Nina" : "You"} •{" "}
                            {msg.timestamp}
                        </span>
                    </div>
                ))}

                {isTyping && (
                    <div className='flex flex-col gap-2 max-w-[85%] animate-fade-in'>
                        <div className='bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm inline-flex items-center w-fit'>
                            <div className='flex space-x-1.5 h-3 items-center'>
                                <div className='w-2 h-2 bg-[#1e3a5f]/60 rounded-full animate-bounce [animation-delay:-0.3s]' />
                                <div className='w-2 h-2 bg-[#1e3a5f]/60 rounded-full animate-bounce [animation-delay:-0.15s]' />
                                <div className='w-2 h-2 bg-[#1e3a5f]/60 rounded-full animate-bounce' />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className='p-4 bg-white border-t border-gray-200'>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className='flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-300 p-1.5 focus-within:border-[#1e3a5f] focus-within:ring-2 focus-within:ring-[#1e3a5f]/10 transition-all'>
                    <button
                        type='button'
                        onClick={toggleListening}
                        className={clsx(
                            "transition-all p-2.5 rounded-xl shadow-sm",
                            isVoiceMode
                                ? "text-red-500 bg-red-50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                : "text-gray-500 hover:text-[#1e3a5f] hover:bg-white"
                        )}
                        title={isVoiceMode ? "Stop voice mode" : "Start voice mode"}>
                        {isVoiceMode ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <input
                        type='text'
                        placeholder={isListening ? "Listening..." : "Ask Nina something..."}

                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className='flex-1 bg-transparent text-gray-800 text-[14px] outline-none py-2 px-1 placeholder:text-gray-400 font-medium'
                    />
                    <button
                        type='submit'
                        disabled={!inputValue.trim() || isTyping}
                        className={clsx(
                            "p-2.5 rounded-xl transition-all shadow-md",
                            inputValue.trim() && !isTyping
                                ? "bg-[#1e3a5f] text-white hover:bg-[#162a45] hover:scale-105 active:scale-100"
                                : "bg-gray-100 text-gray-300 shadow-none cursor-not-allowed",
                        )}>
                        <Send size={18} />
                    </button>
                </form>
                <div className='flex items-center justify-center gap-3 mt-4'>
                    <div className='h-[1px] flex-1 bg-gray-200'></div>
                    <p className='text-[9px] text-gray-400 font-black uppercase tracking-[2px]'>
                        Security Verified Assistant
                    </p>
                    <div className='h-[1px] flex-1 bg-gray-200'></div>
                </div>
            </div>
        </div>
    );
}
