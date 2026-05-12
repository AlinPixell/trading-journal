"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Edit3, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Trade } from "@/types/trade";
import { formatDollar } from "@/lib/utils";
import { formatFullTimestamp, plannedRiskReward } from "@/lib/tradeHelpers";
import { useTradeStore } from "@/store/useTradeStore";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/cn";

type TradeDetailsModalProps = {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
};

export function TradeDetailsModal({ trade, open, onClose, onDeleted }: TradeDetailsModalProps) {
  const router = useRouter();
  const deleteTrade = useTradeStore((s) => s.deleteTrade);
  const accountBalance = useTradeStore((s) => s.tradingSettings.accountBalance);
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);

  const isOpen = open && Boolean(trade);
  const t = trade;

  const rr = t ? plannedRiskReward(t) : null;
  const pct = t && accountBalance > 0 ? (t.pnl / accountBalance) * 100 : 0;

  const handleDelete = () => {
    if (!t) return;
    deleteTrade(t.id);
    onDeleted?.();
    onClose();
  };

  const handleEdit = () => {
    if (!t) return;
    router.push(`/edit/${encodeURIComponent(t.id)}`);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
      {t ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md" />
          <Dialog.Content asChild>
            <motion.div
              className={cn(
                "fixed left-1/2 top-1/2 z-50 max-h-[min(92vh,860px)] w-[min(96vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
                "rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-raised)_82%,transparent)] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8",
                "focus:outline-none"
              )}
              initial={animations ? { opacity: 0, scale: 0.96, y: 12 } : false}
              animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Dialog.Title className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                    {t.pair}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                    {t.title}
                  </Dialog.Description>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-sm border border-[var(--border-soft)] bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      {t.direction}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-md border border-[var(--border-soft)] bg-white/[0.05] p-2.5 text-[var(--text-primary)] transition hover:bg-white/[0.09]"
                    aria-label="Edit trade"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-md border border-[var(--border-soft)] bg-white/[0.05] p-2.5 text-[var(--text-primary)] transition hover:bg-white/[0.09]"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <Stat label="P/L" value={`${t.pnl >= 0 ? "+" : ""}${formatDollar(t.pnl)}`} highlight />
                <Stat label="R:R (planned)" value={rr != null ? `${rr.toFixed(2)} : 1` : "—"} />
                <Stat label="% on account" value={`${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`} />
              </div>

              <div className="mb-6 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Executed at</p>
                <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{formatFullTimestamp(t.createdAt)}</p>
              </div>

              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <Field label="Entry" value={t.entryPrice.toFixed(4)} />
                <Field label="Stop" value={t.stopPrice.toFixed(4)} />
                <Field label="Take profit" value={t.takeProfitPrice.toFixed(4)} />
                <Field label="TP hit" value={t.takeProfitHitPrice.toFixed(4)} />
              </div>

              {t.notes ? (
                <div className="mb-6 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Notes</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{t.notes}</p>
                </div>
              ) : null}

              <div className="mb-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Screenshots</p>
                {t.screenshots.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {t.screenshots.map((src, i) => (
                      <img key={i} src={src} alt="" className="max-h-64 w-full rounded-md border border-[var(--border-soft)] object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-[var(--border-soft)] py-12 text-center text-sm text-[var(--text-muted)]">No image attached</div>
                )}
              </div>

              <button
                type="button"
                onClick={handleDelete}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-red-400/25 bg-red-500/10 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/18"
              >
                <Trash2 className="h-4 w-4" />
                Delete trade
              </button>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-3",
        highlight && "ring-1 ring-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
