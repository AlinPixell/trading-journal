import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile, Trade } from "@/types/trade";
import { createMockTrades, getDateKey } from "@/lib/utils";

export type TradeStoreState = {
  trades: Trade[];
  profile: Profile;
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
  updateProfile: (profile: Profile) => void;
  getTradeById: (id: string) => Trade | undefined;
  getTradesByDate: (date: string) => Trade[];
  getTradesByMonth: (year: number, month: number) => Trade[];
  getTradesByYear: (year: number) => Trade[];
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

export const useTradeStore = create<TradeStoreState>()(
  persist(
    (set, get) => ({
      trades: createMockTrades(new Date().getFullYear(), new Date().getMonth()),
      profile: {
        name: "Your Name",
        tradingStyle: "Momentum / Swing",
        riskFocus: "Position sizing and discipline",
        bio: "I record every trade with personal context and reflection for better decision-making.",
      },
      addTrade: (trade) =>
        set((state) => ({
          trades: [trade, ...state.trades],
        })),
      updateTrade: (trade) =>
        set((state) => ({
          trades: state.trades.map((item) => (item.id === trade.id ? trade : item)),
        })),
      deleteTrade: (id) =>
        set((state) => ({
          trades: state.trades.filter((trade) => trade.id !== id),
        })),
      updateProfile: (profile) =>
        set(() => ({
          profile,
        })),
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
    }),
    {
      name: "trade-journal-storage",
      storage: getStorage() as any,
    }
  )
);
