"use client";

import React from "react";
import { MousePointer2 } from "lucide-react";

interface MaxGuidePointerProps {
    text: string;
}

export default function MaxGuidePointer({ text }: MaxGuidePointerProps) {
    return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-[100] animate-max-guide-bounce cursor-default">
            {/* The "Hand/Cursor" Icon */}
            <div className="flex flex-col items-center">
                <MousePointer2 className="w-8 h-8 text-[#0a1e3b] fill-white shadow-2xl rotate-[30deg] animate-max-guide-pulse" />

                {/* Tooltip Styling */}
                <div className="mt-2 bg-[#0a1e3b] text-white px-5 py-3 rounded-2xl shadow-[0_20px_50px_rgba(10,30,59,0.3)] border border-blue-400/30 min-w-[200px] text-center">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Max's Guide</p>
                    <p className="text-sm font-bold leading-relaxed">{text}</p>

                    {/* Arrow */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#0a1e3b]"></div>
                </div>
            </div>

            <style jsx>{`
        @keyframes max-guide-bounce {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, -10px) scale(1.02); }
        }
        @keyframes max-guide-pulse {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0)); }
          50% { filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)); }
        }
        .animate-max-guide-bounce {
          animation: max-guide-bounce 2s ease-in-out infinite;
        }
        .animate-max-guide-pulse {
          animation: max-guide-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
