import type { CalendarViewMode } from "@/lib/calendarTypes";

export type ThemeMode = "dark" | "light";

export type TradingSettings = {
  accountBalance: number;
  broker: string;
  defaultPair: string;
  defaultLotSize: number;
  /** Display / planning — may mirror default lot */
  preferredLotSize: number;
  riskPercent: number;
  leverage: number;
  riskManagementNotes: string;
  targetAmount: number;
  dailyTarget: number;
  monthlyTarget: number;
};

export type AppSettings = {
  accentColor: string;
  animationsEnabled: boolean;
  calendarDefaultView: CalendarViewMode;
  autoCalculations: boolean;
  theme: ThemeMode;
};

/** Optional trader profile (journal context) */
export type Profile = {
  name: string;
  tradingStyle: string;
  riskFocus: string;
  bio: string;
};
