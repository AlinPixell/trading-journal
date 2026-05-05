"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Trade } from "@/types/trade";
import { formatMonthYear, formatDateKey, getCalendarDays, isDateInMonth, formatSelectedDate } from "@/lib/date";
import { getDateKey } from "@/lib/utils";
import CalendarDay from "./CalendarDay";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarProps {
  year: number;
  month: number;
  selectedDate: Date;
  trades: Trade[];
  onSelectDate: (date: Date) => void;
  onChangeMonth: (month: number, year: number) => void;
  onChangeYear: (year: number) => void;
}

export default function Calendar({ year, month, selectedDate, trades, onSelectDate, onChangeMonth, onChangeYear }: CalendarProps) {
  const days = getCalendarDays(year, month);
  const summaryByDate = trades.reduce<Record<string, { count: number; totalROI: number }>>((acc, trade) => {
    const key = getDateKey(trade.createdAt);
    const existing = acc[key] ?? { count: 0, totalROI: 0 };
    acc[key] = {
      count: existing.count + 1,
      totalROI: existing.totalROI + trade.netROI,
    };
    return acc;
  }, {});

  const handlePrevMonth = () => {
    const current = new Date(year, month, 1);
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    onChangeMonth(previous.getMonth(), previous.getFullYear());
  };

  const handleNextMonth = () => {
    const current = new Date(year, month, 1);
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    onChangeMonth(next.getMonth(), next.getFullYear());
  };

  const handlePrevYear = () => onChangeYear(year - 1);
  const handleNextYear = () => onChangeYear(year + 1);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <button type="button" onClick={handlePrevMonth} className="rounded-full p-2 text-slate-300 transition hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-white">{formatMonthYear(new Date(year, month, 1))}</span>
            <button type="button" onClick={handleNextMonth} className="rounded-full p-2 text-slate-300 transition hover:bg-white/10">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300">
            <button type="button" onClick={handlePrevYear} className="rounded-full p-2 transition hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium">{year}</span>
            <button type="button" onClick={handleNextYear} className="rounded-full p-2 transition hover:bg-white/10">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="inline-flex rounded-3xl border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          <span className="rounded-2xl bg-slate-900 px-3 py-2">Month</span>
          <span className="px-3 py-2">Year</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 text-center text-[11px] uppercase tracking-[0.24em] text-slate-500">
        {weekdays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-3">
        {days.map((date) => {
          const key = getDateKey(date);
          const summary = summaryByDate[key];
          return (
            <CalendarDay
              key={key}
              date={date}
              isCurrentMonth={isDateInMonth(date, month, year)}
              isSelected={formatDateKey(date) === formatDateKey(selectedDate)}
              summary={summary}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
    </section>
  );
}
