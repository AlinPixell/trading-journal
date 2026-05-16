"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BacktestTradeForm } from "@/components/backtesting/BacktestTradeForm";
import { BacktestTradesList } from "@/components/backtesting/BacktestTradesList";
import {
  loadTrades,
  subscribeXauUsdTradesKey,
  XAUUSD_BACKTEST_TRADES_KEY,
} from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";

export default function BacktestingPage() {
  const [trades, setTrades] = useState<XauUsdTrade[]>(() =>
    loadTrades(XAUUSD_BACKTEST_TRADES_KEY),
  );

  useEffect(
    () =>
      subscribeXauUsdTradesKey(XAUUSD_BACKTEST_TRADES_KEY, () =>
        setTrades(loadTrades(XAUUSD_BACKTEST_TRADES_KEY)),
      ),
    [],
  );

  const refresh = () => setTrades(loadTrades(XAUUSD_BACKTEST_TRADES_KEY));

  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <BacktestTradeForm onLogged={refresh} />

          <BacktestTradesList trades={trades} onChange={refresh} />
        </div>
      </div>
    </AppShell>
  );
}
