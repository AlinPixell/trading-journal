"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";
import {
  computeTradePnlUsd,
  loadTrades,
  saveTrades,
  XAUUSD_TRADES_KEY,
} from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";
import { DEFAULT_PAIR } from "@/lib/tradesDashboardModel";
import { formatDollar } from "@/lib/utils";

type XauUsdTradeDetailsModalProps = {
  trade: XauUsdTrade | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  storageKey?: string;
};

function tradePct(trade: XauUsdTrade): number | null {
  const pnl = computeTradePnlUsd(trade);
  if (pnl == null) return null;
  const denom = Math.abs(trade.entryPrice * trade.lots * 100);
  if (denom < 1e-6) return null;
  return (pnl / denom) * 100;
}

export function XauUsdTradeDetailsModal({
  trade,
  open,
  onClose,
  onDeleted,
  storageKey = XAUUSD_TRADES_KEY,
}: XauUsdTradeDetailsModalProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const isOpen = open && Boolean(trade);
  const t = trade;

  const pnl = t ? computeTradePnlUsd(t) : null;
  const pct = t ? tradePct(t) : null;

  const handleDelete = () => {
    if (!t) return;
    const next = loadTrades(storageKey).filter((x) => x.id !== t.id);
    saveTrades(storageKey, next);
    onDeleted?.();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
      {t ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
          <Dialog.Content asChild>
            <motion.div
              className={cn(
                "fixed z-50 overflow-y-auto bg-[color-mix(in_srgb,var(--bg-raised)_82%,transparent)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl focus:outline-none",
                "bottom-0 left-0 right-0 top-auto max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-16px))] w-full translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-x-0 border-b-0 border-t border-[var(--border)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
                "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(92vh,720px)] sm:w-[min(96vw,480px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md sm:border sm:border-[var(--border)] sm:p-6 sm:pb-6",
              )}
              initial={animations ? { opacity: 0, scale: 0.96, y: 12 } : false}
              animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Dialog.Title className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                    {DEFAULT_PAIR}
                    {t.backtest ? (
                      <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">· Backtest</span>
                    ) : null}
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Trade details including prices, size, and notes.
                  </Dialog.Description>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                        t.direction === "BUY"
                          ? "border border-[color-mix(in_lab,var(--accent)_40%,transparent)] bg-[var(--fx-07)] text-[var(--text-primary)]"
                          : "border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-muted)]",
                      )}
                    >
                      {t.direction}
                    </span>
                    <span className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      {pnl == null ? "OPEN" : pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "EVEN"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-red-400/25 bg-red-500/10 text-red-200 transition hover:bg-red-500/18 sm:min-h-0 sm:min-w-0 sm:p-2.5"
                    aria-label="Delete trade"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)] sm:min-h-0 sm:min-w-0 sm:p-2.5"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Entry
                  </dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[var(--text-primary)]">
                    {t.entryPrice.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Exit
                  </dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[var(--text-secondary)]">
                    {t.exitPrice != null && Number.isFinite(t.exitPrice) ? t.exitPrice.toFixed(2) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Lot size
                  </dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[var(--text-primary)]">{t.lots}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Date
                  </dt>
                  <dd className="mt-0.5 text-[var(--text-secondary)]">
                    {new Date(t.tradedAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Stop loss
                  </dt>
                  <dd className="mt-0.5 tabular-nums text-[var(--text-secondary)]">
                    {t.stopLoss != null ? t.stopLoss.toFixed(2) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Take profit
                  </dt>
                  <dd className="mt-0.5 tabular-nums text-[var(--text-secondary)]">
                    {t.takeProfit != null ? t.takeProfit.toFixed(2) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    PnL
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 font-semibold tabular-nums",
                      pnl == null
                        ? "text-[var(--text-muted)]"
                        : pnl > 0
                          ? "text-profit"
                          : pnl < 0
                            ? "text-red-300"
                            : "text-[var(--text-secondary)]",
                    )}
                  >
                    {pnl != null ? (
                      <>
                        {pnl > 0 ? "+" : ""}
                        {formatDollar(pnl)}
                      </>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    %
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 font-semibold tabular-nums",
                      pct == null
                        ? "text-[var(--text-muted)]"
                        : pct > 0
                          ? "text-profit"
                          : pct < 0
                            ? "text-red-300"
                            : "text-[var(--text-secondary)]",
                    )}
                  >
                    {pct != null ? `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%` : "—"}
                  </dd>
                </div>
              </dl>

              {t.notes.trim() ? (
                <div className="mt-5 border-t border-[var(--border-soft)] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                    {t.notes}
                  </p>
                </div>
              ) : null}

              {t.screenshot ? (
                <div className="mt-5 border-t border-[var(--border-soft)] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Screenshot
                  </p>
                  <div className="mt-3 overflow-hidden rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)]">
                    <img
                      src={t.screenshot}
                      alt="Trade screenshot"
                      className="max-h-[50vh] w-full object-contain object-center sm:max-h-[360px]"
                    />
                  </div>
                </div>
              ) : null}

              <p className="mt-6 text-center text-[11px] text-[var(--text-muted)]">
                Tap outside or close to dismiss ·{" "}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="font-semibold text-red-300 underline-offset-2 hover:underline"
                >
                  Remove trade
                </button>
              </p>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
