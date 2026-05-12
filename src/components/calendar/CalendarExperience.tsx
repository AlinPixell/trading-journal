"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Trade } from "@/types/trade";
import type { CalendarViewMode } from "@/lib/calendarTypes";
import {
  formatMonthYear,
  getCalendarDays,
  isDateInMonth,
} from "@/lib/date";
import { getDateKey } from "@/lib/utils";
import { tradesForDateKey } from "@/lib/tradeHelpers";
import { useTradeStore } from "@/store/useTradeStore";
import { formatDollar } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { TradeEventChip } from "@/components/calendar/TradeEventChip";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function useFilteredTrades(trades: Trade[], q: string) {
  return useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return trades;
    return trades.filter((t) => t.pair.toLowerCase().includes(s) || t.title.toLowerCase().includes(s));
  }, [trades, q]);
}

type CalendarExperienceProps = {
  trades: Trade[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  /** Week view: chips open trade details */
  onOpenTrade?: (t: Trade) => void;
  /** Fires when the user switches day / week / month / year */
  onViewChange?: (mode: CalendarViewMode) => void;
};

export function CalendarExperience({
  trades,
  selectedDate,
  onSelectDate,
  onOpenTrade,
  onViewChange,
}: CalendarExperienceProps) {
  const calendarDefaultView = useTradeStore((s) => s.appSettings.calendarDefaultView);
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [view, setView] = useState<CalendarViewMode>("month");
  const [cursor, setCursor] = useState(selectedDate);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setView(calendarDefaultView);
  }, [calendarDefaultView]);

  useEffect(() => {
    setCursor(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    onViewChange?.(view);
  }, [view, onViewChange]);

  const filtered = useFilteredTrades(trades, search);

  const goToday = () => {
    const n = new Date();
    setCursor(n);
    onSelectDate(n);
  };

  const navigate = (dir: -1 | 1) => {
    const next =
      view === "day"
        ? addDays(cursor, dir)
        : view === "week"
          ? addWeeks(cursor, dir)
          : view === "month"
            ? addMonths(cursor, dir)
            : addYears(cursor, dir);
    setCursor(next);
    if (view === "day") onSelectDate(next);
  };

  const monthYearLabel =
    view === "year" ? format(cursor, "yyyy") : formatMonthYear(view === "day" ? cursor : startOfMonth(cursor));

  const viewButtons: { id: CalendarViewMode; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];

  const shell = "rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl";

  return (
    <section className={shell}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded p-2 text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <span className="min-w-[140px] px-2 text-center text-sm font-semibold tracking-tight text-[var(--text-primary)] sm:min-w-[200px]">
              {monthYearLabel}
            </span>
            <button
              type="button"
              onClick={() => navigate(1)}
              className="rounded p-2 text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="rounded-md border border-[var(--border-soft)] bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:text-[var(--text-primary)]"
          >
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol…"
              className="w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
            />
          </div>
          <div className="inline-flex rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-1">
            {viewButtons.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={cn(
                  "rounded px-3 py-2 text-xs font-semibold transition",
                  view === id
                    ? "bg-white/[0.1] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-soft)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${view}-${format(cursor, "yyyy-MM-dd")}`}
          initial={animations ? { opacity: 0, y: 8 } : false}
          animate={animations ? { opacity: 1, y: 0 } : {}}
          exit={animations ? { opacity: 0, y: -6 } : {}}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === "month" && (
            <MonthGrid
              cursor={cursor}
              trades={filtered}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              animations={animations}
            />
          )}
          {view === "week" && (
            <WeekColumns
              cursor={cursor}
              trades={filtered}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              onOpenTrade={onOpenTrade}
              animations={animations}
            />
          )}
          {view === "day" && <DayColumn day={cursor} trades={filtered} />}
          {view === "year" && (
            <YearOverview year={cursor.getFullYear()} trades={filtered} onSelectDate={onSelectDate} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function dayNetPnl(trades: Trade[], key: string) {
  return tradesForDateKey(trades, key).reduce((s, t) => s + t.pnl, 0);
}

function MonthGrid({
  cursor,
  trades,
  selectedDate,
  onSelectDate,
  animations,
}: {
  cursor: Date;
  trades: Trade[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  animations: boolean;
}) {
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const days = getCalendarDays(y, m);

  return (
    <>
      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {weekdays.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map((date) => {
          const key = getDateKey(date);
          const inMonth = isDateInMonth(date, m, y);
          const dayTrades = tradesForDateKey(trades, key);
          const n = dayTrades.length;
          const net = dayNetPnl(trades, key);
          const selected = isSameDay(date, selectedDate);
          const today = isToday(date);

          const glow =
            net > 0
              ? "shadow-[0_0_28px_-8px_rgba(52,211,153,0.35)]"
              : net < 0
                ? "shadow-[0_0_28px_-8px_rgba(248,113,113,0.32)]"
                : "";

          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => onSelectDate(date)}
              whileHover={animations ? { scale: 1.01 } : undefined}
              whileTap={animations ? { scale: 0.995 } : undefined}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              title="Select this day"
              className={cn(
                "flex min-h-[100px] flex-col rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-2.5 text-left transition-colors sm:min-h-[112px] sm:p-3",
                !inMonth && "opacity-40",
                selected && "ring-1 ring-[color-mix(in_srgb,var(--accent)_55%,transparent)]",
                today && "ring-1 ring-[var(--accent)]/35",
                glow
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-1">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm font-semibold",
                    today
                      ? "bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  )}
                >
                  {format(date, "d")}
                </span>
              </div>
              <div className="mt-auto flex flex-1 flex-col justify-end gap-0.5">
                {n === 0 ? (
                  <span className="text-[10px] text-[var(--text-muted)]">0 trades</span>
                ) : (
                  <>
                    <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                      {n} trade{n === 1 ? "" : "s"}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold tabular-nums sm:text-sm",
                        net > 0 ? "text-emerald-300/95" : net < 0 ? "text-red-300/90" : "text-[var(--text-muted)]"
                      )}
                    >
                      {net > 0 ? "+" : ""}
                      {formatDollar(net)}
                    </span>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

function WeekColumns({
  cursor,
  trades,
  selectedDate,
  onSelectDate,
  onOpenTrade,
  animations,
}: {
  cursor: Date;
  trades: Trade[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onOpenTrade?: (t: Trade) => void;
  animations: boolean;
}) {
  const start = startOfWeek(cursor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end: addDays(start, 6) });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-7 md:gap-2 lg:gap-2.5">
      {days.map((date) => {
        const key = getDateKey(date);
        const dayTrades = tradesForDateKey(trades, key).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const n = dayTrades.length;
        const net = dayNetPnl(trades, key);
        const selected = isSameDay(date, selectedDate);
        const today = isToday(date);
        const glow =
          net > 0
            ? "shadow-[0_0_18px_-10px_rgba(52,211,153,0.32)]"
            : net < 0
              ? "shadow-[0_0_18px_-10px_rgba(248,113,113,0.26)]"
              : "";

        return (
          <motion.div
            key={key}
            layout={animations}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "flex max-h-[368px] min-h-[208px] flex-col rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-3.5 py-3.5 text-left md:max-h-[408px] md:min-h-[236px]",
              selected && "ring-1 ring-[color-mix(in_srgb,var(--accent)_55%,transparent)]",
              today && "ring-1 ring-[var(--accent)]/35",
              glow
            )}
          >
            <button
              type="button"
              onClick={() => onSelectDate(date)}
              title="Select this day"
              className="mb-2 flex w-full shrink-0 items-baseline gap-2 rounded-sm px-0.5 py-0.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] sm:text-[11px]">
                {format(date, "EEE")}
              </span>
              <span className="text-base font-semibold tabular-nums text-[var(--text-primary)] sm:text-lg">
                {format(date, "d")}
              </span>
            </button>

            <div className="mb-2 shrink-0 border-b border-[var(--border-soft)]/60 pb-2">
              {n === 0 ? (
                <span className="text-[11px] text-[var(--text-muted)]">0 trades</span>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <span className="text-[11px] font-medium text-[var(--text-secondary)] sm:text-xs">
                    {n} trade{n === 1 ? "" : "s"}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums sm:text-sm",
                      net > 0 ? "text-emerald-300/95" : net < 0 ? "text-red-300/90" : "text-[var(--text-muted)]"
                    )}
                  >
                    {net > 0 ? "+" : ""}
                    {formatDollar(net)}
                  </span>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin]">
              {n === 0 ? null : (
                <ul className="flex flex-col gap-0.5">
                  {dayTrades.map((t) => (
                    <li key={t.id} className="min-w-0">
                      <TradeEventChip
                        trade={t}
                        hidePair
                        onClick={() => onOpenTrade?.(t)}
                        className="text-[9px] font-medium leading-snug"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function DayColumn({ day, trades }: { day: Date; trades: Trade[] }) {
  const key = getDateKey(day);
  const list = tradesForDateKey(trades, key);
  const n = list.length;
  const net = dayNetPnl(trades, key);

  return (
    <div
      className={cn(
        "rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-6",
        net > 0 && "shadow-[0_0_40px_-16px_rgba(52,211,153,0.35)]",
        net < 0 && "shadow-[0_0_40px_-16px_rgba(248,113,113,0.32)]"
      )}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {format(day, "EEEE, MMMM d")}
        </p>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {n === 0 ? "No trades" : `${n} trade${n === 1 ? "" : "s"}`}
        </p>
        <p
          className={cn(
            "mt-2 text-3xl font-semibold tracking-tight tabular-nums",
            net > 0 ? "text-emerald-300/95" : net < 0 ? "text-red-300/90" : "text-[var(--text-primary)]"
          )}
        >
          {net > 0 ? "+" : ""}
          {formatDollar(net)}
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Day total P/L</p>
      </div>
    </div>
  );
}

function YearOverview({
  year,
  trades,
  onSelectDate,
}: {
  year: number;
  trades: Trade[];
  onSelectDate: (d: Date) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 12 }, (_, m) => (
        <MiniMonth key={m} year={year} month={m} trades={trades} onSelectDate={onSelectDate} />
      ))}
    </div>
  );
}

function MiniMonth({
  year,
  month,
  trades,
  onSelectDate,
}: {
  year: number;
  month: number;
  trades: Trade[];
  onSelectDate: (d: Date) => void;
}) {
  const days = getCalendarDays(year, month);

  return (
    <div className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-4">
      <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        {format(new Date(year, month, 1), "MMMM")}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[var(--text-muted)]">
        {weekdays.map((d) => (
          <span key={d}>{d.slice(0, 1)}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const key = getDateKey(date);
          const inMonth = isDateInMonth(date, month, year);
          const dayTrades = tradesForDateKey(trades, key);
          const n = dayTrades.length;
          const net = dayNetPnl(trades, key);
          const bg =
            !inMonth
              ? "bg-transparent"
              : net > 0
                ? "bg-[color-mix(in_srgb,var(--profit)_22%,transparent)]"
                : net < 0
                  ? "bg-[color-mix(in_srgb,var(--loss)_22%,transparent)]"
                  : "bg-white/[0.04]";
          const title =
            inMonth && n > 0
              ? `${n} trade${n === 1 ? "" : "s"} · ${net > 0 ? "+" : ""}${formatDollar(net)}`
              : inMonth
                ? "0 trades · select day"
                : undefined;
          return (
            <button
              key={key + month}
              type="button"
              title={title}
              disabled={!inMonth}
              onClick={() => inMonth && onSelectDate(date)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-[var(--text-secondary)] disabled:pointer-events-none disabled:opacity-30",
                inMonth && "text-[10px] font-medium hover:bg-white/[0.06]",
                bg,
                isToday(date) && "ring-1 ring-[var(--accent)]/45"
              )}
            >
              <span>{format(date, "d")}</span>
              {inMonth && n > 0 ? (
                <span
                  className={cn(
                    "max-w-full truncate text-[8px] font-semibold tabular-nums leading-none",
                    net > 0 ? "text-emerald-300/90" : net < 0 ? "text-red-300/85" : "text-[var(--text-muted)]"
                  )}
                >
                  {n}·{net > 0 ? "+" : ""}
                  {formatDollar(net)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
