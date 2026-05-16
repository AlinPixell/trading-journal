import { eachDayOfInterval, format, subDays } from "date-fns";
import { computeTradePnlUsd } from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";
import type { Trade } from "@/types/trade";
import { getDateKey } from "@/lib/utils";

export const EQUITY_BASELINE = 10_000;
export const DEFAULT_PAIR = "XAUUSD";

export type EquityPoint = {
  dateKey: string;
  label: string;
  equity: number;
  dayPnl: number;
  tradesCount: number;
};

export type DailyResultRow = {
  dateKey: string;
  label: string;
  trades: number;
  result: number;
  percent: number;
};

export type TradeTableRow = {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  entry: number;
  exit: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number | null;
  percent: number | null;
  date: string;
  dateLabel: string;
  status: "OPEN" | "WIN" | "LOSS" | "EVEN";
};

export type DashboardStats = {
  totalPnl: number;
  winRate: number | null;
  totalTrades: number;
  closedTrades: number;
  bestTrade: number | null;
};

function tradePct(trade: XauUsdTrade, pnl: number | null): number | null {
  if (pnl == null) return null;
  const denom = Math.abs(trade.entryPrice * trade.lots * 100);
  if (denom < 1e-6) return null;
  return (pnl / denom) * 100;
}

function tradeStatus(trade: XauUsdTrade, pnl: number | null): TradeTableRow["status"] {
  if (pnl == null) return "OPEN";
  if (pnl > 0) return "WIN";
  if (pnl < 0) return "LOSS";
  return "EVEN";
}

function journalTableStatus(t: Trade): TradeTableRow["status"] {
  if (t.pnl > 0) return "WIN";
  if (t.pnl < 0) return "LOSS";
  return "EVEN";
}

function journalExitPrice(t: Trade): number | null {
  if (t.takeProfitHitPrice > 0) return t.takeProfitHitPrice;
  if (t.stopLossHitPrice > 0) return t.stopLossHitPrice;
  return null;
}

/** Deterministic mock: upward drift + waves + occasional pullbacks (SSR-safe). */
function mockDayPnl(index: number, total: number): number {
  const t = index / Math.max(1, total - 1);
  const drift = 48 + t * 110;
  const wave = Math.sin((index / 4.8) * Math.PI * 2) * 125;
  const pullback = index % 11 === 7 ? -165 : index % 13 === 5 ? -88 : index % 17 === 11 ? -42 : 0;
  return drift + wave * 0.38 + pullback;
}

function mockTradesCount(index: number): number {
  if (index % 6 === 0) return 3;
  if (index % 3 === 0) return 2;
  if (index % 2 === 0) return 1;
  return 0;
}

export function buildTradesDashboardModel(trades: XauUsdTrade[]): {
  equitySeries: EquityPoint[];
  dailyResults: DailyResultRow[];
  stats: DashboardStats;
  tableRows: TradeTableRow[];
  usesMockCurve: boolean;
} {
  const end = new Date();
  const start = subDays(end, 29);
  const days = eachDayOfInterval({ start, end });

  const byDay = new Map<string, XauUsdTrade[]>();
  for (const t of trades) {
    const k = getDateKey(t.tradedAt);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(t);
  }

  const closedWithPnl = trades
    .map((t) => ({ t, pnl: computeTradePnlUsd(t) }))
    .filter((x): x is { t: XauUsdTrade; pnl: number } => x.pnl != null);

  const usesMockCurve = closedWithPnl.length === 0;

  const rawDays = days.map((day, index) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayTrades = byDay.get(dateKey) ?? [];
    const realDayPnl = dayTrades.reduce((s, t) => s + (computeTradePnlUsd(t) ?? 0), 0);
    const dayPnl = usesMockCurve ? mockDayPnl(index, days.length) : realDayPnl;
    const tradesCount = usesMockCurve ? mockTradesCount(index) : dayTrades.length;
    return { dateKey, label: format(day, "MMM d"), dayPnl, tradesCount };
  });

  let cum = EQUITY_BASELINE;
  const equitySeries: EquityPoint[] = rawDays.map((row) => {
    cum += row.dayPnl;
    return {
      dateKey: row.dateKey,
      label: row.label,
      equity: cum,
      dayPnl: row.dayPnl,
      tradesCount: row.tradesCount,
    };
  });

  const dailyResults: DailyResultRow[] = [...equitySeries]
    .map((row) => {
      const startEq = row.equity - row.dayPnl;
      const percent = Math.abs(startEq) > 1e-6 ? (row.dayPnl / startEq) * 100 : 0;
      return {
        dateKey: row.dateKey,
        label: row.label,
        trades: row.tradesCount,
        result: row.dayPnl,
        percent,
      };
    })
    .reverse();

  const totalPnl =
    equitySeries.length > 0 ? equitySeries[equitySeries.length - 1].equity - EQUITY_BASELINE : 0;

  const wins = closedWithPnl.filter((x) => x.pnl > 0).length;
  const closed = closedWithPnl.length;
  const winRate = closed > 0 ? (wins / closed) * 100 : null;

  let bestTrade: number | null = null;
  if (closed > 0) {
    bestTrade = Math.max(...closedWithPnl.map((x) => x.pnl));
  } else if (usesMockCurve) {
    bestTrade = Math.max(...equitySeries.map((e) => e.dayPnl), 0);
  }

  const tableRows: TradeTableRow[] = [...trades]
    .sort((a, b) => new Date(b.tradedAt).getTime() - new Date(a.tradedAt).getTime())
    .map((t) => {
      const pnl = computeTradePnlUsd(t);
      return {
        id: t.id,
        pair: DEFAULT_PAIR,
        side: t.direction,
        entry: t.entryPrice,
        exit: t.exitPrice ?? null,
        stopLoss: t.stopLoss ?? null,
        takeProfit: t.takeProfit ?? null,
        pnl,
        percent: tradePct(t, pnl),
        date: t.tradedAt,
        dateLabel: format(new Date(t.tradedAt), "MMM d, yyyy · HH:mm"),
        status: tradeStatus(t, pnl),
      };
    });

  return {
    equitySeries,
    dailyResults,
    stats: {
      totalPnl,
      winRate,
      totalTrades: trades.length,
      closedTrades: closed,
      bestTrade,
    },
    tableRows,
    usesMockCurve,
  };
}

/** Dashboard model for journal trades (`useTradeStore`) — same charts/stats shape as XAUUSD workspace. */
export function buildJournalTradesDashboardModel(trades: Trade[]): {
  equitySeries: EquityPoint[];
  dailyResults: DailyResultRow[];
  stats: DashboardStats;
  tableRows: TradeTableRow[];
  usesMockCurve: boolean;
} {
  const end = new Date();
  const start = subDays(end, 29);
  const days = eachDayOfInterval({ start, end });

  const byDay = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = getDateKey(t.createdAt);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(t);
  }

  const usesMockCurve = trades.length === 0;

  const rawDays = days.map((day, index) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayTrades = byDay.get(dateKey) ?? [];
    const realDayPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
    const dayPnl = usesMockCurve ? mockDayPnl(index, days.length) : realDayPnl;
    const tradesCount = usesMockCurve ? mockTradesCount(index) : dayTrades.length;
    return { dateKey, label: format(day, "MMM d"), dayPnl, tradesCount };
  });

  let cum = EQUITY_BASELINE;
  const equitySeries: EquityPoint[] = rawDays.map((row) => {
    cum += row.dayPnl;
    return {
      dateKey: row.dateKey,
      label: row.label,
      equity: cum,
      dayPnl: row.dayPnl,
      tradesCount: row.tradesCount,
    };
  });

  const dailyResults: DailyResultRow[] = [...equitySeries]
    .map((row) => {
      const startEq = row.equity - row.dayPnl;
      const percent = Math.abs(startEq) > 1e-6 ? (row.dayPnl / startEq) * 100 : 0;
      return {
        dateKey: row.dateKey,
        label: row.label,
        trades: row.tradesCount,
        result: row.dayPnl,
        percent,
      };
    })
    .reverse();

  const totalPnl =
    equitySeries.length > 0 ? equitySeries[equitySeries.length - 1].equity - EQUITY_BASELINE : 0;

  const outcomes = trades.map((t) => t.pnl);
  const wins = outcomes.filter((p) => p > 0).length;
  const closed = trades.length;
  const winRate = closed > 0 ? (wins / closed) * 100 : null;

  let bestTrade: number | null = null;
  if (closed > 0) {
    bestTrade = Math.max(...outcomes);
  } else if (usesMockCurve) {
    bestTrade = Math.max(...equitySeries.map((e) => e.dayPnl), 0);
  }

  const tableRows: TradeTableRow[] = [...trades]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((t) => {
      const exitPx = journalExitPrice(t);
      const pct = Math.abs(t.netROI) > 1e-9 ? t.netROI : null;
      return {
        id: t.id,
        pair: t.pair.trim() || DEFAULT_PAIR,
        side: t.direction,
        entry: t.entryPrice,
        exit: exitPx,
        stopLoss: t.stopPrice > 0 ? t.stopPrice : null,
        takeProfit: t.takeProfitPrice > 0 ? t.takeProfitPrice : null,
        pnl: t.pnl,
        percent: pct,
        date: t.createdAt,
        dateLabel: format(new Date(t.createdAt), "MMM d, yyyy · HH:mm"),
        status: journalTableStatus(t),
      };
    });

  return {
    equitySeries,
    dailyResults,
    stats: {
      totalPnl,
      winRate,
      totalTrades: trades.length,
      closedTrades: closed,
      bestTrade,
    },
    tableRows,
    usesMockCurve,
  };
}
