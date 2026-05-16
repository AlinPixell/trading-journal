"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CandlePlaybookItem, StrategyPlaybookItem } from "@/types/playbook";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:min-h-0 sm:text-sm";

const shellClass =
  "fixed z-50 max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-24px))] w-[min(96vw,480px)] overflow-y-auto rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-raised)_88%,transparent)] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl focus:outline-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

type StrategyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: StrategyPlaybookItem | null;
  onCreate: (draft: Omit<StrategyPlaybookItem, "id">) => void;
  onUpdate: (item: StrategyPlaybookItem) => void;
};

export function StrategyPlaybookDialog({
  open,
  onOpenChange,
  initial,
  onCreate,
  onUpdate,
}: StrategyDialogProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [howItWorks, setHowItWorks] = useState("");
  const [whenToUse, setWhenToUse] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setImage(initial.image);
      setHowItWorks(initial.howItWorks);
      setWhenToUse(initial.whenToUse);
    } else {
      setName("");
      setImage("");
      setHowItWorks("");
      setWhenToUse("");
    }
  }, [open, initial]);

  const onPickImage = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const draft = {
      name: name.trim() || "Untitled strategy",
      image,
      howItWorks: howItWorks.trim(),
      whenToUse: whenToUse.trim(),
    };
    if (initial) {
      onUpdate({ ...initial, ...draft });
    } else {
      onCreate(draft);
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
        <Dialog.Content asChild>
          <motion.div
            className={shellClass}
            initial={animations ? { opacity: 0, scale: 0.96, y: 8 } : false}
            animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <Dialog.Title className="pr-10 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {initial ? "Edit strategy" : "Add strategy"}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-[var(--text-secondary)]">
              Diagram or screenshot, how the setup works, and when you reach for it in the session.
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

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-[var(--text-secondary)]">
                Name
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Head and shoulders strategy"
                />
              </label>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Image</p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 text-sm text-[var(--text-muted)]"
                  onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                />
                {image ? (
                  <div className="relative mt-3 overflow-hidden rounded-md border border-[var(--border-soft)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" className="max-h-48 w-full object-contain bg-[var(--fx-04)]" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white"
                      onClick={() => setImage("")}
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
              </div>
              <label className="block text-sm text-[var(--text-secondary)]">
                How it works
                <textarea
                  className={cn(inputClass, "min-h-[100px] resize-y")}
                  value={howItWorks}
                  onChange={(e) => setHowItWorks(e.target.value)}
                  placeholder="Structure, entry rules, invalidation…"
                />
              </label>
              <label className="block text-sm text-[var(--text-secondary)]">
                When to use it
                <textarea
                  className={cn(inputClass, "min-h-[88px] resize-y")}
                  value={whenToUse}
                  onChange={(e) => setWhenToUse(e.target.value)}
                  placeholder="Market regime, session, volatility, higher timeframe context…"
                />
              </label>
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
                {initial ? "Save changes" : "Add strategy"}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type CandleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: CandlePlaybookItem | null;
  onCreate: (draft: Omit<CandlePlaybookItem, "id">) => void;
  onUpdate: (item: CandlePlaybookItem) => void;
};

export function CandlePlaybookDialog({
  open,
  onOpenChange,
  initial,
  onCreate,
  onUpdate,
}: CandleDialogProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [definition, setDefinition] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setImage(initial.image);
      setDefinition(initial.definition);
    } else {
      setName("");
      setImage("");
      setDefinition("");
    }
  }, [open, initial]);

  const onPickImage = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const draft = {
      name: name.trim() || "Untitled pattern",
      image,
      definition: definition.trim(),
    };
    if (initial) {
      onUpdate({ ...initial, ...draft });
    } else {
      onCreate(draft);
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
        <Dialog.Content asChild>
          <motion.div
            className={shellClass}
            initial={animations ? { opacity: 0, scale: 0.96, y: 8 } : false}
            animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <Dialog.Title className="pr-10 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {initial ? "Edit candle / concept" : "Add candle or concept"}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-[var(--text-secondary)]">
              Candlestick shapes, bar types, or other chart ideas you want on hand while journaling.
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

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-[var(--text-secondary)]">
                Name
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bullish engulfing, inside bar, imbalance…"
                />
              </label>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Image</p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 text-sm text-[var(--text-muted)]"
                  onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                />
                {image ? (
                  <div className="relative mt-3 overflow-hidden rounded-md border border-[var(--border-soft)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" className="max-h-48 w-full object-contain bg-[var(--fx-04)]" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white"
                      onClick={() => setImage("")}
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
              </div>
              <label className="block text-sm text-[var(--text-secondary)]">
                Definition
                <textarea
                  className={cn(inputClass, "min-h-[120px] resize-y")}
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  placeholder="What it looks like, what it tends to mean in your process…"
                />
              </label>
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
                {initial ? "Save changes" : "Add entry"}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
