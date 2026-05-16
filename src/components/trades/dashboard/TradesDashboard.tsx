"use client";

import { useMemo } from "react";
import { DailyResultsPanel } from "@/components/trades/dashboard/DailyResultsPanel";
import { EquityChart } from "@/components/trades/dashboard/EquityChart";
import { TradeStatsCards } from "@/components/trades/dashboard/TradeStatsCards";
import { TradesTable } from "@/components/trades/dashboard/TradesTable";
import { buildJournalTradesDashboardModel } from "@/lib/tradesDashboardModel";
import { selectActiveTrades, useTradeStore } from "@/store/useTradeStore";

export function TradesDashboard() {
  const trades = useTradeStore(selectActiveTrades);
  const model = useMemo(() => buildJournalTradesDashboardModel(trades), [trades]);

  return (
    <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Journal
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Trades
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Same trades you log from <span className="text-[var(--text-primary)]">New trade</span> and the
            calendar — updates as you add or remove rows.
          </p>
        </header>

        <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-5 backdrop-blur-xl sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6 lg:items-stretch lg:min-h-[min(420px,52vh)]">
            <div className="flex h-full min-h-0 lg:col-span-9">
              <EquityChart data={model.equitySeries} usesMock={model.usesMockCurve} className="h-full w-full" />
            </div>
            <div className="flex h-full min-h-0 lg:col-span-3">
              <DailyResultsPanel rows={model.dailyResults} className="h-full w-full" />
            </div>
          </div>
        </section>

        <TradeStatsCards stats={model.stats} />

        <TradesTable
          variant="journal"
          rows={model.tableRows}
          journalTrades={trades}
          headerEyebrow="Trade log"
          headerTitle="All positions"
          headerDescription="Tap a row for full details, screenshots, and edit. Remove deletes the journal entry."
          emptyMessage="No trades yet — use New trade in the sidebar or Calendar."
        />
      </div>
    </div>
  );
}
