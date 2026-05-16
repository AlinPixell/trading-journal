"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";
import { loadTrades, saveTrades } from "@/lib/xauusdTradeStorage";
import type { TradeTableRow } from "@/lib/tradesDashboardModel";
import type { XauUsdTrade } from "@/types/xauusd";
import type { Trade } from "@/types/trade";
import { formatDollar } from "@/lib/utils";
import { XauUsdTradeDetailsModal } from "@/components/trades/dashboard/XauUsdTradeDetailsModal";
import { TradeDetailsModal } from "@/components/trade/TradeDetailsModal";

type HeaderProps = {
  headerEyebrow?: string;
  headerTitle?: string;
  headerDescription?: string;
  emptyMessage?: string;
};

type TradesTableXauUsdProps = HeaderProps & {
  variant: "xauusd";
  rows: TradeTableRow[];
  xauUsdTrades: XauUsdTrade[];
  storageKey: string;
  onChange: () => void;
};

type TradesTableJournalProps = HeaderProps & {
  variant: "journal";
  rows: TradeTableRow[];
  journalTrades: Trade[];
};

export type TradesTableProps = TradesTableXauUsdProps | TradesTableJournalProps;

export function TradesTable(props: TradesTableProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const deleteTrade = useTradeStore((s) => s.deleteTrade);
  const [detailId, setDetailId] = useState<string | null>(null);

  const {
    rows,
    headerEyebrow = "Trade log",
    headerTitle = "All positions",
    headerDescription = "Tap a row for notes, screenshots, and more.",
    emptyMessage = "No trades logged yet — add trades to see them here.",
  } = props;

  const detailXauUsd =
    props.variant === "xauusd" && detailId
      ? (props.xauUsdTrades.find((t) => t.id === detailId) ?? null)
      : null;

  const detailJournal =
    props.variant === "journal" && detailId
      ? (props.journalTrades.find((t) => t.id === detailId) ?? null)
      : null;

  const remove = (id: string) => {
    if (props.variant === "xauusd") {
      const next = loadTrades(props.storageKey).filter((t) => t.id !== id);
      saveTrades(props.storageKey, next);
      props.onChange();
    } else {
      deleteTrade(id);
      setDetailId((cur) => (cur === id ? null : cur));
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 backdrop-blur-xl">
        <div className="border-b border-[var(--border-soft)] px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {headerEyebrow}
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{headerTitle}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{headerDescription}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <th className="px-4 py-3 sm:px-6">Pair</th>
                <th className="px-4 py-3 sm:px-6">Side</th>
                <th className="px-4 py-3 sm:px-6">Entry</th>
                <th className="px-4 py-3 sm:px-6">Exit</th>
                <th className="px-4 py-3 sm:px-6">Stop loss</th>
                <th className="px-4 py-3 sm:px-6">Take profit</th>
                <th className="px-4 py-3 sm:px-6">PnL</th>
                <th className="px-4 py-3 sm:px-6">%</th>
                <th className="px-4 py-3 sm:px-6">Date</th>
                <th className="px-4 py-3 sm:px-6">Status</th>
                <th className="px-4 py-3 sm:px-6" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    initial={animations ? { opacity: 0 } : false}
                    animate={animations ? { opacity: 1 } : undefined}
                    transition={{ delay: Math.min(i * 0.02, 0.35) }}
                    onClick={() => setDetailId(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setDetailId(row.id);
                      }
                    }}
                    className="cursor-pointer border-b border-[var(--border-soft)] transition-colors hover:bg-[var(--fx-05)] focus-visible:bg-[var(--fx-05)] focus-visible:outline-none"
                  >
                    <td className="px-4 py-3.5 font-medium text-[var(--text-primary)] sm:px-6">
                      {row.pair}
                    </td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                          row.side === "BUY"
                            ? "border border-[color-mix(in_lab,var(--accent)_40%,transparent)] bg-[var(--fx-07)] text-[var(--text-primary)]"
                            : "border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-muted)]",
                        )}
                      >
                        {row.side}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[var(--text-primary)] sm:px-6">
                      {row.entry.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[var(--text-secondary)] sm:px-6">
                      {row.exit != null ? row.exit.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[var(--text-muted)] sm:px-6">
                      {row.stopLoss != null ? row.stopLoss.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-[var(--text-muted)] sm:px-6">
                      {row.takeProfit != null ? row.takeProfit.toFixed(2) : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 tabular-nums font-medium sm:px-6",
                        row.pnl == null
                          ? "text-[var(--text-muted)]"
                          : row.pnl > 0
                            ? "text-profit"
                            : row.pnl < 0
                              ? "text-red-300"
                              : "text-[var(--text-secondary)]",
                      )}
                    >
                      {row.pnl != null ? (
                        <>
                          {row.pnl > 0 ? "+" : ""}
                          {formatDollar(row.pnl)}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 tabular-nums sm:px-6",
                        row.percent == null
                          ? "text-[var(--text-muted)]"
                          : row.percent > 0
                            ? "text-profit"
                            : row.percent < 0
                              ? "text-red-300"
                              : "text-[var(--text-secondary)]",
                      )}
                    >
                      {row.percent != null ? `${row.percent > 0 ? "+" : ""}${row.percent.toFixed(2)}%` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--text-muted)] sm:px-6">{row.dateLabel}</td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          row.status === "OPEN" &&
                            "border border-[var(--border-soft)] bg-[var(--fx-06)] text-[var(--text-secondary)]",
                          row.status === "WIN" &&
                            "border border-[color-mix(in_lab,var(--profit)_55%,transparent)] bg-[var(--profit-soft)] text-profit",
                          row.status === "LOSS" &&
                            "border border-[color-mix(in_lab,var(--loss)_55%,transparent)] bg-[var(--loss-soft)] text-red-300",
                          row.status === "EVEN" &&
                            "border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-muted)]",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(row.id);
                        }}
                        className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] transition-colors hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {props.variant === "xauusd" ? (
        <XauUsdTradeDetailsModal
          trade={detailXauUsd}
          open={detailId != null && detailXauUsd != null}
          storageKey={props.storageKey}
          onClose={() => setDetailId(null)}
          onDeleted={() => {
            setDetailId(null);
            props.onChange();
          }}
        />
      ) : (
        <TradeDetailsModal
          trade={detailJournal}
          open={detailId != null && detailJournal != null}
          onClose={() => setDetailId(null)}
          onDeleted={() => setDetailId(null)}
        />
      )}
    </>
  );
}
