"use client";

import { AppShell } from "@/components/layout/AppShell";
import { TradeEditorForm } from "@/components/trade/TradeEditorForm";
import { useTradeStore } from "@/store/useTradeStore";
import { useRouter } from "next/navigation";
import { usePersistHydration } from "@/hooks/usePersistHydration";

interface EditTradeClientProps {
  id: string;
}

export default function EditTradeClient({ id }: EditTradeClientProps) {
  const router = useRouter();
  const hydrated = usePersistHydration();
  const trade = useTradeStore((state) => state.getTradeById(id));
  const updateTrade = useTradeStore((state) => state.updateTrade);

  if (!hydrated) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 py-16">
          <p className="text-sm text-[var(--text-muted)]">Loading journal…</p>
        </div>
      </AppShell>
    );
  }

  if (!trade) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
          <div className="max-w-md rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-8 text-center backdrop-blur-xl">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Trade not found</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">It may have been deleted or the link is invalid.</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#111]"
            >
              Back to calendar
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TradeEditorForm
        trade={trade}
        isNew={false}
        onSave={(t) => updateTrade(t)}
        onCancel={() => router.push("/")}
      />
    </AppShell>
  );
}
