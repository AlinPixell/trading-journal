"use client";

import { useMemo } from "react";
import { TradesTable } from "@/components/trades/dashboard/TradesTable";
import { buildTradesDashboardModel } from "@/lib/tradesDashboardModel";
import { XAUUSD_BACKTEST_TRADES_KEY } from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";

export function BacktestTradesList({
  trades,
  onChange,
}: {
  trades: XauUsdTrade[];
  onChange: () => void;
}) {
  const { tableRows } = useMemo(() => buildTradesDashboardModel(trades), [trades]);

  return (
    <TradesTable
      variant="xauusd"
      rows={tableRows}
      xauUsdTrades={trades}
      onChange={onChange}
      storageKey={XAUUSD_BACKTEST_TRADES_KEY}
      headerEyebrow="Session log"
      headerTitle="Backtest trades"
      headerDescription="Tap a row for notes, screenshots, and more."
      emptyMessage="No backtest trades yet."
    />
  );
}
