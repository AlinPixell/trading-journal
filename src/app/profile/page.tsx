"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useTradeStore } from "@/store/useTradeStore";
import ProfileForm from "@/components/ProfileForm";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useTradeStore((state) => state.profile);
  const updateProfile = useTradeStore((state) => state.updateProfile);

  return (
    <AppShell>
      <ProfileForm profile={profile} onSave={updateProfile} onCancel={() => router.push("/settings")} />
    </AppShell>
  );
}
