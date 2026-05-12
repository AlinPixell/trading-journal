"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";

function DashboardBody() {
  const searchParams = useSearchParams();
  const day = searchParams.get("day");
  return <DashboardAnalytics initialDayKey={day} />;
}

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="px-5 pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <Suspense
            fallback={
              <div className="animate-pulse space-y-6 pb-24 pt-8">
                <div className="h-10 w-56 rounded-md bg-[var(--fx-06)]" />
                <div className="h-64 rounded-md bg-[var(--fx-04)]" />
              </div>
            }
          >
            <DashboardBody />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
