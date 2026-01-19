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
      window.AGENQ.render({ agentId: "e66326f6-b667-4776-ab55-e5912f3acbfe" });
    }

    tryMount();
    const interval = setInterval(tryMount, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div id="agenq-root" ref={slotRef} />
      <Script
        src={"http://localhost:4179/agenq-client-cdn.js"}
        strategy="afterInteractive"
      />
    </>
  );
}