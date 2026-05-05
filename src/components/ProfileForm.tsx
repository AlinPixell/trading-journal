"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/trade";

interface ProfileFormProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}

export default function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const router = useRouter();
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

  return (
    <div className="min-h-screen bg-black px-6 pb-24 pt-6 text-slate-200 sm:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Profile editor</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Your trading profile</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Save personal details that inform every trade and keep the journal aligned with your trading style.</p>
        </header>

        <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Trading style</label>
              <input
                value={tradingStyle}
                onChange={(event) => setTradingStyle(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Risk focus</label>
              <input
                value={riskFocus}
                onChange={(event) => setRiskFocus(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Bio</label>
              <textarea
                rows={6}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-6 py-4 backdrop-blur-xl sm:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-4">
          <button
            onClick={onCancel}
            className="rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!hasChanges}
            onClick={() => {
              onSave({ name, tradingStyle, riskFocus, bio });
              router.push("/");
            }}
            className="rounded-3xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-emerald-300"
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
