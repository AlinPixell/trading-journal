"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TradesDashboard } from "@/components/trades/dashboard/TradesDashboard";
import { loadTrades, XAUUSD_TRADES_KEY } from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";

export default function XauUsdTradesWorkspacePage() {
  const [trades, setTrades] = useState<XauUsdTrade[]>(() => loadTrades(XAUUSD_TRADES_KEY));

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === XAUUSD_TRADES_KEY || e.key === null) {
        setTrades(loadTrades(XAUUSD_TRADES_KEY));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = () => setTrades(loadTrades(XAUUSD_TRADES_KEY));

  return (
    <AppShell>
      <TradesDashboard trades={trades} onTradesChange={refresh} />
    </AppShell>
  );
}
