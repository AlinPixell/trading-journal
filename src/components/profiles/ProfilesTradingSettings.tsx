"use client";

import { useState } from "react";
import {
  selectActiveTradingSettings,
  useTradeStore,
} from "@/store/useTradeStore";
import { NewProfileModal } from "@/components/profiles/NewProfileModal";
import { cn } from "@/lib/cn";

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:min-h-0 sm:text-sm";

export function ProfilesTradingSettings() {
  const [newProfileOpen, setNewProfileOpen] = useState(false);
  const tradingSettings = useTradeStore(selectActiveTradingSettings);
  const profiles = useTradeStore((s) => s.profiles);
  const activeProfileId = useTradeStore((s) => s.activeProfileId);
  const updateTrading = useTradeStore((s) => s.updateTradingSettings);
  const switchProfile = useTradeStore((s) => s.switchProfile);
  const addProfile = useTradeStore((s) => s.addProfile);
  const removeProfile = useTradeStore((s) => s.removeProfile);

  return (
    <div className="space-y-8">
      <NewProfileModal
        open={newProfileOpen}
        onOpenChange={setNewProfileOpen}
        onCreate={(displayName) => addProfile(displayName)}
      />
      <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profiles</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Switch identity to load a separate journal. Each profile keeps its own trades and trading targets.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="block min-w-[200px] flex-1 text-sm text-[var(--text-secondary)]">
            Active profile
            <select
              className={cn(inputClass, "mt-2 cursor-pointer")}
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
            onClick={() => setNewProfileOpen(true)}
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
              className={inputClass}
              value={tradingSettings.accountBalance}
              onChange={(e) => updateTrading({ accountBalance: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Target amount
            <input
              type="number"
              className={inputClass}
              value={tradingSettings.targetAmount}
              onChange={(e) => updateTrading({ targetAmount: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Risk %
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={tradingSettings.riskPercent}
              onChange={(e) => updateTrading({ riskPercent: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Preferred lot size
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={tradingSettings.preferredLotSize}
              onChange={(e) => updateTrading({ preferredLotSize: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Daily target
            <input
              type="number"
              className={inputClass}
              value={tradingSettings.dailyTarget}
              onChange={(e) => updateTrading({ dailyTarget: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Monthly target
            <input
              type="number"
              className={inputClass}
              value={tradingSettings.monthlyTarget}
              onChange={(e) => updateTrading({ monthlyTarget: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Broker
            <input
              className={inputClass}
              value={tradingSettings.broker}
              onChange={(e) => updateTrading({ broker: e.target.value })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Default pair
            <input
              className={inputClass}
              value={tradingSettings.defaultPair}
              onChange={(e) => updateTrading({ defaultPair: e.target.value })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Default lot size
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={tradingSettings.defaultLotSize}
              onChange={(e) => updateTrading({ defaultLotSize: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm text-[var(--text-secondary)]">
            Leverage
            <input
              type="number"
              className={inputClass}
              value={tradingSettings.leverage}
              onChange={(e) => updateTrading({ leverage: Number(e.target.value) })}
            />
          </label>
        </div>
        <label className="mt-4 block text-sm text-[var(--text-secondary)]">
          Risk management notes
          <textarea
            className={cn(inputClass, "min-h-[88px]")}
            value={tradingSettings.riskManagementNotes}
            onChange={(e) => updateTrading({ riskManagementNotes: e.target.value })}
          />
        </label>
      </section>
    </div>
  );
}
