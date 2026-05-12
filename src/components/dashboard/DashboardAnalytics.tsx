"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useTradeStore } from "@/store/useTradeStore";
import {
  type AnalyticsPeriod,
  filterTradesByPeriod,
  computeDashboardMetrics,
  buildEquityCurve,
  dailyConsistencySeries,
  profitabilityHeatmap,
  profitableDaysStreak,
  winStreak,
} from "@/lib/analytics";
import { formatDollar } from "@/lib/utils";
import { cn } from "@/lib/cn";

const periods: { id: AnalyticsPeriod; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

function parseDayParam(key: string | null | undefined): Date | null {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type DashboardAnalyticsProps = {
  /** `yyyy-MM-dd` from URL — switches to daily period for that day */
  initialDayKey?: string | null;
};

export function DashboardAnalytics({ initialDayKey }: DashboardAnalyticsProps = {}) {
  const trades = useTradeStore((s) => s.trades);
  const tradingSettings = useTradeStore((s) => s.tradingSettings);
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [period, setPeriod] = useState<AnalyticsPeriod>("monthly");
  const [anchor, setAnchor] = useState(() => new Date());

  useEffect(() => {
    const d = parseDayParam(initialDayKey);
    if (!d) return;
    setPeriod("daily");
    setAnchor(d);
  }, [initialDayKey]);

  const filtered = useMemo(() => filterTradesByPeriod(trades, period, anchor), [trades, period, anchor]);
  const metrics = useMemo(() => computeDashboardMetrics(filtered), [filtered]);

  const lifetimePnl = useMemo(() => trades.reduce((s, t) => s + t.pnl, 0), [trades]);
  const target = tradingSettings.targetAmount;
  const progress = target > 0 ? Math.min(1, Math.max(0, lifetimePnl / target)) : 0;
  const remaining = target - lifetimePnl;
  const positive = lifetimePnl >= 0;

  const equity = useMemo(
    () => buildEquityCurve(filtered, tradingSettings.accountBalance, period, anchor),
    [filtered, tradingSettings.accountBalance, period, anchor]
  );

  const consistency = useMemo(
    () => dailyConsistencySeries(trades, period, anchor),
    [trades, period, anchor]
  );

  const year = anchor.getFullYear();
  const heatmap = useMemo(() => profitabilityHeatmap(trades, year), [trades, year]);

  const streakDays = useMemo(() => profitableDaysStreak(trades), [trades]);
  const streakWins = useMemo(() => winStreak(trades), [trades]);

  const miniSpark = equity.slice(-8);

  const chartColor = positive ? "var(--accent)" : "#f87171";
  const softFill = positive ? "url(#pnlGrad)" : "url(#lossGrad)";

  return (
    <div className="space-y-8 pb-24 pt-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Analytics</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Performance</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Live metrics, targets, and risk-adjusted context — updated instantly when your journal changes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={format(anchor, "yyyy-MM-dd")}
            onChange={(e) => setAnchor(new Date(e.target.value + "T12:00:00"))}
            className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
          <div className="inline-flex rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-1">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "rounded px-3 py-2 text-xs font-semibold transition",
                  period === p.id
                    ? "bg-white/[0.11] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-soft)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Target row */}
      <section className="grid gap-4 lg:grid-cols-3">
        <motion.div
          layout={animations}
          className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl lg:col-span-2"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Target progress</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {lifetimePnl >= 0 ? "+" : ""}
                {formatDollar(lifetimePnl)}
                <span className="text-base font-medium text-[var(--text-muted)]"> / {formatDollar(target)}</span>
              </p>
              <p className={cn("mt-2 text-sm", positive ? "text-emerald-300/90" : "text-red-300/90")}>
                {remaining > 0
                  ? `${formatDollar(remaining)} remaining to target`
                  : remaining <= 0
                    ? "Target exceeded"
                    : "Set a target in Settings"}
              </p>
            </div>
            <Ring value={progress} positive={positive} animations={animations} />
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-sm bg-white/[0.06]">
            <motion.div
              className={cn("h-full rounded-sm", positive ? "bg-[var(--accent)]" : "bg-red-400")}
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>
        </motion.div>
        <div className="grid gap-4">
          <FloatingCard
            title="Profitable days streak"
            value={String(streakDays)}
            hint="calendar days in the green"
            animations={animations}
          />
          <FloatingCard title="Win streak" value={String(streakWins)} hint="last consecutive wins" animations={animations} />
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Net P/L" value={`${metrics.netPnl >= 0 ? "+" : ""}${formatDollar(metrics.netPnl)}`} spark={miniSpark} dataKey="equity" animations={animations} />
        <Kpi title="Win rate" value={`${metrics.winrate.toFixed(1)}%`} animations={animations} />
        <Kpi title="Avg R:R" value={metrics.avgRR != null ? metrics.avgRR.toFixed(2) : "—"} animations={animations} />
        <Kpi title="Trades" value={`${metrics.totalTrades}`} sub={`${metrics.winningTrades}W / ${metrics.losingTrades}L`} animations={animations} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Equity path</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Cumulative balance ({period})</p>
          <div className="mt-4 h-64 w-full min-w-0 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="t" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} width={48} />
                <Tooltip
                  contentStyle={{
                    background: "#151515",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="equity" stroke={chartColor} fill={softFill} strokeWidth={2} animationDuration={animations ? 600 : 0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Daily consistency</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Rhythm</p>
          <div className="mt-4 h-64 w-full min-w-0 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistency}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} width={40} />
                <Tooltip
                  contentStyle={{
                    background: "#151515",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="pnl" radius={[8, 8, 0, 0]} animationDuration={animations ? 550 : 0}>
                  {consistency.map((e, i) => (
                    <Cell key={i} fill={e.pnl >= 0 ? "color-mix(in srgb,var(--accent) 70%, #34d399)" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Deep stats</p>
          <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
            <Row label="Total profit" value={formatDollar(metrics.totalProfit)} />
            <Row label="Total loss" value={formatDollar(metrics.totalLoss)} />
            <Row label="Avg daily profit" value={metrics.avgDailyProfit != null ? formatDollar(metrics.avgDailyProfit) : "—"} />
            <Row
              label="Best day"
              value={metrics.bestDay ? `${metrics.bestDay.key} (${formatDollar(metrics.bestDay.pnl)})` : "—"}
            />
            <Row
              label="Worst day"
              value={metrics.worstDay ? `${metrics.worstDay.key} (${formatDollar(metrics.worstDay.pnl)})` : "—"}
            />
          </ul>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Profitability heatmap
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{year}</p>
          <div className="mt-4 flex flex-wrap gap-1">
            {heatmap.map((c) => (
              <div
                key={c.key}
                title={`${c.key}: ${formatDollar(c.pnl)}`}
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  background:
                    c.pnl === 0
                      ? "rgba(255,255,255,0.04)"
                      : c.pnl > 0
                        ? `color-mix(in srgb, var(--accent) ${28 + c.intensity * 55}%, transparent)`
                        : `color-mix(in srgb, #f87171 ${22 + c.intensity * 50}%, transparent)`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-[var(--border)] border-dashed bg-[var(--bg-cell)] p-10 text-center text-sm text-[var(--text-muted)]">
        Daily target {formatDollar(tradingSettings.dailyTarget)} · Monthly {formatDollar(tradingSettings.monthlyTarget)}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] pb-3 last:border-0">
      <span>{label}</span>
      <span className="font-medium tabular-nums text-[var(--text-primary)]">{value}</span>
    </li>
  );
}

function Ring({ value, positive, animations }: { value: number; positive: boolean; animations: boolean }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value);
  return (
    <motion.div
      className="relative h-24 w-24"
      initial={animations ? { opacity: 0.6, scale: 0.94 } : false}
      animate={animations ? { opacity: 1, scale: 1 } : {}}
    >
      <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="48"
          cy="48"
          r={r}
          stroke={positive ? "var(--accent)" : "#f87171"}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[var(--text-primary)]">
        {Math.round(value * 100)}%
      </span>
    </motion.div>
  );
}

function FloatingCard({
  title,
  value,
  hint,
  animations,
}: {
  title: string;
  value: string;
  hint: string;
  animations: boolean;
}) {
  return (
    <motion.div
      layout={animations}
      className="rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-raised)_90%,transparent)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      whileHover={animations ? { y: -3 } : undefined}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{hint}</p>
    </motion.div>
  );
}

function Kpi({
  title,
  value,
  sub,
  spark,
  dataKey,
  animations,
}: {
  title: string;
  value: string;
  sub?: string;
  spark?: { t: string; equity: number }[];
  dataKey?: string;
  animations: boolean;
}) {
  return (
    <motion.div
      layout={animations}
      className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-5 backdrop-blur-xl"
      whileHover={animations ? { y: -2 } : undefined}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{title}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
      {sub ? <p className="mt-1 text-xs text-[var(--text-secondary)] ">{sub}</p> : null}
      {spark && spark.length > 1 && dataKey ? (
        <div className="mt-3 h-12 w-full min-h-[48px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey={dataKey} stroke="var(--accent)" strokeWidth={2} dot={false} animationDuration={animations ? 400 : 0} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </motion.div>
  );
}
