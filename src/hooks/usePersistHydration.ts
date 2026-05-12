"use client";

import { useEffect, useState } from "react";
import { useTradeStore } from "@/store/useTradeStore";

/** Avoid false "not found" before Zustand persist loads from localStorage */
export function usePersistHydration() {
  const [hydrated, setHydrated] = useState(() => useTradeStore.persist.hasHydrated());

  useEffect(() => {
    if (useTradeStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useTradeStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  return hydrated;
}
