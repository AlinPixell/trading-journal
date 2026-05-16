"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

export type NewProfileKind = "demo" | "live" | "backtesting";

const KIND_OPTIONS: { id: NewProfileKind; label: string; hint: string }[] = [
  { id: "live", label: "Live", hint: "Real-money journal" },
  { id: "demo", label: "Demo", hint: "Practice account" },
  { id: "backtesting", label: "Backtesting", hint: "Replay / research" },
];

export function formatNewProfileName(kind: NewProfileKind, optionalLabel: string): string {
  const prefix = kind === "live" ? "LIVE" : kind === "demo" ? "DEMO" : "BACKTESTING";
  const tail = optionalLabel.trim();
  if (!tail) return prefix;
  return `${prefix} - ${tail}`;
}

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:min-h-0 sm:text-sm";

type NewProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (displayName: string) => void;
};

export function NewProfileModal({ open, onOpenChange, onCreate }: NewProfileModalProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [kind, setKind] = useState<NewProfileKind>("live");
  const [suffix, setSuffix] = useState("");

  useEffect(() => {
    if (open) {
      setKind("live");
      setSuffix("");
    }
  }, [open]);

  const previewName = useMemo(() => formatNewProfileName(kind, suffix), [kind, suffix]);

  const submit = () => {
    onCreate(previewName);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
        <Dialog.Content asChild>
          <motion.div
            className={cn(
              "fixed z-50 max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-24px))] w-[min(96vw,440px)] overflow-y-auto rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-raised)_88%,transparent)] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl focus:outline-none",
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            )}
            initial={animations ? { opacity: 0, scale: 0.96, y: 8 } : false}
            animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <Dialog.Title className="pr-10 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              New profile
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-[var(--text-secondary)]">
              Pick how you use this journal. Add an optional label — the profile name updates automatically.
            </Dialog.Description>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)] sm:min-h-0 sm:min-w-0 sm:p-2.5"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Profile type</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {KIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setKind(opt.id)}
                      className={cn(
                        "flex flex-1 flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition sm:min-w-[120px] sm:flex-none",
                        kind === opt.id
                          ? "border-[color-mix(in_srgb,var(--accent)_55%,transparent)] bg-[var(--fx-07)] shadow-[inset_0_0_0_1px_var(--border)]"
                          : "border-[var(--border-soft)] bg-[var(--fx-05)] hover:bg-[var(--fx-08)]",
                      )}
                    >
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{opt.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-sm text-[var(--text-secondary)]">
                Optional name
                <input
                  type="text"
                  className={inputClass}
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="e.g. Main, FTMO, March replay"
                  autoComplete="off"
                />
              </label>

              <div className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Profile name
                </p>
                <p className="mt-1 font-mono text-sm font-medium text-[var(--text-primary)]">{previewName}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--border-soft)] pt-5">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--fx-10)]"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={submit}
                className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] shadow-[0_-1px_12px_var(--accent-glow)] transition hover:opacity-95"
              >
                Create profile
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
