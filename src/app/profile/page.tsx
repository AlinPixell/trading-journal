"use client";

import { useTradeStore } from "@/store/useTradeStore";
import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  const profile = useTradeStore((state) => state.profile);
  const updateProfile = useTradeStore((state) => state.updateProfile);

  return <ProfileForm profile={profile} onSave={updateProfile} onCancel={() => window.history.back()} />;
}
