"use client";

import { AppShell } from "@/components/layout/AppShell";
import { TradesDashboard } from "@/components/trades/dashboard/TradesDashboard";

export default function TradesPage() {
  return (
    <AppShell>
      <TradesDashboard />
    </AppShell>
  );
}
