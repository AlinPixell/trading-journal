"use client";

import { useMemo, useState } from "react";
import type { Profile } from "@/types/settings";
import { cn } from "@/lib/cn";

  const inputClass =
    "mt-2 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:text-sm";

interface ProfileFormProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
  embedded?: boolean;
}

export default function ProfileForm({ profile, onSave, onCancel, embedded }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [tradingStyle, setTradingStyle] = useState(profile.tradingStyle);
  const [riskFocus, setRiskFocus] = useState(profile.riskFocus);
  const [bio, setBio] = useState(profile.bio);

  const hasChanges = useMemo(
    () =>
      name !== profile.name ||
      tradingStyle !== profile.tradingStyle ||
      riskFocus !== profile.riskFocus ||
      bio !== profile.bio,
    [bio, name, profile.bio, profile.name, profile.riskFocus, profile.tradingStyle, riskFocus, tradingStyle]
  );

  const fields = (
    <div className="space-y-4">
      <label className="block text-sm text-[var(--text-secondary)]">
        Name
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm text-[var(--text-secondary)]">
        Trading style
        <input className={inputClass} value={tradingStyle} onChange={(e) => setTradingStyle(e.target.value)} />
      </label>
      <label className="block text-sm text-[var(--text-secondary)]">
        Risk focus
        <input className={inputClass} value={riskFocus} onChange={(e) => setRiskFocus(e.target.value)} />
      </label>
      <label className="block text-sm text-[var(--text-secondary)]">
        Bio
        <textarea className={cn(inputClass, "min-h-[120px]")} rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
      </label>
    </div>
  );

  if (embedded) {
    return (
      <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profile</h2>
        <div className="mt-5">{fields}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={!hasChanges}
            onClick={() => onSave({ name, tradingStyle, riskFocus, bio })}
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] disabled:opacity-45"
          >
            Save profile
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] pt-8 text-[var(--text-primary)] sm:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Profile</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your trading profile</h1>
        </header>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">{fields}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--bg-raised)_92%,transparent)] px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] sm:w-auto"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!hasChanges}
            onClick={() => onSave({ name, tradingStyle, riskFocus, bio })}
            className="w-full rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-on-accent)] disabled:opacity-45 sm:w-auto"
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
