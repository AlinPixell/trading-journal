import type { XauUsdAnalysisEntry, XauUsdTrade, XauUsdTradeDirection } from "@/types/xauusd";

export const XAUUSD_TRADES_KEY = "xauusd-trades";
export const XAUUSD_BACKTEST_TRADES_KEY = "xauusd-backtest-trades";
export const XAUUSD_ANALYSIS_KEY = "xauusd-analysis";

/** Same-tab sync: `storage` events only fire in other windows */
export const XAUUSD_TRADES_WRITE_EVENT = "tj:xauusd-trades-write";

function normalizeDirection(raw: unknown): XauUsdTradeDirection {
  if (raw === "BUY" || raw === "SELL") return raw;
  if (raw === "LONG") return "BUY";
  if (raw === "SHORT") return "SELL";
  return "BUY";
}

function normalizeXauUsdTrade(raw: unknown): XauUsdTrade | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const entryPrice = Number(r.entryPrice);
  if (!Number.isFinite(entryPrice)) return null;

  const id =
    typeof r.id === "string" && r.id.length > 0
      ? r.id
      : typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const exitRaw = r.exitPrice;
  let exitPrice: number | null = null;
  if (typeof exitRaw === "number" && Number.isFinite(exitRaw)) exitPrice = exitRaw;
  else if (typeof exitRaw === "string" && exitRaw.trim() !== "") {
    const n = Number.parseFloat(exitRaw);
    if (Number.isFinite(n)) exitPrice = n;
  }

  const lotsN = Number(r.lots);
  const lots = Number.isFinite(lotsN) ? lotsN : 0.1;

  const slRaw = r.stopLoss;
  let stopLoss: number | null = null;
  if (typeof slRaw === "number" && Number.isFinite(slRaw)) stopLoss = slRaw;
  else if (typeof slRaw === "string" && slRaw.trim() !== "") {
    const n = Number.parseFloat(slRaw);
    if (Number.isFinite(n)) stopLoss = n;
  }

  const tpRaw = r.takeProfit;
  let takeProfit: number | null = null;
  if (typeof tpRaw === "number" && Number.isFinite(tpRaw)) takeProfit = tpRaw;
  else if (typeof tpRaw === "string" && tpRaw.trim() !== "") {
    const n = Number.parseFloat(tpRaw);
    if (Number.isFinite(n)) takeProfit = n;
  }

  const tradedAt =
    typeof r.tradedAt === "string" && r.tradedAt.length > 0
      ? r.tradedAt
      : new Date().toISOString();

  const screenshot =
    typeof r.screenshot === "string" && r.screenshot.length > 0 ? r.screenshot : null;

  return {
    id,
    direction: normalizeDirection(r.direction),
    entryPrice,
    exitPrice,
    lots,
    stopLoss,
    takeProfit,
    tradedAt,
    notes: typeof r.notes === "string" ? r.notes : "",
    backtest: r.backtest === true,
    screenshot,
  };
}

function safeParseTrades(raw: string | null): XauUsdTrade[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => normalizeXauUsdTrade(row))
      .filter((t): t is XauUsdTrade => t != null);
  } catch {
    return [];
  }
}

export function loadTrades(key: string): XauUsdTrade[] {
  if (typeof window === "undefined") return [];
  return safeParseTrades(window.localStorage.getItem(key));
}

export function saveTrades(key: string, trades: XauUsdTrade[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(trades));
  window.dispatchEvent(
    new CustomEvent<{ key: string }>(XAUUSD_TRADES_WRITE_EVENT, { detail: { key } }),
  );
}

/** Reload when this key changes (another tab via `storage`, same tab via {@link saveTrades} event). */
export function subscribeXauUsdTradesKey(key: string, onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const run = () => onChange();

  const onStorage = (e: StorageEvent) => {
    if (e.key === key || e.key === null) run();
  };

  const onLocalWrite: EventListener = (e) => {
    const k = (e as CustomEvent<{ key?: string }>).detail?.key;
    if (k === key) run();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(XAUUSD_TRADES_WRITE_EVENT, onLocalWrite);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(XAUUSD_TRADES_WRITE_EVENT, onLocalWrite);
  };
}

function normalizeAnalysisEntry(raw: unknown): XauUsdAnalysisEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id =
    typeof r.id === "string" && r.id.length > 0
      ? r.id
      : typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const title = typeof r.title === "string" ? r.title : "";
  const description = typeof r.description === "string" ? r.description : "";
  const tags = Array.isArray(r.tags) ? (r.tags as unknown[]).filter((t): t is string => typeof t === "string") : [];
  const screenshot = typeof r.screenshot === "string" ? r.screenshot : "";
  const createdAt =
    typeof r.createdAt === "string" && r.createdAt.length > 0
      ? r.createdAt
      : new Date().toISOString();
  return { id, title, description, tags, screenshot, createdAt };
}

function safeParseAnalysis(raw: string | null): XauUsdAnalysisEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => normalizeAnalysisEntry(row))
      .filter((e): e is XauUsdAnalysisEntry => e != null);
  } catch {
    return [];
  }
}

export function loadAnalysisEntries(): XauUsdAnalysisEntry[] {
  if (typeof window === "undefined") return [];
  return safeParseAnalysis(window.localStorage.getItem(XAUUSD_ANALYSIS_KEY));
}

export function saveAnalysisEntries(entries: XauUsdAnalysisEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(XAUUSD_ANALYSIS_KEY, JSON.stringify(entries));
}

export function computeTradePnlUsd(trade: XauUsdTrade): number | null {
  const exit = trade.exitPrice;
  if (exit == null || !Number.isFinite(exit)) return null;
  const entry = trade.entryPrice;
  const lots = trade.lots;
  if (!Number.isFinite(entry) || !Number.isFinite(lots)) return null;
  if (trade.direction === "BUY") {
    return (exit - entry) * lots * 100;
  }
  return (entry - exit) * lots * 100;
}
