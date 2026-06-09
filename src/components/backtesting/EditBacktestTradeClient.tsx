"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BacktestTradeForm } from "@/components/backtesting/BacktestTradeForm";
import {
  loadTrades,
  subscribeXauUsdTradesKey,
  XAUUSD_BACKTEST_TRADES_KEY,
} from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";

interface EditBacktestTradeClientProps {
  id: string;
}

export default function EditBacktestTradeClient({ id }: EditBacktestTradeClientProps) {
  const router = useRouter();
  const [trade, setTrade] = useState<XauUsdTrade | null>(() =>
    loadTrades(XAUUSD_BACKTEST_TRADES_KEY).find((t) => t.id === id) ?? null,
  );

  useEffect(
    () =>
      subscribeXauUsdTradesKey(XAUUSD_BACKTEST_TRADES_KEY, () => {
        setTrade(loadTrades(XAUUSD_BACKTEST_TRADES_KEY).find((t) => t.id === id) ?? null);
      }),
    [id],
  );

  if (!trade) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
          <div className="max-w-md rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-8 text-center backdrop-blur-xl">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Trade not found</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              It may have been deleted or the link is invalid.
            </p>
            <button
              type="button"
              onClick={() => router.push("/backtesting")}
              className="mt-6 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)]"
            >
              Back to backtesting
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <BacktestTradeForm
            trade={trade}
            onLogged={() => router.push("/backtesting")}
            onCancel={() => router.push("/backtesting")}
          />
        </div>
      </div>
    </AppShell>
  );
}
