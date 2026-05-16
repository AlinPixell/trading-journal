"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import {
  selectActiveProfile,
  selectActiveTrades,
  selectActiveTradingSettings,
  useTradeStore,
} from "@/store/useTradeStore";
import {
  type AnalyticsPeriod,
  filterTradesByPeriod,
  computeDashboardMetrics,
  buildEquityCurve,
  dailyConsistencySeries,
  profitabilityHeatmap,
  profitableDaysStreak,
  periodTargetAmount,
  periodTradingDayCount,
} from "@/lib/analytics";
import { formatDollarWhole } from "@/lib/utils";
import { cn } from "@/lib/cn";

const periods: { id: AnalyticsPeriod; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const dashboardMainChartFrameClass = "mt-4 h-54 min-h-54 w-full min-w-0";

function parseDayParam(key: string | null | undefined): Date | null {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type DashboardAnalyticsProps = {
  /** `yyyy-MM-dd` from URL — switches to daily period for that day */
  initialDayKey?: string | null;
};

export function DashboardAnalytics({
  initialDayKey,
}: DashboardAnalyticsProps = {}) {
  const trades = useTradeStore(selectActiveTrades);
  const tradingSettings = useTradeStore(selectActiveTradingSettings);
  const profileName = useTradeStore((s) => selectActiveProfile(s).name);
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [period, setPeriod] = useState<AnalyticsPeriod>("monthly");
  const [anchor, setAnchor] = useState(() => new Date());

  useEffect(() => {
    const d = parseDayParam(initialDayKey);
    if (!d) return;
    setPeriod("daily");
    setAnchor(d);
  }, [initialDayKey]);

  const filtered = useMemo(
    () => filterTradesByPeriod(trades, period, anchor),
    [trades, period, anchor],
  );
  const metrics = useMemo(() => computeDashboardMetrics(filtered), [filtered]);

  const periodPnl = metrics.netPnl;
  const periodTarget = useMemo(
    () => periodTargetAmount(period, tradingSettings, anchor),
    [period, tradingSettings, anchor],
  );
  const progress =
    periodTarget > 0
      ? Math.min(1, Math.max(0, periodPnl / periodTarget))
      : 0;
  const remaining = periodTarget - periodPnl;
  const positive = periodPnl >= 0;

  const equity = useMemo(
    () =>
      buildEquityCurve(
        filtered,
        tradingSettings.accountBalance,
        period,
        anchor,
      ),
    [filtered, tradingSettings.accountBalance, period, anchor],
  );

  const consistency = useMemo(
    () => dailyConsistencySeries(trades, period, anchor),
    [trades, period, anchor],
  );

  const year = anchor.getFullYear();
  const heatmap = useMemo(
    () => profitabilityHeatmap(trades, year),
    [trades, year],
  );

  const streakDays = useMemo(() => profitableDaysStreak(trades), [trades]);

  const dailyTarget = tradingSettings.dailyTarget;
  const tradingDayCount = useMemo(
    () => periodTradingDayCount(period, anchor),
    [period, anchor],
  );

  const dailyGoalKpi = useMemo(() => {
    if (dailyTarget <= 0) {
      return {
        value: "—",
        sub: "Set daily target in profile trading settings",
      };
    }
    const goalTotal = dailyTarget * tradingDayCount;
    const actual = metrics.netPnl;
    const value = formatDollarWhole(goalTotal);

    if (actual >= goalTotal - 1e-6) {
      const over = Math.max(0, actual - goalTotal);
      const sub = (
        <p className="mt-1 text-xs font-medium text-profit/90">
          Over {formatDollarWhole(over)}
        </p>
      );
      return { value, sub };
    }

    const left = goalTotal - actual;
    const sub = (
      <p className="mt-1 text-xs font-medium text-red-300/90">
        Left {formatDollarWhole(left)}
      </p>
    );
    return { value, sub };
  }, [dailyTarget, tradingDayCount, metrics.netPnl]);

  const periodLabel = periods.find((p) => p.id === period)?.label ?? "Period";
  const goalKpiTitle = `${periodLabel} goal`;

  const chartColor = positive ? "var(--accent)" : "#f87171";
  const softFill = positive ? "url(#pnlGrad)" : "url(#lossGrad)";

  return (
    <div className="space-y-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Analytics
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Performance
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Live metrics, targets, and risk-adjusted context — updated instantly
            when your journal changes.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="date"
            value={format(anchor, "yyyy-MM-dd")}
            onChange={(e) => setAnchor(new Date(e.target.value + "T12:00:00"))}
            className="min-h-11 w-full min-w-0 rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-base text-[var(--text-primary)] sm:min-h-0 sm:w-auto sm:max-w-[13rem] sm:text-sm"
          />
          <div className="-mx-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex shrink-0 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-1">
              {periods.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={cn(
                    "min-h-10 rounded px-3 py-2 text-xs font-semibold transition sm:min-h-0",
                    period === p.id
                      ? "bg-[var(--fx-11)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-soft)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Target row: equal-height columns on large screens */}
      <section className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
        <motion.div
          layout={animations}
          className="flex h-full min-h-0 flex-col rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-5 backdrop-blur-xl sm:p-6 lg:col-span-9 lg:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                {periodLabel} target progress
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums sm:text-3xl lg:text-4xl">
                <span className="tabular-nums text-white">
                  {formatDollarWhole(periodPnl, { unsigned: true })}
                </span>
                <span className="text-base font-medium sm:text-lg lg:text-xl">
                  <span className="text-[var(--text-muted)]"> / </span>
                  <span className="tabular-nums text-[var(--text-muted)]">
                    {periodTarget > 0
                      ? formatDollarWhole(periodTarget)
                      : "—"}
                  </span>
                </span>
              </p>
              <p
                className={cn(
                  "mt-2 text-sm sm:text-base",
                  periodTarget <= 0
                    ? "text-[var(--text-muted)]"
                    : remaining > 0
                      ? null
                      : positive
                        ? "text-profit/90"
                        : "text-red-300/90",
                )}
              >
                {periodTarget <= 0 ? (
                  "Set targets in profile trading settings"
                ) : remaining > 0 ? (
                  <>
                    <span className="text-white tabular-nums">
                      {formatDollarWhole(remaining, { unsigned: true })}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {" "}
                      remaining to {periodLabel.toLowerCase()} target
                    </span>
                  </>
                ) : (
                  "Target exceeded"
                )}
              </p>
            </div>
            <div className="flex shrink-0 self-center sm:self-start">
              <Ring
                value={progress}
                positive={positive}
                animations={animations}
              />
            </div>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-sm bg-[var(--fx-06)] lg:mt-7 lg:h-3.5">
            <motion.div
              className={cn(
                "h-full rounded-sm",
                positive ? "bg-[var(--accent)]" : "bg-red-400",
              )}
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:justify-start">
            <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Active profile
            </p>
            <span
              className="inline-flex max-w-full min-w-0 items-center truncate rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]"
              title="Active journal profile"
            >
              {profileName}
            </span>
          </div>
        </motion.div>
        <div className="flex h-full min-h-0 flex-col lg:col-span-3 lg:min-w-0">
          <PeriodSnapshotCard
            animations={animations}
            totalTrades={metrics.totalTrades}
            winningTrades={metrics.winningTrades}
            losingTrades={metrics.losingTrades}
            netPnl={metrics.netPnl}
          />
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          title={goalKpiTitle}
          value={dailyGoalKpi.value}
          sub={dailyGoalKpi.sub}
          animations={animations}
        />
        <Kpi
          title="Win rate"
          value={`${Math.round(metrics.winrate)}%`}
          animations={animations}
        />
        <Kpi
          title="Avg R:R"
          value={metrics.avgRR != null ? `${Math.round(metrics.avgRR)}` : "—"}
          animations={animations}
        />
        <Kpi
          title="Profitable days streak"
          value={String(streakDays)}
          sub="calendar days in the green"
          animations={animations}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Equity path
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            Cumulative balance ({period})
          </p>
          <div className={dashboardMainChartFrameClass}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--accent)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="t"
                  stroke="var(--chart-axis)"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="var(--chart-axis)"
                  tick={{ fontSize: 10 }}
                  width={40}
                  tickFormatter={(v) => formatDollarWhole(Number(v), { unsigned: true })}
                />
                <Tooltip
                  formatter={(value) => [
                    formatDollarWhole(Number(value ?? 0), { unsigned: true }),
                    "Balance",
                  ]}
                  contentStyle={{
                    background: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke={chartColor}
                  fill={softFill}
                  strokeWidth={2}
                  animationDuration={animations ? 600 : 0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Daily consistency
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            Rhythm
          </p>
          <div className={dashboardMainChartFrameClass}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistency}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--chart-axis)"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="var(--chart-axis)"
                  tick={{ fontSize: 10 }}
                  width={36}
                  tickFormatter={(v) => formatDollarWhole(Number(v), { unsigned: true })}
                />
                <Tooltip
                  formatter={(value) => [
                    formatDollarWhole(Number(value ?? 0), { unsigned: true }),
                    "P/L",
                  ]}
                  contentStyle={{
                    background: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                />
                <Bar
                  dataKey="pnl"
                  radius={[8, 8, 0, 0]}
                  animationDuration={animations ? 550 : 0}
                >
                  {consistency.map((e, i) => (
                    <Cell
                      key={i}
                      fill={
                        e.pnl >= 0
                          ? "color-mix(in lab,var(--accent) 70%, var(--profit))"
                          : "#f87171"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Deep stats
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
            <Row
              label="Total profit"
              value={formatDollarWhole(metrics.totalProfit)}
            />
            <Row
              label="Total loss"
              value={formatDollarWhole(metrics.totalLoss)}
            />
            <Row
              label="Avg daily profit"
              value={
                metrics.avgDailyProfit != null ? (
                  <span
                    className={cn(
                      metrics.avgDailyProfit > 0
                        ? "text-profit/95"
                        : metrics.avgDailyProfit < 0
                          ? "text-red-300/90"
                          : "text-[var(--text-primary)]",
                    )}
                  >
                    {formatDollarWhole(metrics.avgDailyProfit, {
                      unsigned: true,
                    })}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Best day"
              value={
                metrics.bestDay ? (
                  <>
                    {metrics.bestDay.key} (
                    <span
                      className={cn(
                        metrics.bestDay.pnl > 0
                          ? "text-profit/95"
                          : metrics.bestDay.pnl < 0
                            ? "text-red-300/90"
                            : "text-[var(--text-primary)]",
                      )}
                    >
                      {formatDollarWhole(metrics.bestDay.pnl, {
                        unsigned: true,
                      })}
                    </span>
                    )
                  </>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Worst day"
              value={
                metrics.worstDay ? (
                  <>
                    {metrics.worstDay.key} (
                    <span
                      className={cn(
                        metrics.worstDay.pnl > 0
                          ? "text-profit/95"
                          : metrics.worstDay.pnl < 0
                            ? "text-red-300/90"
                            : "text-[var(--text-primary)]",
                      )}
                    >
                      {formatDollarWhole(metrics.worstDay.pnl, {
                        unsigned: true,
                      })}
                    </span>
                    )
                  </>
                ) : (
                  "—"
                )
              }
            />
          </ul>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Profitability heatmap
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{year}</p>
          <div className="mt-4 max-w-full overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            <div className="flex flex-wrap gap-1">
              {heatmap.map((c) => (
                <div
                  key={c.key}
                  title={`${c.key}: ${formatDollarWhole(c.pnl, { unsigned: true })}`}
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{
                    background:
                      c.pnl === 0
                        ? "var(--chart-heatmap-zero)"
                        : c.pnl > 0
                          ? `color-mix(in lab, var(--profit) ${28 + c.intensity * 55}%, transparent)`
                          : `color-mix(in srgb, #f87171 ${22 + c.intensity * 50}%, transparent)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-[var(--border)] border-dashed bg-[var(--bg-cell)] px-4 py-8 text-center text-sm text-[var(--text-muted)] sm:p-10">
        Daily target {formatDollarWhole(tradingSettings.dailyTarget)} · Monthly{" "}
        {formatDollarWhole(tradingSettings.monthlyTarget)}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <li className="flex flex-col gap-1 border-b border-[var(--border-soft)] pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span>{label}</span>
      <span className="break-words font-medium tabular-nums text-[var(--text-primary)] sm:break-normal">
        {value}
      </span>
    </li>
  );
}

function PeriodSnapshotCard({
  animations,
  totalTrades,
  winningTrades,
  losingTrades,
  netPnl,
}: {
  animations: boolean;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  netPnl: number;
}) {
  const netStr = formatDollarWhole(netPnl, { unsigned: true });
  return (
    <motion.div
      layout={animations}
      className="flex h-full min-h-0 flex-col items-center text-center rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-raised)_90%,transparent)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      whileHover={animations ? { y: -2 } : undefined}
    >
      <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-4">
        <div className="flex w-full max-w-[16rem] shrink-0 flex-col items-center gap-4">
          <div className="min-w-0 w-full">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Trades
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--text-primary)] sm:text-2xl">
              {totalTrades}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              {winningTrades}W / {losingTrades}L
            </p>
          </div>
          <div className="w-full border-t border-[var(--border-soft)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Net P/L
            </p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums sm:text-2xl",
                netPnl > 0
                  ? "text-profit/95"
                  : netPnl < 0
                    ? "text-red-300/90"
                    : "text-[var(--text-primary)]",
              )}
            >
              {netStr}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              Selected period
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Ring({
  value,
  positive,
  animations,
  compact,
}: {
  value: number;
  positive: boolean;
  animations: boolean;
  compact?: boolean;
}) {
  const r = compact ? 28 : 36;
  const size = compact ? 80 : 96;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value);
  return (
    <motion.div
      className={cn("relative", compact ? "h-20 w-20" : "h-24 w-24")}
      initial={animations ? { opacity: 0.6, scale: 0.94 } : false}
      animate={animations ? { opacity: 1, scale: 1 } : {}}
    >
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--ring-bg)"
          strokeWidth={compact ? 6 : 8}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={positive ? "var(--accent)" : "#f87171"}
          strokeWidth={compact ? 6 : 8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold text-[var(--text-primary)]",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {Math.round(value * 100)}%
      </span>
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
  value: ReactNode;
  sub?: ReactNode;
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </p>
      {sub ? (
        <div className="mt-1 text-xs text-[var(--text-secondary)]">{sub}</div>
      ) : null}
      {spark && spark.length > 1 && dataKey ? (
        <div className="mt-3 h-12 w-full min-h-[48px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                animationDuration={animations ? 400 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </motion.div>
  );
}
