"use client";

import type { DailyResultRow } from "@/lib/tradesDashboardModel";
import { cn } from "@/lib/cn";
import { formatDollar } from "@/lib/utils";

type DailyResultsPanelProps = {
  rows: DailyResultRow[];
  className?: string;
};

const headerCellClass =
  "min-w-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]";
const rowCellClass = "min-w-0 text-[11px]";

export function DailyResultsPanel({ rows, className }: DailyResultsPanelProps) {
  const display = rows.slice(0, 10);

  return (
    <div
      className={cn(
        "flex h-full min-h-[280px] min-w-0 flex-col rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-4 sm:min-h-[300px] sm:p-5",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        Daily breakdown
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Last 10 sessions</p>

      <div className="mt-4 grid shrink-0 grid-cols-[minmax(0,1.15fr)_minmax(0,0.65fr)_minmax(0,1fr)_minmax(0,0.55fr)] gap-1 border-b border-[var(--border-soft)] pb-2">
        <span className={headerCellClass}>Date</span>
        <span className={cn(headerCellClass, "text-right")}>Trades</span>
        <span className={cn(headerCellClass, "text-right")}>Result</span>
        <span className={cn(headerCellClass, "text-right")}>%</span>
      </div>

      <div className="mt-1 flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
        {display.map((row) => (
          <div
            key={row.dateKey}
            className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.65fr)_minmax(0,1fr)_minmax(0,0.55fr)] items-center gap-1 border-b border-[var(--border-soft)] py-2.5 last:border-b-0"
          >
            <span className={cn(rowCellClass, "truncate text-[var(--text-secondary)]")}>
              {row.label}
            </span>
            <span className={cn(rowCellClass, "text-right tabular-nums text-[var(--text-muted)]")}>
              {row.trades}
            </span>
            <span
              className={cn(
                rowCellClass,
                "text-right tabular-nums font-medium",
                row.result > 0
                  ? "text-profit"
                  : row.result < 0
                    ? "text-red-300"
                    : "text-[var(--text-muted)]",
              )}
            >
              {row.result > 0 ? "+" : ""}
              {formatDollar(row.result)}
            </span>
            <span
              className={cn(
                rowCellClass,
                "text-right tabular-nums",
                row.percent > 0
                  ? "text-profit"
                  : row.percent < 0
                    ? "text-red-300"
                    : "text-[var(--text-muted)]",
              )}
            >
              {row.percent > 0 ? "+" : ""}
              {Math.round(row.percent)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
