"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TradeForm from "@/components/TradeForm";
import { useTradeStore } from "@/store/useTradeStore";
import type { Trade } from "@/types/trade";

const defaultInitialTrade: Trade = {
  id: "pending",
  pair: "EUR/USD",
  title: "New trade entry",
  side: "long",
  status: "breakeven",
  entryPrice: 1.1000,
  stopPrice: 1.0950,
  takeProfitPrice: 1.1100,
  netROI: 0,
  notes: "",
  personalInfo: "",
  confidence: 75,
  rating: 3,
  tags: [],
  checklist: [],
  screenshots: [],
  createdAt: new Date().toISOString(),
};

export default function NewTradePage() {
  const router = useRouter();
  const addTrade = useTradeStore((state) => state.addTrade);
  const [initialTrade, setInitialTrade] = useState<Trade>(defaultInitialTrade);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const generateId = () => {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    };

    setInitialTrade(prev => ({
      ...prev,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <TradeForm
      trade={initialTrade}
      onSave={(trade) => {
        addTrade(trade);
      }}
      onCancel={() => router.push("/")}
    />
  );
}
