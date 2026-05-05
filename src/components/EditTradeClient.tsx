"use client";

import { useTradeStore } from "@/store/useTradeStore";
import TradeForm from "@/components/TradeForm";
import type { Trade } from "@/types/trade";
import { useRouter } from "next/navigation";

interface EditTradeClientProps {
  id: string;
}

export default function EditTradeClient({ id }: EditTradeClientProps) {
  const router = useRouter();
  const trade = useTradeStore((state) => state.getTradeById(id));
  const updateTrade = useTradeStore((state) => state.updateTrade);

  if (!trade) {
    return (
      <div className="min-h-screen bg-black px-6 py-16 text-center text-slate-200 sm:px-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-black/90 p-10 text-slate-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h1 className="text-3xl font-semibold text-white">Trade not found</h1>
          <p className="mt-4 text-slate-400">This trade either has been removed or the identifier is invalid.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-8 rounded-3xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <TradeForm
      trade={trade}
      onSave={(updated: Trade) => {
        updateTrade(updated);
        router.push("/");
      }}
      onCancel={() => router.push("/")}
    />
  );
}
