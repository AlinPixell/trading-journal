"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Calendar from "@/components/Calendar";
import TradeTable from "@/components/TradeTable";
import TradeDrawer from "@/components/TradeDrawer";
import { useTradeStore } from "@/store/useTradeStore";
import { formatSelectedDate } from "@/lib/date";

export default function Home() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<number | null>(null);
  const [calendarYear, setCalendarYear] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
    setCalendarMonth(now.getMonth());
    setCalendarYear(now.getFullYear());
    setIsMounted(true);
  }, []);
  const [drawerTradeId, setDrawerTradeId] = useState<string | null>(null);

  const getTradesByDate = useTradeStore((state) => state.getTradesByDate);
  const getTradesByMonth = useTradeStore((state) => state.getTradesByMonth);
  const deleteTrade = useTradeStore((state) => state.deleteTrade);
  const getTradeById = useTradeStore((state) => state.getTradeById);

  const monthTrades = useMemo(() => {
    if (calendarYear === null || calendarMonth === null) return [];
    return getTradesByMonth(calendarYear, calendarMonth);
  }, [calendarYear, calendarMonth, getTradesByMonth]);
  const selectedTrades = useMemo(() => {
    if (!selectedDate) return [];
    return getTradesByDate(selectedDate.toISOString());
  }, [getTradesByDate, selectedDate]);
  const selectedTrade = drawerTradeId ? getTradeById(drawerTradeId) ?? null : null;
  const monthlyPnl = useMemo(() => monthTrades.reduce((sum, trade) => sum + trade.netROI, 0), [monthTrades]);
  const totalTrades = monthTrades.length;
  const winRate = useMemo(() => {
    if (totalTrades === 0) return 0;
    return Math.round((monthTrades.filter((trade) => trade.status === "win").length / totalTrades) * 100);
  }, [monthTrades, totalTrades]);

  if (!isMounted || !selectedDate || calendarYear === null || calendarMonth === null) {
    return null;
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setCalendarMonth(date.getMonth());
    setCalendarYear(date.getFullYear());
  };

  const handleMonthChange = (month: number, year: number) => {
    setCalendarMonth(month);
    setCalendarYear(year);
  };

  const handleYearChange = (year: number) => setCalendarYear(year);

  const handleView = (trade: any) => setDrawerTradeId(trade.id);
  const handleEdit = (trade: any) => router.push(`/edit/${trade.id}`);
  const handleDelete = (trade: any) => {
    deleteTrade(trade.id);
    if (drawerTradeId === trade.id) {
      setDrawerTradeId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <Header selectedDate={formatSelectedDate(selectedDate)} />
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        <div className="mb-8 space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Trader dashboard</p>
                <h1 className="mt-3 text-4xl font-semibold text-white">Your trading dashboard</h1>
                <p className="mt-2 text-sm leading-6 text-slate-400">A calendar-based journal with quick access to performance metrics, personal context, and screenshot-backed trade review.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/new")}
                  className="rounded-3xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  New trade
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/new")}
                  className="rounded-3xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  New trade
                </button>
              </div>
            </div>
            <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Month P/L</p>
                <p className="mt-3 text-2xl font-semibold text-white">{monthlyPnl >= 0 ? "+" : ""}{monthlyPnl.toFixed(1)}%</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trades</p>
                <p className="mt-3 text-2xl font-semibold text-white">{totalTrades}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Win rate</p>
                <p className="mt-3 text-2xl font-semibold text-white">{winRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <Calendar
          year={calendarYear}
          month={calendarMonth}
          selectedDate={selectedDate}
          trades={monthTrades}
          onSelectDate={handleSelectDate}
          onChangeMonth={handleMonthChange}
          onChangeYear={handleYearChange}
        />

        <section className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Trade list</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Trades for {formatSelectedDate(selectedDate)}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>{selectedTrades.length} trade{selectedTrades.length === 1 ? "" : "s"} found</span>
              <button
                type="button"
                onClick={() => router.push("/new")}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                Add trade
              </button>
            </div>
          </div>

          <TradeTable trades={selectedTrades} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        </section>
      </main>

      <TradeDrawer
        trade={selectedTrade}
        open={Boolean(selectedTrade)}
        onClose={() => setDrawerTradeId(null)}
        onEdit={() => selectedTrade && handleEdit(selectedTrade)}
        onDelete={() => selectedTrade && handleDelete(selectedTrade)}
      />
    </div>
  );
}
