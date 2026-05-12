import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trade } from "@/types/trade";
import type { AppSettings, Profile, TradingSettings } from "@/types/settings";
import { getDateKey } from "@/lib/utils";
import {
  canAddTradeForDate,
  normalizeTrade,
  syncDerivedFields,
} from "@/lib/tradeHelpers";
import type { CalendarViewMode } from "@/lib/calendarTypes";

export type TradeStoreState = {
  trades: Trade[];
  profile: Profile;
  tradingSettings: TradingSettings;
  appSettings: AppSettings;
  addTrade: (trade: Trade) => { ok: boolean; error?: string };
  updateTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
  updateProfile: (profile: Profile) => void;
  updateTradingSettings: (patch: Partial<TradingSettings>) => void;
  updateAppSettings: (patch: Partial<AppSettings>) => void;
  replaceTrades: (trades: Trade[]) => void;
  importState: (payload: unknown) => void;
  getTradeById: (id: string) => Trade | undefined;
  getTradesByDate: (date: string) => Trade[];
  getTradesByMonth: (year: number, month: number) => Trade[];
  getTradesByYear: (year: number) => Trade[];
  seedDemoTrades: () => void;
};

const fallbackStorage: Storage = {
  getItem: (_name: string) => null as any,
  setItem: (_name: string, _value: string) => {},
  removeItem: (_name: string) => {},
  clear: () => {},
  key: (_index: number) => null,
  length: 0,
};

let getStorage: () => Storage = () => fallbackStorage;
if (typeof window !== "undefined") {
  getStorage = () => localStorage;
}

const defaultTradingSettings: TradingSettings = {
  accountBalance: 100_000,
  broker: "",
  defaultPair: "XAUUSD",
  defaultLotSize: 0.1,
  preferredLotSize: 0.1,
  riskPercent: 1,
  leverage: 30,
  riskManagementNotes: "Max 1% risk per trade.",
  targetAmount: 15_000,
  dailyTarget: 500,
  monthlyTarget: 10_000,
};

const defaultAppSettings: AppSettings = {
  accentColor: "#c25cff",
  animationsEnabled: true,
  calendarDefaultView: "month",
  autoCalculations: true,
};

const defaultProfile: Profile = {
  name: "Trader",
  tradingStyle: "Intraday",
  riskFocus: "Consistency",
  bio: "",
};

function prepareTrade(
  state: Pick<TradeStoreState, "tradingSettings" | "appSettings">,
  trade: Trade
): Trade {
  const { tradingSettings, appSettings } = state;
  return syncDerivedFields(
    { ...trade },
    tradingSettings.accountBalance,
    appSettings.autoCalculations
  );
}

/** Lightweight demo dataset — only used when user explicitly seeds from Settings */
function buildDemoTrades(): Trade[] {
  const y = new Date().getFullYear();
  const m = new Date().getMonth();
  const base = new Date(y, m, 4, 9, 30, 45).toISOString();
  return [
    normalizeTrade({
      id: "demo-1",
      pair: "XAUUSD",
      title: "London breakout",
      direction: "BUY",
      entryPrice: 2650.2,
      stopPrice: 2645.0,
      takeProfitPrice: 2660.0,
      takeProfitHitPrice: 2658.4,
      pnl: 420,
      netROI: 0,
      notes: "Trimmed into resistance.",
      personalInfo: "",
      confidence: 80,
      rating: 4,
      tags: ["Breakout"],
      checklist: ["Risk OK"],
      screenshots: [],
      createdAt: base,
    }),
    normalizeTrade({
      id: "demo-2",
      pair: "EURUSD",
      title: "Fade into NY",
      direction: "SELL",
      entryPrice: 1.085,
      stopPrice: 1.087,
      takeProfitPrice: 1.08,
      takeProfitHitPrice: 1.081,
      pnl: -185,
      netROI: 0,
      notes: "Stopped on news spike.",
      personalInfo: "",
      confidence: 65,
      rating: 2,
      tags: ["News"],
      checklist: [],
      screenshots: [],
      createdAt: new Date(y, m, 4, 15, 12, 10).toISOString(),
    }),
  ];
}

export const useTradeStore = create<TradeStoreState>()(
  persist(
    (set, get) => ({
      trades: [],
      profile: defaultProfile,
      tradingSettings: defaultTradingSettings,
      appSettings: defaultAppSettings,
      addTrade: (trade) => {
        const state = get();
        if (!canAddTradeForDate(state.trades, trade.createdAt)) {
          return { ok: false, error: `Max ${3} trades per day.` };
        }
        const prepared = prepareTrade(state, trade);
        set((s) => ({
          trades: [prepared, ...s.trades],
        }));
        return { ok: true };
      },
      updateTrade: (trade) => {
        const state = get();
        const existing = state.trades.find((t) => t.id === trade.id);
        if (!existing) return;
        const oldKey = getDateKey(existing.createdAt);
        const newKey = getDateKey(trade.createdAt);
        if (oldKey !== newKey) {
          const count = state.trades.filter(
            (t) => getDateKey(t.createdAt) === newKey && t.id !== trade.id
          ).length;
          if (count >= 3) return;
        }
        const prepared = prepareTrade(state, trade);
        set((s) => ({
          trades: s.trades.map((item) => (item.id === prepared.id ? prepared : item)),
        }));
      },
      deleteTrade: (id) =>
        set((s) => ({
          trades: s.trades.filter((trade) => trade.id !== id),
        })),
      updateProfile: (profile) => set(() => ({ profile })),
      updateTradingSettings: (patch) =>
        set((s) => {
          const tradingSettings = { ...s.tradingSettings, ...patch };
          const slice = { tradingSettings, appSettings: s.appSettings };
          return {
            tradingSettings,
            trades: s.trades.map((t) => prepareTrade(slice, t)),
          };
        }),
      updateAppSettings: (patch) =>
        set((s) => {
          const appSettings = { ...s.appSettings, ...patch };
          const slice = { tradingSettings: s.tradingSettings, appSettings };
          return {
            appSettings,
            trades: s.trades.map((t) => prepareTrade(slice, t)),
          };
        }),
      replaceTrades: (trades) => {
        const state = get();
        set({
          trades: trades.map((t) =>
            prepareTrade(state, normalizeTrade(t as unknown as Record<string, unknown>))
          ),
        });
      },
      importState: (payload) => {
        const p = payload as Record<string, unknown> | null;
        if (!p || typeof p !== "object") return;
        const tradesRaw = p.trades;
        if (Array.isArray(tradesRaw)) {
          const state = get();
          set({
            trades: tradesRaw.map((row) =>
              prepareTrade(state, normalizeTrade(row as Record<string, unknown>))
            ),
          });
        }
        const ts = p.tradingSettings as TradingSettings | undefined;
        const app = p.appSettings as Partial<AppSettings> | undefined;
        if (ts) set((s) => ({ tradingSettings: { ...s.tradingSettings, ...ts } }));
        const prof = p.profile as Profile | undefined;
        if (prof) set((s) => ({ profile: { ...s.profile, ...prof } }));
      },
      getTradeById: (id) => get().trades.find((trade) => trade.id === id),
      getTradesByDate: (date) =>
        get().trades.filter((trade) => getDateKey(trade.createdAt) === getDateKey(date)),
      getTradesByMonth: (year, month) =>
        get().trades.filter((trade) => {
          const value = new Date(trade.createdAt);
          return value.getFullYear() === year && value.getMonth() === month;
        }),
      getTradesByYear: (year) =>
        get().trades.filter((trade) => new Date(trade.createdAt).getFullYear() === year),
      seedDemoTrades: () => {
        const state = get();
        set({
          trades: [
            ...buildDemoTrades().map((t) => prepareTrade(state, t)),
            ...state.trades,
          ],
        });
      },
    }),
    {
      name: "trade-journal-storage",
      storage: getStorage() as any,
      version: 2,
      migrate: (persisted: unknown) => {
        const p = persisted as Record<string, unknown> | null;
        if (!p) return persisted;
        const trades = Array.isArray(p.trades)
          ? p.trades.map((row) => normalizeTrade(row as Record<string, unknown>))
          : [];
        return {
          ...p,
          trades,
          profile: p.profile ?? defaultProfile,
          tradingSettings: { ...defaultTradingSettings, ...(p.tradingSettings as object) },
          appSettings: {
            ...defaultAppSettings,
            ...(p.appSettings as object),
            calendarDefaultView: normalizeCalendarView(
              (p.appSettings as AppSettings | undefined)?.calendarDefaultView
            ),
          },
        };
      },
    }
  )
);

function normalizeCalendarView(v: CalendarViewMode | undefined): CalendarViewMode {
  if (v === "day" || v === "week" || v === "month" || v === "year") return v;
  return "month";
}
