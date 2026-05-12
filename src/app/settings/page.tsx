"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useRef } from "react";
import {
  selectActiveProfile,
  selectActiveTradingSettings,
  selectActiveTrades,
  useTradeStore,
} from "@/store/useTradeStore";
import type { CalendarViewMode } from "@/lib/calendarTypes";
import { cn } from "@/lib/cn";
import ProfileForm from "@/components/ProfileForm";

export default function SettingsPage() {
  const tradingSettings = useTradeStore(selectActiveTradingSettings);
  const appSettings = useTradeStore((s) => s.appSettings);
  const profile = useTradeStore(selectActiveProfile);
  const profiles = useTradeStore((s) => s.profiles);
  const activeProfileId = useTradeStore((s) => s.activeProfileId);
  const updateTrading = useTradeStore((s) => s.updateTradingSettings);
  const updateApp = useTradeStore((s) => s.updateAppSettings);
  const updateProfile = useTradeStore((s) => s.updateProfile);
  const importState = useTradeStore((s) => s.importState);
  const trades = useTradeStore(selectActiveTrades);
  const seedDemoTrades = useTradeStore((s) => s.seedDemoTrades);
  const switchProfile = useTradeStore((s) => s.switchProfile);
  const addProfile = useTradeStore((s) => s.addProfile);
  const removeProfile = useTradeStore((s) => s.removeProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  const input =
    "mt-2 min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:min-h-0 sm:text-sm";

  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            schemaVersion: 3,
            profiles,
            activeProfileId,
            appSettings,
            exportedAt: new Date().toISOString(),
          },
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
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-8 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Workspace</h1>
        </header>

        <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profiles</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Switch identity to load a separate journal. Each profile keeps its own trades and trading targets.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="block min-w-[200px] flex-1 text-sm text-[var(--text-secondary)]">
              Active profile
              <select
                className={cn(input, "mt-2 cursor-pointer")}
                value={activeProfileId}
                onChange={(e) => switchProfile(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profile.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                const label = window.prompt("Profile display name", `Trader ${profiles.length + 1}`);
                if (label === null) return;
                addProfile(label || undefined);
              }}
              className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
            >
              New profile
            </button>
            <button
              type="button"
              disabled={profiles.length <= 1}
              onClick={() => {
                if (profiles.length <= 1) return;
                const active = profiles.find((p) => p.id === activeProfileId);
                const ok = window.confirm(
                  `Delete profile "${active?.profile.name ?? "?"}" and all of its trades? This cannot be undone.`
                );
                if (ok) removeProfile(activeProfileId);
              }}
              className="rounded-md border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/18 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete current profile
            </button>
          </div>
        </section>

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
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Theme</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["dark", "light"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateApp({ theme: mode })}
                    className={cn(
                      "rounded px-3 py-2 text-xs font-semibold capitalize transition",
                      appSettings.theme === mode
                        ? "bg-[var(--accent)] text-[var(--accent-on-accent)]"
                        : "border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-secondary)]"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
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
                        ? "bg-[var(--accent)] text-[var(--accent-on-accent)]"
                        : "border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-secondary)]"
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
              className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
            >
              Export JSON backup
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
            >
              Export trades CSV
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
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
              className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--fx-10)]"
            >
              Load demo trades
            </button>
          </div>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Imports merge trading/app settings when present. Full backups include every profile and its trades.
            Legacy backups (single journal) apply to the profile that is active when you import.
          </p>
        </section>

        <ProfileForm profile={profile} onSave={updateProfile} onCancel={() => {}} embedded />
      </div>
    </div>
    </AppShell>
  );
}
