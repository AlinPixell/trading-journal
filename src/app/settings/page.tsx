"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useRef } from "react";
import { useTradeStore } from "@/store/useTradeStore";
import type { CalendarViewMode } from "@/lib/calendarTypes";
import { cn } from "@/lib/cn";
import ProfileForm from "@/components/ProfileForm";

export default function SettingsPage() {
  const tradingSettings = useTradeStore((s) => s.tradingSettings);
  const appSettings = useTradeStore((s) => s.appSettings);
  const profile = useTradeStore((s) => s.profile);
  const updateTrading = useTradeStore((s) => s.updateTradingSettings);
  const updateApp = useTradeStore((s) => s.updateAppSettings);
  const updateProfile = useTradeStore((s) => s.updateProfile);
  const importState = useTradeStore((s) => s.importState);
  const trades = useTradeStore((s) => s.trades);
  const seedDemoTrades = useTradeStore((s) => s.seedDemoTrades);
  const fileRef = useRef<HTMLInputElement>(null);

  const input =
    "mt-2 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]";

  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { trades, profile, tradingSettings, appSettings, exportedAt: new Date().toISOString() },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trade-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const header = [
      "id",
      "pair",
      "direction",
      "pnl",
      "entryPrice",
      "stopPrice",
      "takeProfitPrice",
      "takeProfitHitPrice",
      "createdAt",
      "notes",
    ];
    const rows = trades.map((t) =>
      [
        t.id,
        t.pair,
        t.direction,
        t.pnl,
        t.entryPrice,
        t.stopPrice,
        t.takeProfitPrice,
        t.takeProfitHitPrice,
        t.createdAt,
        `"${t.notes.replace(/"/g, '""')}"`,
      ].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (f: File | null) => {
    if (!f) return;
    const text = await f.text();
    try {
      const data = JSON.parse(text) as Record<string, unknown>;
      importState(data);
    } catch {
      alert("Invalid JSON file.");
    }
  };

  const views: { id: CalendarViewMode; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];

  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-24 pt-8 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Workspace</h1>
        </header>

        <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Trading</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[var(--text-secondary)]">
              Account balance
              <input
                type="number"
                className={input}
                value={tradingSettings.accountBalance}
                onChange={(e) => updateTrading({ accountBalance: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Target amount
              <input
                type="number"
                className={input}
                value={tradingSettings.targetAmount}
                onChange={(e) => updateTrading({ targetAmount: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Risk %
              <input
                type="number"
                step="0.1"
                className={input}
                value={tradingSettings.riskPercent}
                onChange={(e) => updateTrading({ riskPercent: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Preferred lot size
              <input
                type="number"
                step="0.01"
                className={input}
                value={tradingSettings.preferredLotSize}
                onChange={(e) => updateTrading({ preferredLotSize: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Daily target
              <input
                type="number"
                className={input}
                value={tradingSettings.dailyTarget}
                onChange={(e) => updateTrading({ dailyTarget: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Monthly target
              <input
                type="number"
                className={input}
                value={tradingSettings.monthlyTarget}
                onChange={(e) => updateTrading({ monthlyTarget: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Broker
              <input
                className={input}
                value={tradingSettings.broker}
                onChange={(e) => updateTrading({ broker: e.target.value })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Default pair
              <input
                className={input}
                value={tradingSettings.defaultPair}
                onChange={(e) => updateTrading({ defaultPair: e.target.value })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Default lot size
              <input
                type="number"
                step="0.01"
                className={input}
                value={tradingSettings.defaultLotSize}
                onChange={(e) => updateTrading({ defaultLotSize: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Leverage
              <input
                type="number"
                className={input}
                value={tradingSettings.leverage}
                onChange={(e) => updateTrading({ leverage: Number(e.target.value) })}
              />
            </label>
          </div>
          <label className="mt-4 block text-sm text-[var(--text-secondary)]">
            Risk management notes
            <textarea
              className={cn(input, "min-h-[88px]")}
              value={tradingSettings.riskManagementNotes}
              onChange={(e) => updateTrading({ riskManagementNotes: e.target.value })}
            />
          </label>
        </section>

        <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">App</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-[var(--text-secondary)]">
              Accent color
              <input
                type="color"
                className="mt-2 h-12 w-full cursor-pointer rounded-md border border-[var(--border-soft)] bg-transparent p-1"
                value={appSettings.accentColor}
                onChange={(e) => updateApp({ accentColor: e.target.value })}
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Animations
              <input
                type="checkbox"
                checked={appSettings.animationsEnabled}
                onChange={(e) => updateApp({ animationsEnabled: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Auto calculations (% ROI from balance)
              <input
                type="checkbox"
                checked={appSettings.autoCalculations}
                onChange={(e) => updateApp({ autoCalculations: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Calendar default view</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {views.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => updateApp({ calendarDefaultView: v.id })}
                    className={cn(
                      "rounded px-3 py-2 text-xs font-semibold transition",
                      appSettings.calendarDefaultView === v.id
                        ? "bg-[var(--accent)] text-[#111]"
                        : "border border-[var(--border-soft)] bg-white/[0.05] text-[var(--text-secondary)]"
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Data</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportJson}
              className="rounded-md border border-[var(--border-soft)] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.1]"
            >
              Export JSON backup
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-md border border-[var(--border-soft)] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.1]"
            >
              Export trades CSV
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-[var(--border-soft)] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.1]"
            >
              Import backup JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => seedDemoTrades()}
              className="rounded-md border border-[var(--border-soft)] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.1]"
            >
              Load demo trades
            </button>
          </div>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Imports merge trading/app settings when present. Keep JSON backups for recovery.
          </p>
        </section>

        <ProfileForm profile={profile} onSave={updateProfile} onCancel={() => {}} embedded />
      </div>
    </div>
    </AppShell>
  );
}
