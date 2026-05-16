"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TradeEditorForm } from "@/components/trade/TradeEditorForm";
import { usePersistHydration } from "@/hooks/usePersistHydration";
import { createTradeFromProfitOnly } from "@/lib/tradeHelpers";
import { selectActiveTradingSettings, useTradeStore } from "@/store/useTradeStore";

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function NewTradeDetailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = usePersistHydration();
  const addTrade = useTradeStore((s) => s.addTrade);
  const defaultPair = useTradeStore((s) => selectActiveTradingSettings(s).defaultPair);

  const tradeDateParam = searchParams.get("date");
  /** Snapshot settings at seed time only — do not depend on balance here or `trade` identity changes reset the editor. */
  const seedTrade = useMemo(() => {
    const state = useTradeStore.getState();
    const ts = selectActiveTradingSettings(state);
    const tradeDate =
      tradeDateParam && /^\d{4}-\d{2}-\d{2}$/.test(tradeDateParam)
        ? tradeDateParam
        : format(new Date(), "yyyy-MM-dd");
    return createTradeFromProfitOnly({
      id: newId(),
      pnl: 0,
      defaultPair,
      accountBalance: ts.accountBalance,
      autoCalculations: state.appSettings.autoCalculations,
      tradeDate,
    });
  }, [tradeDateParam, defaultPair]);

  if (!hydrated) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 py-16">
          <p className="text-sm text-[var(--text-muted)]">Loading journal…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TradeEditorForm
        trade={seedTrade}
        variant="detailed"
        isNew
        onSave={(t) => {
          const res = addTrade(t);
          if (!res.ok) {
            alert(res.error ?? "Could not add trade.");
            return false;
          }
          return true;
        }}
        onCancel={() => router.push("/")}
      />
    </AppShell>
  );
}
