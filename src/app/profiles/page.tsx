"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProfilesTradingSettings } from "@/components/profiles/ProfilesTradingSettings";

export default function ProfilesPage() {
  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-8 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-3xl space-y-8">
          <header>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Profiles</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Identity and trading
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Choose which journal you are working in and tune account defaults for that profile.
            </p>
          </header>
          <ProfilesTradingSettings />
        </div>
      </div>
    </AppShell>
  );
}
