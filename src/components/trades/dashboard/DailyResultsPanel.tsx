"use client";

import type { DailyResultRow } from "@/lib/tradesDashboardModel";
import { cn } from "@/lib/cn";
import { formatDollar } from "@/lib/utils";

type DailyResultsPanelProps = {
  rows: DailyResultRow[];
  className?: string;
};

export function DailyResultsPanel({ rows, className }: DailyResultsPanelProps) {
  const display = rows.slice(0, 10);

  return (
    <div
      className={cn(
        "flex h-full min-h-[280px] flex-col rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-4 sm:min-h-[300px] sm:p-5",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        Daily breakdown
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Last 10 sessions</p>

      <div className="mt-4 flex shrink-0 border-b border-[var(--border-soft)] pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        <span className="w-[32%]">Date</span>
        <span className="w-[18%] text-right">Trades</span>
        <span className="w-[28%] text-right">Result</span>
        <span className="w-[22%] text-right">%</span>
      </div>

      <div className="mt-1 flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
        {display.map((row) => (
          <div
            key={row.dateKey}
            className="grid grid-cols-[32%_18%_28%_22%] items-center gap-1 border-b border-[var(--border-soft)] py-2.5 text-[11px] last:border-b-0"
          >
            <span className="truncate text-[var(--text-secondary)]">{row.label}</span>
            <span className="text-right tabular-nums text-[var(--text-muted)]">{row.trades}</span>
            <span
              className={`text-right tabular-nums font-medium ${
                row.result > 0
                  ? "text-profit"
                  : row.result < 0
                    ? "text-red-300"
                    : "text-[var(--text-muted)]"
              }`}
            >
              {row.result > 0 ? "+" : ""}
              {formatDollar(row.result, { maximumFractionDigits: 0 })}
            </span>
            <span
              className={`text-right tabular-nums ${
                row.percent > 0
                  ? "text-profit"
                  : row.percent < 0
                    ? "text-red-300"
                    : "text-[var(--text-muted)]"
              }`}
            >
              {row.percent > 0 ? "+" : ""}
              {row.percent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
