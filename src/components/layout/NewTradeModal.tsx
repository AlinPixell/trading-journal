"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { QuickProfitForm } from "@/components/trade/QuickProfitForm";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

type NewTradeModalContextValue = {
  openNewTrade: () => void;
};

const NewTradeModalContext = createContext<NewTradeModalContextValue | null>(
  null,
);

export function useNewTradeModal() {
  const ctx = useContext(NewTradeModalContext);
  if (!ctx) {
    throw new Error(
      "useNewTradeModal must be used within NewTradeModalProvider (see AccentRoot)",
    );
  }
  return ctx;
}

export function NewTradeModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);

  const openNewTrade = useCallback(() => {
    setFormKey((k) => k + 1);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openNewTrade }), [openNewTrade]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
  };

  return (
    <NewTradeModalContext.Provider value={value}>
      {children}
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
          <Dialog.Content asChild>
            <motion.div
              className={cn(
                "fixed z-50 flex min-h-0 flex-col overflow-hidden bg-[color-mix(in_srgb,var(--bg-raised)_82%,transparent)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl focus:outline-none",
                "bottom-0 left-0 right-0 top-auto h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-16px))] w-full translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-x-0 border-b-0 border-t border-[var(--border)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
                "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(84vh,1320px)] sm:w-[min(96vw,480px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md sm:border sm:border-[var(--border)] sm:p-6 sm:pb-6",
              )}
              initial={animations ? { opacity: 0, scale: 0.96, y: 12 } : false}
              animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <Dialog.Title className="sr-only">New trade</Dialog.Title>
              <Dialog.Description className="sr-only">
                Log trade results: date, side, and profit or loss for each fill.
              </Dialog.Description>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)] sm:right-4 sm:top-4 sm:min-h-0 sm:min-w-0 sm:p-2.5"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
              <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
                <QuickProfitForm
                  key={formKey}
                  presentation="modal"
                  onRequestClose={() => setOpen(false)}
                  onSaved={() => setOpen(false)}
                />
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </NewTradeModalContext.Provider>
  );
}
