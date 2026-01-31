"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

interface MaxGuidePointerProps {
  text: string;
  targetUrl: string;
}

export default function MaxGuidePointer({ text, targetUrl }: MaxGuidePointerProps) {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate after 10 seconds
    const timer = setTimeout(() => {
      router.push(targetUrl);
    }, 10000);

    return () => clearTimeout(timer);
  }, [targetUrl, router]);

  const handleManualClick = () => {
    router.push(targetUrl);
  };

  return (
    <div
      onClick={handleManualClick}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[99999] cursor-pointer flex flex-col items-center group select-none"
    >
      {/* Refined Telegram-style Airplane */}
      <div className="relative z-[100000] animate-max-guide-bounce-gentle">
        <div className="bg-red-500 p-3 rounded-full shadow-[0_4px_15px_rgba(239,68,68,0.4)] border-2 border-white transform -rotate-[15deg] group-hover:scale-110 transition-transform duration-300">
          <Send className="w-5 h-5 text-white fill-white translate-x-[1px] -translate-y-[1px]" />
        </div>

        {/* Subtle Pulse */}
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-10 scale-125" />
      </div>

      {/* Simplified Professional Container */}
      <div className="mt-[-10px] bg-[#0a1e3b] text-white px-6 py-4 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/5 min-w-[240px] text-center backdrop-blur-md">
        <div className="flex flex-col items-center gap-1 mt-1">
          <h4 className="text-[16px] font-bold text-white leading-tight">Click the button</h4>
          <p className="text-[12px] text-slate-400 font-medium leading-snug">{text}</p>
        </div>

        {/* Minimalist Progress Line */}
        <div className="w-full h-[3px] bg-white/10 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-red-500 animate-timer-progress origin-left rounded-full" />
        </div>

        <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-[0.2em]">Navigating in 10s</p>

        {/* Connecting Arrow */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[#0a1e3b]"></div>
      </div>

      <style jsx>{`
                @keyframes max-guide-bounce-gentle {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes timer-progress {
                  from { transform: scaleX(1); }
                  to { transform: scaleX(0); }
                }
                .animate-max-guide-bounce-gentle {
                  animation: max-guide-bounce-gentle 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                .animate-timer-progress {
                  animation: timer-progress 10s linear forwards;
                }
            `}</style>
    </div>
  );
}
