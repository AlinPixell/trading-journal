"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Trade } from "@/types/trade";
import type { CalendarViewMode } from "@/lib/calendarTypes";
import {
  formatMonthYear,
  getCalendarWeekRows,
  isDateInMonth,
} from "@/lib/date";
import { getDateKey } from "@/lib/utils";
import { tradesForDateKey } from "@/lib/tradeHelpers";
import { useTradeStore } from "@/store/useTradeStore";
import { formatDollar } from "@/lib/utils";
import { cn } from "@/lib/cn";

const weekdaysMonFri = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const weekdaysMonFriShort = ["Mo", "Tu", "We", "Th", "Fr"];

function useFilteredTrades(trades: Trade[], q: string) {
  return useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return trades;
    return trades.filter(
      (t) =>
        t.pair.toLowerCase().includes(s) || t.title.toLowerCase().includes(s),
    );
  }, [trades, q]);
}

type CalendarExperienceProps = {
  trades: Trade[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  /** Fires when the user switches day / month */
  onViewChange?: (mode: CalendarViewMode) => void;
};

function dayNetPnl(trades: Trade[], key: string) {
  return tradesForDateKey(trades, key).reduce((s, t) => s + t.pnl, 0);
}

export function CalendarExperience({
  trades,
  selectedDate,
  onSelectDate,
  onViewChange,
}: CalendarExperienceProps) {
  const calendarDefaultView = useTradeStore(
    (s) => s.appSettings.calendarDefaultView,
  );
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

  const displayPnl = useMemo(() => {
    if (view === "day") {
      return dayNetPnl(filtered, getDateKey(cursor));
    }
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}`;
    return filtered
      .filter((t) => getDateKey(t.createdAt).startsWith(prefix))
      .reduce((s, t) => s + t.pnl, 0);
  }, [filtered, view, cursor]);

  const displayPnlLabel = view === "day" ? "Day total" : "Month total";

  const goToday = () => {
    const n = new Date();
    setCursor(n);
    onSelectDate(n);
  };

  const navigate = (dir: -1 | 1) => {
    const next = view === "day" ? addDays(cursor, dir) : addMonths(cursor, dir);
    setCursor(next);
    if (view === "day") onSelectDate(next);
  };

  const monthYearLabel = formatMonthYear(
    view === "day" ? cursor : startOfMonth(cursor),
  );

  const viewButtons: { id: CalendarViewMode; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "month", label: "Month" },
  ];

  const shell =
    "rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-4 backdrop-blur-xl sm:p-6";

  return (
    <section className={shell}>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="inline-flex min-w-0 flex-1 items-center gap-0.5 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-0.5 sm:flex-none sm:gap-1 sm:p-1"
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded text-[var(--text-secondary)] transition hover:bg-[var(--fx-06)] hover:text-[var(--text-primary)] sm:min-h-10 sm:min-w-10"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
              </button>
              <span
                className="min-w-0 flex-1 truncate px-1 text-center text-xs font-semibold tracking-tight text-[var(--text-primary)] sm:min-w-[140px] sm:flex-none sm:px-2 sm:text-sm lg:min-w-[200px]"
              >
                {monthYearLabel}
              </span>
              <button
                type="button"
                onClick={() => navigate(1)}
                className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded text-[var(--text-secondary)] transition hover:bg-[var(--fx-06)] hover:text-[var(--text-primary)] sm:min-h-10 sm:min-w-10"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
              </button>
            </div>
            <button
              type="button"
              onClick={goToday}
              className="shrink-0 rounded-md border border-[var(--border-soft)] bg-[var(--fx-04)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:text-[var(--text-primary)] sm:px-2.5"
            >
              Today
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 sm:hidden">
            <div className="inline-flex rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-0.5">
              {viewButtons.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  className={cn(
                    "min-h-9 rounded px-3 py-1.5 text-[11px] font-semibold transition",
                    view === id
                      ? "bg-[var(--fx-10)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-soft)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {displayPnlLabel}
              </p>
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums tracking-tight",
                  displayPnl > 0
                    ? "text-profit/95"
                    : displayPnl < 0
                      ? "text-red-300/90"
                      : "text-[var(--text-primary)]",
                )}
              >
                {formatDollar(displayPnl)}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 items-center gap-3 sm:flex sm:flex-wrap">
          <div className="relative min-w-0 flex-1 sm:min-w-[200px] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol…"
              className="w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
            />
          </div>
          <div className="inline-flex shrink-0 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-1">
            {viewButtons.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={cn(
                  "rounded px-3 py-2 text-xs font-semibold transition",
                  view === id
                    ? "bg-[var(--fx-10)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-soft)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
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
              onSelectDate={(d) => {
                setCursor(d);
                onSelectDate(d);
                setView("day");
              }}
              animations={animations}
            />
          )}
          {view === "day" && <DayColumn day={cursor} trades={filtered} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
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
  const weekRows = getCalendarWeekRows(y, m);

  return (
    <>
      <div className="mb-2 grid grid-cols-5 gap-1 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] sm:mb-3 sm:gap-2 sm:text-[10px] sm:tracking-[0.2em]">
        {weekdaysMonFri.map((d, i) => (
          <div key={d} className="py-1.5 sm:py-2">
            <span className="sm:hidden">{weekdaysMonFriShort[i]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {weekRows.map((week, wi) => (
          <div key={wi} className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3">
            {week.slice(0, 5).map((date) => {
              const key = getDateKey(date);
              const inMonth = isDateInMonth(date, m, y);
              const dayTrades = tradesForDateKey(trades, key);
              const n = dayTrades.length;
              const net = dayNetPnl(trades, key);
              const selected = isSameDay(date, selectedDate);
              const today = isToday(date);

              const glow =
                net > 0
                  ? "shadow-[0_0_28px_-8px_var(--profit-glow)]"
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
                    "flex min-h-[76px] flex-col rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-2 text-left transition-colors sm:min-h-[96px] sm:p-2.5 md:min-h-[110px] md:p-3",
                    !inMonth && "opacity-40",
                    selected &&
                      "ring-1 ring-[color-mix(in_srgb,var(--accent)_55%,transparent)]",
                    today && "ring-1 ring-[var(--accent)]/35",
                    glow,
                  )}
                >
                  <div className="mb-1 flex items-start justify-between gap-0.5 sm:mb-2 sm:gap-1">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm font-semibold sm:h-9 sm:w-9",
                        today
                          ? "bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)]",
                      )}
                    >
                      {format(date, "d")}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-1 flex-col justify-end gap-0.5">
                    {n === 0 ? (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        0 trades
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                          {n} trade{n === 1 ? "" : "s"}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold tabular-nums leading-tight sm:text-sm",
                            net > 0
                              ? "text-profit/95"
                              : net < 0
                                ? "text-red-300/90"
                                : "text-[var(--text-muted)]",
                          )}
                        >
                          {formatDollar(net)}
                        </span>
                      </>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </>
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
        net > 0 && "shadow-[0_0_40px_-16px_var(--profit-glow)]",
        net < 0 && "shadow-[0_0_40px_-16px_rgba(248,113,113,0.32)]",
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
            net > 0
              ? "text-profit/95"
              : net < 0
                ? "text-red-300/90"
                : "text-[var(--text-primary)]",
          )}
        >
          {formatDollar(net)}
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Day total P/L</p>
      </div>
    </div>
  );
}
