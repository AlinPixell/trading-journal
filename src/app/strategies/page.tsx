"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StrategiesPlaybookContent } from "@/components/strategies/StrategiesPlaybookContent";

export default function StrategiesPage() {
  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 lg:px-10">
        <StrategiesPlaybookContent />
      </div>
    </AppShell>
  );
}
