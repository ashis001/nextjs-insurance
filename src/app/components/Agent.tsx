"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    AGENQ?: {
      render: (options?: { agentId?: string }) => void;
    };
  }
}

export default function Agent() {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    function tryMount() {
      if (!window.AGENQ?.render) return;
      if (!slotRef.current) return;
      if (mounted.current) return;

      mounted.current = true;
      console.log("🎉 AgenQ SDK detected → mounting");

      // Pass agentId
      window.AGENQ.render({ agentId: "02abf12e-0d8b-4e3a-97ae-d17b7ec7fa3c" });
    }

    tryMount();
    const interval = setInterval(tryMount, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div id="agenq-root" ref={slotRef} />
      <Script
        src={process.env.NEXT_PUBLIC_CDN_URL || "https://cdnstaticfiles.blob.core.windows.net/cdn/clientsdk/agenq-client-sdk.js"}
        strategy="afterInteractive"
      />
    </>
  );
}