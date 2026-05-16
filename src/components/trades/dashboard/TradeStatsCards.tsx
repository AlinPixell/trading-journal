"use client";

import { motion } from "framer-motion";
import { useTradeStore } from "@/store/useTradeStore";
import type { DashboardStats } from "@/lib/tradesDashboardModel";
import { formatDollar } from "@/lib/utils";

type TradeStatsCardsProps = {
  stats: DashboardStats;
};

export function TradeStatsCards({ stats }: TradeStatsCardsProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);

  const items = [
    {
      label: "Total PnL",
      value: formatDollar(stats.totalPnl),
      hint: "30d equity delta",
      positive: stats.totalPnl >= 0,
    },
    {
      label: "Win rate",
      value: stats.winRate != null ? `${stats.winRate.toFixed(1)}%` : "—",
      hint:
        stats.closedTrades > 0
          ? `${stats.closedTrades} closed`
          : stats.totalTrades > 0
            ? "Realize a trade to track"
            : "Log trades to track",
      positive: (stats.winRate ?? 0) >= 50,
    },
    {
      label: "Total trades",
      value: String(stats.totalTrades),
      hint: "All sessions",
      positive: true,
    },
    {
      label: "Best trade",
      value: stats.bestTrade != null ? formatDollar(stats.bestTrade) : "—",
      hint: "Largest win",
      positive: stats.bestTrade == null || stats.bestTrade >= 0,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          layout={animations}
          initial={animations ? { opacity: 0, y: 8 } : false}
          animate={animations ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: i * 0.04, type: "spring", stiffness: 320, damping: 30 }}
          whileHover={animations ? { y: -2 } : undefined}
          className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-5 backdrop-blur-xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {item.label}
          </p>
          <p
            className={`mt-2 text-xl font-semibold tabular-nums sm:text-2xl ${
              item.label === "Total PnL" || item.label === "Best trade"
                ? item.positive
                  ? "text-profit"
                  : "text-red-300"
                : item.label === "Win rate"
                  ? stats.winRate == null
                    ? "text-[var(--text-primary)]"
                    : item.positive
                      ? "text-profit"
                      : "text-amber-400"
                  : "text-[var(--text-primary)]"
            }`}
          >
            {item.value}
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.hint}</p>
        </motion.div>
      ))}
    </div>
  );
}
