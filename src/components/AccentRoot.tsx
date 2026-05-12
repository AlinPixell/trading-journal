"use client";

import { useEffect } from "react";
import { useTradeStore } from "@/store/useTradeStore";

export function AccentRoot({ children }: { children: React.ReactNode }) {
  const accent = useTradeStore((s) => s.appSettings.accentColor);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    const glow = `color-mix(in srgb, ${accent} 40%, transparent)`;
    document.documentElement.style.setProperty("--accent-glow", glow);
  }, [accent]);

  return <>{children}</>;
}
