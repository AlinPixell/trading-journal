"use client";

import { format } from "date-fns";
import type { Trade } from "@/types/trade";
import { formatDollar } from "@/lib/utils";
import { cn } from "@/lib/cn";

/** Plain text row: BUY green / SELL red, optional pair white, P/L blue if win else red */
export function TradeEventChip({
  trade,
  onClick,
  compact,
  hidePair,
  className,
}: {
  trade: Trade;
  onClick: () => void;
  /** Month / week grid: smaller type */
  compact?: boolean;
  /** Month / week: omit symbol (e.g. XAUUSD) */
  hidePair?: boolean;
  className?: string;
}) {
  const buy = trade.direction === "BUY";
  const pnlBlue = trade.pnl > 0;
  const pnlClass = pnlBlue
    ? "text-sky-400"
    : trade.pnl < 0
      ? "text-red-400"
      : "text-[var(--text-muted)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left tabular-nums tracking-tight transition-opacity hover:opacity-85 active:bg-[var(--fx-04)]",
        compact
          ? "truncate font-normal leading-none"
          : "rounded-md px-2 py-3 text-[10px] font-medium leading-snug sm:py-2 sm:text-[11px]",
        className
      )}
    >
      <span
        className={cn(
          buy ? "text-emerald-400" : "text-red-400",
          compact ? "text-[7px] sm:text-[8px]" : ""
        )}
      >
        {trade.direction}
      </span>
      {!hidePair ? (
        <span
          className={cn(
            "text-[var(--text-primary)]",
            compact ? "text-[7px] sm:text-[8px]" : ""
          )}
        >
          {" "}
          {trade.pair}{" "}
        </span>
      ) : (
        " "
      )}
      <span
        className={cn(
          pnlClass,
          compact ? "text-[7px] sm:text-[8px]" : ""
        )}
      >
        {trade.pnl >= 0 ? "+" : ""}
        {formatDollar(trade.pnl)}
      </span>
      <span
        className={cn(
          "text-[var(--text-muted)]",
          compact ? "text-[8px] sm:text-[9px]" : ""
        )}
      >
        {" · "}
        {format(new Date(trade.createdAt), compact ? "HH:mm" : "HH:mm:ss")}
      </span>
    </button>
  );
}
