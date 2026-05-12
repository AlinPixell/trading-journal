import { format } from "date-fns";
import type { Trade, TradeDirection, TradeSide, TradeStatus } from "@/types/trade";
import { getDateKey } from "@/lib/utils";

export function legacySideToDirection(side?: TradeSide): TradeDirection {
  return side === "short" ? "SELL" : "BUY";
}

export function normalizeTrade(raw: Record<string, unknown>): Trade {
  const side = raw.side as TradeSide | undefined;
  const direction = (raw.direction as TradeDirection | undefined) ?? legacySideToDirection(side);
  const entryPrice = Number(raw.entryPrice ?? 0);
  const stopPrice = Number(raw.stopPrice ?? 0);
  const takeProfitPrice = Number(raw.takeProfitPrice ?? 0);
  const takeProfitHitPrice = Number(raw.takeProfitHitPrice ?? raw.takeProfitPrice ?? 0);
  const pnl = typeof raw.pnl === "number" ? raw.pnl : 0;
  const netROI = typeof raw.netROI === "number" ? raw.netROI : 0;
  let status: TradeStatus = (raw.status as TradeStatus) ?? "breakeven";
  if (pnl > 0) status = "win";
  else if (pnl < 0) status = "loss";
  else if (pnl === 0 && netROI > 0) status = "win";
  else if (pnl === 0 && netROI < 0) status = "loss";
  else if (pnl === 0 && netROI === 0) status = "breakeven";

  return {
    id: String(raw.id),
    pair: String(raw.pair ?? "XAUUSD"),
    title: String(raw.title ?? ""),
    direction,
    side,
    status,
    entryPrice,
    stopPrice,
    takeProfitPrice,
    takeProfitHitPrice,
    pnl,
    netROI,
    notes: String(raw.notes ?? ""),
    personalInfo: String(raw.personalInfo ?? ""),
    confidence: Number(raw.confidence ?? 0),
    rating: Number(raw.rating ?? 0),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    checklist: Array.isArray(raw.checklist) ? (raw.checklist as string[]) : [],
    screenshots: Array.isArray(raw.screenshots) ? (raw.screenshots as string[]) : [],
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export function formatFullTimestamp(iso: string) {
  return format(new Date(iso), "MMM d, yyyy · HH:mm:ss");
}

export function plannedRiskReward(trade: Trade): number | null {
  const risk = Math.abs(trade.entryPrice - trade.stopPrice);
  if (risk < 1e-8) return null;
  const reward = Math.abs(trade.takeProfitPrice - trade.entryPrice);
  return reward / risk;
}

export function pnlSign(trade: Trade) {
  return trade.pnl > 0 ? 1 : trade.pnl < 0 ? -1 : 0;
}

export function tradesForDateKey(trades: Trade[], key: string) {
  return trades.filter((t) => getDateKey(t.createdAt) === key);
}

export const MAX_TRADES_PER_DAY = 3;

export function canAddTradeForDate(trades: Trade[], isoOrDate: string | Date) {
  return tradesForDateKey(trades, getDateKey(isoOrDate)).length < MAX_TRADES_PER_DAY;
}

export function syncDerivedFields(trade: Trade, accountBalance: number, autoCalculations: boolean): Trade {
  if (!autoCalculations || accountBalance <= 0) return trade;
  const netROI = (trade.pnl / accountBalance) * 100;
  let status: TradeStatus = "breakeven";
  if (trade.pnl > 0) status = "win";
  else if (trade.pnl < 0) status = "loss";
  return { ...trade, netROI, status };
}

/** `yyyy-MM-dd` in local calendar, keeping the current clock time. */
export function isoFromLocalDatePreservingNowTime(dateStr: string): string {
  const now = new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return new Date().toISOString();
  const dt = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return dt.toISOString();
}

/** Minimal journal entry: profit only; rest is defaulted and metrics stay in sync via store. */
export function createTradeFromProfitOnly(params: {
  id: string;
  pnl: number;
  defaultPair: string;
  accountBalance: number;
  autoCalculations: boolean;
  /** ISO string or omit / pass `tradeDate` instead */
  createdAt?: string;
  /** `yyyy-MM-dd` — trade day in local timezone (time = now) */
  tradeDate?: string;
  /** When set, overrides direction inferred from sign of `pnl` */
  direction?: TradeDirection;
}): Trade {
  const createdAt =
    params.createdAt ??
    (params.tradeDate ? isoFromLocalDatePreservingNowTime(params.tradeDate) : new Date().toISOString());
  const direction: TradeDirection = params.direction ?? (params.pnl >= 0 ? "BUY" : "SELL");
  const status: TradeStatus =
    params.pnl > 0 ? "win" : params.pnl < 0 ? "loss" : "breakeven";
  const base: Trade = {
    id: params.id,
    pair: params.defaultPair.trim() || "XAUUSD",
    title: `Trade · ${format(new Date(createdAt), "MMM d, HH:mm")}`,
    direction,
    status,
    entryPrice: 0,
    stopPrice: 0,
    takeProfitPrice: 0,
    takeProfitHitPrice: 0,
    pnl: params.pnl,
    netROI: 0,
    notes: "",
    personalInfo: "",
    confidence: 0,
    rating: 0,
    tags: [],
    checklist: [],
    screenshots: [],
    createdAt,
  };
  return syncDerivedFields(base, params.accountBalance, params.autoCalculations);
}
