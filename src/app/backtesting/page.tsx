"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BacktestTradeForm } from "@/components/backtesting/BacktestTradeForm";
import { BacktestTradesList } from "@/components/backtesting/BacktestTradesList";
import { loadTrades, XAUUSD_BACKTEST_TRADES_KEY } from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";

export default function BacktestingPage() {
  const [trades, setTrades] = useState<XauUsdTrade[]>(() =>
    loadTrades(XAUUSD_BACKTEST_TRADES_KEY),
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === XAUUSD_BACKTEST_TRADES_KEY || e.key === null) {
        setTrades(loadTrades(XAUUSD_BACKTEST_TRADES_KEY));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = () => setTrades(loadTrades(XAUUSD_BACKTEST_TRADES_KEY));

  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)] sm:min-h-0"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </Link>
          </div>

          <BacktestTradeForm onLogged={refresh} />

          <BacktestTradesList trades={trades} onChange={refresh} />
        </div>
      </div>
    </AppShell>
  );
}
