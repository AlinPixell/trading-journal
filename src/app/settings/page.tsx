"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useRef } from "react";
import { selectActiveTrades, useTradeStore } from "@/store/useTradeStore";
import type { CalendarViewMode } from "@/lib/calendarTypes";
import { cn } from "@/lib/cn";

export default function SettingsPage() {
  const appSettings = useTradeStore((s) => s.appSettings);
  const profiles = useTradeStore((s) => s.profiles);
  const activeProfileId = useTradeStore((s) => s.activeProfileId);
  const strategyPlaybook = useTradeStore((s) => s.strategyPlaybook);
  const candlePlaybook = useTradeStore((s) => s.candlePlaybook);
  const updateApp = useTradeStore((s) => s.updateAppSettings);
  const importState = useTradeStore((s) => s.importState);
  const trades = useTradeStore(selectActiveTrades);
  const seedDemoTrades = useTradeStore((s) => s.seedDemoTrades);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            schemaVersion: 4,
            profiles,
            activeProfileId,
            appSettings,
            strategyPlaybook,
            candlePlaybook,
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
    { id: "month", label: "Month" },
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
      </div>
    </div>
    </AppShell>
  );
}
