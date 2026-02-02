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
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[99999] cursor-pointer flex flex-col items-center group select-none"
    >
      {/* Red Pulse Indicator */}
      <div className="relative z-[100000] animate-max-guide-bounce-gentle">
        <div className="bg-red-500 p-2 rounded-full shadow-[0_4px_10px_rgba(239,68,68,0.3)] border-2 border-white transform -rotate-[15deg] group-hover:scale-110 transition-all duration-300">
          <Send className="w-3.5 h-3.5 text-white fill-white translate-x-[0.5px] -translate-y-[0.5px]" />
        </div>

        {/* Subtle Pulse */}
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 scale-150" />
      </div>

      <style jsx>{`
                @keyframes max-guide-bounce-gentle {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-4px); }
                }
                .animate-max-guide-bounce-gentle {
                  animation: max-guide-bounce-gentle 1.5s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
}
