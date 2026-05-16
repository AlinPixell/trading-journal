"use client";

import { useEffect } from "react";
import { NewTradeModalProvider } from "@/components/layout/NewTradeModal";
import { TRADE_JOURNAL_PERSIST_KEY, useTradeStore } from "@/store/useTradeStore";

export function AccentRoot({ children }: { children: React.ReactNode }) {
  const accent = useTradeStore((s) => s.appSettings.accentColor);
  const theme = useTradeStore((s) => s.appSettings.theme);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TRADE_JOURNAL_PERSIST_KEY || e.key === null) {
        void useTradeStore.persist.rehydrate();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme === "light" ? "light" : "dark";
    root.style.colorScheme = theme === "light" ? "light" : "dark";

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", theme === "light" ? "#f2f3f7" : "#111111");
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    const glow = `color-mix(in srgb, ${accent} 40%, transparent)`;
    document.documentElement.style.setProperty("--accent-glow", glow);
  }, [accent]);

  return <NewTradeModalProvider>{children}</NewTradeModalProvider>;
}
