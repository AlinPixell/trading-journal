import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import NewTradeDetailClient from "@/components/NewTradeDetailClient";

function DetailFallback() {
  return (
    <AppShell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 py-16">
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      </div>
    </AppShell>
  );
}

export default function NewTradeDetailPage() {
  return (
    <Suspense fallback={<DetailFallback />}>
      <NewTradeDetailClient />
    </Suspense>
  );
}
