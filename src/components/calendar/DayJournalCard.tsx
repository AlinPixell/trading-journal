"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { getDateKey } from "@/lib/utils";
import { selectDayJournal, useTradeStore } from "@/store/useTradeStore";

const inputClass =
  "w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:text-sm";

type DayJournalCardProps = {
  selectedDate: Date;
};

export function DayJournalCard({ selectedDate }: DayJournalCardProps) {
  const dateKey = getDateKey(selectedDate);
  const savedContent = useTradeStore((s) => selectDayJournal(s, dateKey));
  const setDayJournal = useTradeStore((s) => s.setDayJournal);
  const [draft, setDraft] = useState(savedContent);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(savedContent);
    setSavedFlash(false);
  }, [dateKey, savedContent]);

  const hasChanges = useMemo(() => draft !== savedContent, [draft, savedContent]);

  const handleSave = () => {
    setDayJournal(dateKey, draft);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/80 p-4 backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Day journal</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Capture thoughts, lessons, and mindset for this session.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedFlash ? (
            <span className="text-xs font-medium text-profit/90">Saved</span>
          ) : hasChanges ? (
            <span className="text-xs text-[var(--text-muted)]">Unsaved changes</span>
          ) : savedContent.trim() ? (
            <span className="text-xs text-[var(--text-muted)]">Saved</span>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-on-accent)] transition disabled:cursor-not-allowed disabled:opacity-45"
          >
            Save
          </button>
        </div>
      </div>
      <textarea
        className={cn(inputClass, "min-h-[180px] resize-y")}
        placeholder="What went well? What would you do differently tomorrow?"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
    </section>
  );
}
