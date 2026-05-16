import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  isWithinInterval,
  isWeekend,
  format,
} from "date-fns";
import type { Trade } from "@/types/trade";
import { getDateKey } from "@/lib/utils";
import { plannedRiskReward, pnlSign } from "@/lib/tradeHelpers";

export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export function getPeriodBounds(period: AnalyticsPeriod, anchor: Date) {
  const map = {
    daily: { start: startOfDay(anchor), end: endOfDay(anchor) },
    weekly: { start: startOfWeek(anchor, { weekStartsOn: 1 }), end: endOfWeek(anchor, { weekStartsOn: 1 }) },
    monthly: { start: startOfMonth(anchor), end: endOfMonth(anchor) },
    yearly: { start: startOfYear(anchor), end: endOfYear(anchor) },
  } as const;
  return map[period];
}

export function filterTradesByPeriod(trades: Trade[], period: AnalyticsPeriod, anchor: Date) {
  const { start, end } = getPeriodBounds(period, anchor);
  return trades.filter((t) =>
    isWithinInterval(new Date(t.createdAt), { start, end })
  );
}

export type DashboardMetrics = {
  totalProfit: number;
  totalLoss: number;
  netPnl: number;
  avgRR: number | null;
  winrate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  bestDay: { key: string; pnl: number } | null;
  worstDay: { key: string; pnl: number } | null;
  avgDailyProfit: number | null;
};

export function computeDashboardMetrics(trades: Trade[]): DashboardMetrics {
  const winning = trades.filter((t) => t.pnl > 0);
  const losing = trades.filter((t) => t.pnl < 0);
  const totalProfit = winning.reduce((s, t) => s + t.pnl, 0);
  const totalLoss = Math.abs(losing.reduce((s, t) => s + t.pnl, 0));
  const netPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const rrValues = trades.map(plannedRiskReward).filter((v): v is number => v != null && Number.isFinite(v));
  const avgRR = rrValues.length ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : null;
  const totalTrades = trades.length;
  const winrate = totalTrades ? (winning.length / totalTrades) * 100 : 0;

  const byDay = new Map<string, number>();
  for (const t of trades) {
    const k = getDateKey(t.createdAt);
    byDay.set(k, (byDay.get(k) ?? 0) + t.pnl);
  }
  let bestDay: { key: string; pnl: number } | null = null;
  let worstDay: { key: string; pnl: number } | null = null;
  for (const [key, pnl] of byDay) {
    if (!bestDay || pnl > bestDay.pnl) bestDay = { key, pnl };
    if (!worstDay || pnl < worstDay.pnl) worstDay = { key, pnl };
  }

  const uniqueDays = byDay.size;
  const avgDailyProfit = uniqueDays > 0 ? netPnl / uniqueDays : null;

  return {
    totalProfit,
    totalLoss,
    netPnl,
    avgRR,
    winrate,
    totalTrades,
    winningTrades: winning.length,
    losingTrades: losing.length,
    bestDay,
    worstDay,
    avgDailyProfit,
  };
}

export type EquityPoint = { t: string; equity: number };

export function buildEquityCurve(trades: Trade[], startBalance: number, period: AnalyticsPeriod, anchor: Date): EquityPoint[] {
  const filtered = filterTradesByPeriod(trades, period, anchor).slice().sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const points: EquityPoint[] = [];
  let equity = startBalance;
  const labelFormat =
    period === "yearly" ? "MMM yyyy" : period === "monthly" ? "MMM d" : "MMM d HH:mm";
  for (const t of filtered) {
    equity += t.pnl;
    points.push({
      t: format(new Date(t.createdAt), labelFormat),
      equity,
    });
  }
  if (points.length === 0) {
    points.push({ t: format(anchor, labelFormat), equity: startBalance });
  }
  return points;
}

export type ConsistencyPoint = { day: string; pnl: number; cumulative: number };

export function dailyConsistencySeries(trades: Trade[], period: AnalyticsPeriod, anchor: Date): ConsistencyPoint[] {
  const { start, end } = getPeriodBounds(period, anchor);
  const days = eachDayOfInterval({ start, end });
  let cumulative = 0;
  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const dayPnl = trades
      .filter((t) => getDateKey(t.createdAt) === key)
      .reduce((s, t) => s + t.pnl, 0);
    cumulative += dayPnl;
    return {
      day: format(day, "EEE d"),
      pnl: dayPnl,
      cumulative,
    };
  });
}

export type HeatmapCell = { key: string; pnl: number; intensity: number };

export function profitabilityHeatmap(trades: Trade[], year: number): HeatmapCell[] {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  const days = eachDayOfInterval({ start, end });
  const pnlByKey = new Map<string, number>();
  let maxAbs = 0;
  for (const t of trades) {
    const d = new Date(t.createdAt);
    if (d.getFullYear() !== year) continue;
    const k = getDateKey(t.createdAt);
    const next = (pnlByKey.get(k) ?? 0) + t.pnl;
    pnlByKey.set(k, next);
    maxAbs = Math.max(maxAbs, Math.abs(next));
  }
  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const pnl = pnlByKey.get(key) ?? 0;
    const intensity = maxAbs > 0 ? Math.min(1, Math.abs(pnl) / maxAbs) : 0;
    return { key, pnl, intensity };
  });
}

export function profitableDaysStreak(trades: Trade[]): number {
  const byDay = new Map<string, number>();
  for (const t of trades) {
    const k = getDateKey(t.createdAt);
    byDay.set(k, (byDay.get(k) ?? 0) + t.pnl);
  }
  const sortedKeys = [...byDay.keys()].sort().reverse();
  let streak = 0;
  for (const k of sortedKeys) {
    const v = byDay.get(k) ?? 0;
    if (v > 0) streak += 1;
    else break;
  }
  return streak;
}

export function winStreak(trades: Trade[]): number {
  const sorted = trades.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  let streak = 0;
  for (const t of sorted) {
    if (pnlSign(t) > 0) streak += 1;
    else break;
  }
  return streak;
}

/**
 * Trading days for scaling daily target: 1 for a single day, 5 per week, otherwise Mon–Fri
 * in the selected month or year (weekends excluded).
 */
export function periodTradingDayCount(period: AnalyticsPeriod, anchor: Date): number {
  if (period === "daily") return 1;
  if (period === "weekly") return 5;
  const { start, end } = getPeriodBounds(period, anchor);
  return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d)).length;
}
