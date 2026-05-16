import type { TradeStatus } from "@/types/trade";

const statusMap: Record<TradeStatus, { label: string; className: string }> = {
  win: {
    label: "Win",
    className: "bg-profit/10 text-profit ring-1 ring-profit/20",
  },
  loss: {
    label: "Loss",
    className: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20",
  },
  breakeven: {
    label: "Break-even",
    className:
      "bg-[var(--fx-07)] text-[var(--text-secondary)] ring-1 ring-[var(--border-soft)]",
  },
};

export default function StatusBadge({ status }: { status: TradeStatus }) {
  const info = statusMap[status];
  return (
    <span
      className={`inline-flex rounded-sm px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${info.className}`}
    >
      {info.label}
    </span>
  );
}
