import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trade } from "@/types/trade";
import type {
  AppSettings,
  JournalWorkspace,
  Profile,
  ThemeMode,
  TradingSettings,
} from "@/types/settings";
import { getDateKey } from "@/lib/utils";
import {
  canAddTradeForDate,
  normalizeTrade,
  syncDerivedFields,
} from "@/lib/tradeHelpers";
import type { CalendarViewMode } from "@/lib/calendarTypes";

export type TradeStoreState = {
  profiles: JournalWorkspace[];
  activeProfileId: string;
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
  switchProfile: (id: string) => void;
  addProfile: (name?: string) => void;
  removeProfile: (id: string) => void;
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
  theme: "dark",
};

const defaultProfile: Profile = {
  name: "Trader",
  tradingStyle: "Intraday",
  riskFocus: "Consistency",
  bio: "",
};

function newWorkspaceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createWorkspace(overrides?: Partial<Pick<JournalWorkspace, "profile" | "tradingSettings" | "trades">>): JournalWorkspace {
  const id = newWorkspaceId();
  return {
    id,
    profile: { ...defaultProfile, ...overrides?.profile },
    tradingSettings: { ...defaultTradingSettings, ...overrides?.tradingSettings },
    trades: overrides?.trades ? [...overrides.trades] : [],
  };
}

const seedWorkspace = createWorkspace();

function findActiveIndex(state: Pick<TradeStoreState, "profiles" | "activeProfileId">): number {
  if (state.profiles.length === 0) return 0;
  const i = state.profiles.findIndex((p) => p.id === state.activeProfileId);
  return i >= 0 ? i : 0;
}

export function getActiveWorkspace(state: Pick<TradeStoreState, "profiles" | "activeProfileId">): JournalWorkspace {
  if (state.profiles.length === 0) {
    return createWorkspace();
  }
  const i = findActiveIndex(state);
  return state.profiles[i] ?? state.profiles[0];
}

export function selectActiveTrades(state: TradeStoreState): Trade[] {
  return getActiveWorkspace(state).trades;
}

export function selectActiveProfile(state: TradeStoreState): Profile {
  return getActiveWorkspace(state).profile;
}

export function selectActiveTradingSettings(state: TradeStoreState): TradingSettings {
  return getActiveWorkspace(state).tradingSettings;
}

function prepareTrade(
  tradingSettings: TradingSettings,
  appSettings: AppSettings,
  trade: Trade
): Trade {
  return syncDerivedFields({ ...trade }, tradingSettings.accountBalance, appSettings.autoCalculations);
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

function normalizeWorkspace(raw: unknown): JournalWorkspace {
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" && r.id.length > 0 ? r.id : newWorkspaceId();
  const trades = Array.isArray(r.trades)
    ? r.trades.map((row) => normalizeTrade(row as Record<string, unknown>))
    : [];
  const profile =
    typeof r.profile === "object" && r.profile !== null
      ? { ...defaultProfile, ...(r.profile as Profile) }
      : { ...defaultProfile };
  const tradingSettings =
    typeof r.tradingSettings === "object" && r.tradingSettings !== null
      ? { ...defaultTradingSettings, ...(r.tradingSettings as TradingSettings) }
      : { ...defaultTradingSettings };
  return { id, profile, tradingSettings, trades };
}

function mergeAppSettings(raw: unknown): AppSettings {
  const merged: AppSettings = {
    ...defaultAppSettings,
    ...(typeof raw === "object" && raw !== null ? (raw as Partial<AppSettings>) : {}),
  };
  return {
    ...merged,
    calendarDefaultView: normalizeCalendarView(merged.calendarDefaultView),
    theme: normalizeTheme(merged.theme),
  };
}

export const useTradeStore = create<TradeStoreState>()(
  persist(
    (set, get) => ({
      profiles: [seedWorkspace],
      activeProfileId: seedWorkspace.id,
      appSettings: defaultAppSettings,
      addTrade: (trade) => {
        const state = get();
        const ws = getActiveWorkspace(state);
        if (!canAddTradeForDate(ws.trades, trade.createdAt)) {
          return { ok: false, error: `Max ${3} trades per day.` };
        }
        const prepared = prepareTrade(ws.tradingSettings, state.appSettings, trade);
        const idx = findActiveIndex(state);
        set((s) => {
          const profiles = [...s.profiles];
          const cur = profiles[idx];
          profiles[idx] = { ...cur, trades: [prepared, ...cur.trades] };
          return { profiles };
        });
        return { ok: true };
      },
      updateTrade: (trade) => {
        const state = get();
        const idx = findActiveIndex(state);
        const ws = state.profiles[idx];
        const existing = ws.trades.find((t) => t.id === trade.id);
        if (!existing) return;
        const oldKey = getDateKey(existing.createdAt);
        const newKey = getDateKey(trade.createdAt);
        if (oldKey !== newKey) {
          const count = ws.trades.filter(
            (t) => getDateKey(t.createdAt) === newKey && t.id !== trade.id
          ).length;
          if (count >= 3) return;
        }
        const prepared = prepareTrade(ws.tradingSettings, state.appSettings, trade);
        set((s) => {
          const profiles = [...s.profiles];
          profiles[idx] = {
            ...profiles[idx],
            trades: profiles[idx].trades.map((item) => (item.id === prepared.id ? prepared : item)),
          };
          return { profiles };
        });
      },
      deleteTrade: (id) =>
        set((s) => {
          const idx = findActiveIndex(s);
          const profiles = [...s.profiles];
          profiles[idx] = {
            ...profiles[idx],
            trades: profiles[idx].trades.filter((trade) => trade.id !== id),
          };
          return { profiles };
        }),
      updateProfile: (profile) =>
        set((s) => {
          const idx = findActiveIndex(s);
          const profiles = [...s.profiles];
          profiles[idx] = { ...profiles[idx], profile };
          return { profiles };
        }),
      updateTradingSettings: (patch) =>
        set((s) => {
          const idx = findActiveIndex(s);
          const profiles = [...s.profiles];
          const tradingSettings = { ...profiles[idx].tradingSettings, ...patch };
          const sliceTs = tradingSettings;
          const sliceApp = s.appSettings;
          profiles[idx] = {
            ...profiles[idx],
            tradingSettings,
            trades: profiles[idx].trades.map((t) => prepareTrade(sliceTs, sliceApp, t)),
          };
          return { profiles };
        }),
      updateAppSettings: (patch) =>
        set((s) => {
          const appSettings = { ...s.appSettings, ...patch };
          const profiles = s.profiles.map((w) => ({
            ...w,
            trades: w.trades.map((t) => prepareTrade(w.tradingSettings, appSettings, t)),
          }));
          return { appSettings, profiles };
        }),
      replaceTrades: (trades) =>
        set((s) => {
          const idx = findActiveIndex(s);
          const ws = s.profiles[idx];
          const profiles = [...s.profiles];
          profiles[idx] = {
            ...ws,
            trades: trades.map((t) =>
              prepareTrade(
                ws.tradingSettings,
                s.appSettings,
                normalizeTrade(t as unknown as Record<string, unknown>)
              )
            ),
          };
          return { profiles };
        }),
      importState: (payload) => {
        const p = payload as Record<string, unknown> | null;
        if (!p || typeof p !== "object") return;

        const state = get();

        if (Array.isArray(p.profiles) && p.profiles.length > 0) {
          const profiles = (p.profiles as unknown[]).map(normalizeWorkspace);
          const activeRaw = p.activeProfileId;
          const activeProfileId =
            typeof activeRaw === "string" && profiles.some((w) => w.id === activeRaw)
              ? activeRaw
              : profiles[0].id;
          const appSettings = p.appSettings ? mergeAppSettings(p.appSettings) : state.appSettings;
          set({ profiles, activeProfileId, appSettings });
          return;
        }

        const appRaw = p.appSettings as Partial<AppSettings> | undefined;

        set((s) => {
          let appSettings = s.appSettings;
          if (appRaw && typeof appRaw === "object") {
            appSettings = mergeAppSettings({ ...s.appSettings, ...appRaw });
          }

          const idx = findActiveIndex(s);
          const profiles = [...s.profiles];
          const cur = profiles[idx];
          let nextWs = { ...cur };

          if (Array.isArray(p.trades)) {
            nextWs.trades = p.trades.map((row) =>
              prepareTrade(nextWs.tradingSettings, appSettings, normalizeTrade(row as Record<string, unknown>))
            );
          }

          const ts = p.tradingSettings as TradingSettings | undefined;
          if (ts) {
            nextWs.tradingSettings = { ...nextWs.tradingSettings, ...ts };
            nextWs.trades = nextWs.trades.map((t) =>
              prepareTrade(nextWs.tradingSettings, appSettings, t)
            );
          }

          const prof = p.profile as Profile | undefined;
          if (prof) {
            nextWs.profile = { ...nextWs.profile, ...prof };
          }

          profiles[idx] = nextWs;

          const allProfiles = profiles.map((w) => ({
            ...w,
            trades: w.trades.map((t) => prepareTrade(w.tradingSettings, appSettings, t)),
          }));

          return { profiles: allProfiles, appSettings };
        });
      },
      getTradeById: (id) => getActiveWorkspace(get()).trades.find((trade) => trade.id === id),
      getTradesByDate: (date) =>
        getActiveWorkspace(get()).trades.filter(
          (trade) => getDateKey(trade.createdAt) === getDateKey(date)
        ),
      getTradesByMonth: (year, month) =>
        getActiveWorkspace(get()).trades.filter((trade) => {
          const value = new Date(trade.createdAt);
          return value.getFullYear() === year && value.getMonth() === month;
        }),
      getTradesByYear: (year) =>
        getActiveWorkspace(get()).trades.filter(
          (trade) => new Date(trade.createdAt).getFullYear() === year
        ),
      seedDemoTrades: () => {
        const state = get();
        const idx = findActiveIndex(state);
        const ws = state.profiles[idx];
        const demos = buildDemoTrades().map((t) =>
          prepareTrade(ws.tradingSettings, state.appSettings, t)
        );
        set((s) => {
          const profiles = [...s.profiles];
          profiles[idx] = {
            ...profiles[idx],
            trades: [...demos, ...profiles[idx].trades],
          };
          return { profiles };
        });
      },
      switchProfile: (id) =>
        set((s) => {
          if (!s.profiles.some((p) => p.id === id)) return s;
          return { activeProfileId: id };
        }),
      addProfile: (name) => {
        const s = get();
        const label = name?.trim() || `Trader ${s.profiles.length + 1}`;
        const ws = createWorkspace({
          profile: { ...defaultProfile, name: label },
        });
        set((state) => ({
          profiles: [...state.profiles, ws],
          activeProfileId: ws.id,
        }));
      },
      removeProfile: (id) =>
        set((s) => {
          if (s.profiles.length <= 1) return s;
          const next = s.profiles.filter((p) => p.id !== id);
          let activeProfileId = s.activeProfileId;
          if (activeProfileId === id) {
            activeProfileId = next[0]?.id ?? activeProfileId;
          }
          return { profiles: next, activeProfileId };
        }),
    }),
    {
      name: "trade-journal-storage",
      storage: getStorage() as any,
      version: 3,
      migrate: (persistedState: unknown, _fromVersion: number) => {
        const p = persistedState as Record<string, unknown> | null;
        if (!p || typeof p !== "object") return persistedState;

        const appSettings = mergeAppSettings(p.appSettings);

        if (Array.isArray(p.profiles) && p.profiles.length > 0) {
          const profiles = (p.profiles as unknown[]).map(normalizeWorkspace);
          const activeRaw = p.activeProfileId;
          const activeProfileId =
            typeof activeRaw === "string" && profiles.some((w) => w.id === activeRaw)
              ? activeRaw
              : profiles[0].id;
          return { profiles, activeProfileId, appSettings };
        }

        const trades = Array.isArray(p.trades)
          ? p.trades.map((row) => normalizeTrade(row as Record<string, unknown>))
          : [];
        const wid = newWorkspaceId();
        return {
          profiles: [
            {
              id: wid,
              profile:
                typeof p.profile === "object" && p.profile !== null
                  ? { ...defaultProfile, ...(p.profile as Profile) }
                  : { ...defaultProfile },
              tradingSettings: {
                ...defaultTradingSettings,
                ...(typeof p.tradingSettings === "object" && p.tradingSettings !== null
                  ? (p.tradingSettings as TradingSettings)
                  : {}),
              },
              trades,
            },
          ],
          activeProfileId: wid,
          appSettings,
        };
      },
      partialize: (s) => ({
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        appSettings: s.appSettings,
      }),
    }
  )
);

function normalizeCalendarView(v: CalendarViewMode | undefined): CalendarViewMode {
  if (v === "day" || v === "week" || v === "month" || v === "year") return v;
  return "month";
}

function normalizeTheme(v: unknown): ThemeMode {
  if (v === "light" || v === "dark") return v;
  return "dark";
}
