"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarExperience } from "@/components/calendar/CalendarExperience";
import { TradeDetailsModal } from "@/components/trade/TradeDetailsModal";
import { useTradeStore } from "@/store/useTradeStore";
import { formatSelectedDate } from "@/lib/date";
import { formatDollar } from "@/lib/utils";
import type { Trade } from "@/types/trade";
import { tradesForDateKey } from "@/lib/tradeHelpers";
import { getDateKey } from "@/lib/utils";
import Link from "next/link";
import type { CalendarViewMode } from "@/lib/calendarTypes";
import { TradeEventChip } from "@/components/calendar/TradeEventChip";

export default function HomePage() {
  const trades = useTradeStore((s) => s.trades);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalTrade, setModalTrade] = useState<Trade | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarViewMode>("month");

  useEffect(() => {
    const n = new Date();
    setSelectedDate(n);
    setMounted(true);
  }, []);

  const dayTrades = useMemo(() => {
    if (!selectedDate) return [];
    return tradesForDateKey(trades, getDateKey(selectedDate)).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [selectedDate, trades]);

  const dayPnl = useMemo(() => dayTrades.reduce((s, t) => s + t.pnl, 0), [dayTrades]);

  if (!mounted || !selectedDate) {
    return (
      <AppShell>
        <div className="min-h-[60vh] px-6 py-16">
          <div className="mx-auto max-w-4xl animate-pulse space-y-4">
            <div className="h-10 w-48 rounded-md bg-white/[0.06]" />
            <div className="h-[480px] rounded-md bg-white/[0.04]" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-20 pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px] space-y-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Calendar</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                {formatSelectedDate(selectedDate)}
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Day total{" "}
                <span className={dayPnl >= 0 ? "text-emerald-300/95" : "text-red-300/90"}>
                  {dayPnl >= 0 ? "+" : ""}
                  {formatDollar(dayPnl)}
                </span>
                · {dayTrades.length} trade{dayTrades.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href="/new"
              className="self-start rounded-md border border-[var(--border-soft)] bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.08] lg:hidden"
            >
              New trade
            </Link>
          </header>

          <CalendarExperience
            trades={trades}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenTrade={(t) => setModalTrade(t)}
            onViewChange={setCalendarView}
          />

          {calendarView !== "week" ? (
          <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/80 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Selected day</h2>
              <Link href="/new" className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Log trade
              </Link>
            </div>
            {dayTrades.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--text-muted)]">No trades — keep the journal clean.</p>
            ) : (
              <ul className="space-y-1.5">
                {dayTrades.map((t) => (
                  <li key={t.id}>
                    <TradeEventChip trade={t} onClick={() => setModalTrade(t)} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          ) : null}
        </div>
      </div>

      <TradeDetailsModal
        trade={modalTrade}
        open={Boolean(modalTrade)}
        onClose={() => setModalTrade(null)}
        onDeleted={() => setModalTrade(null)}
      />
    </AppShell>
  );
}
