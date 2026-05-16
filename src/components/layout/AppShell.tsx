"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ExternalLink as ExternalLinkIcon,
  History,
  LayoutDashboard,
  List,
  PenTool,
  Plus,
  Settings2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNewTradeModal } from "@/components/layout/NewTradeModal";
import { selectActiveProfile, useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

const mainNavLinks = [
  { href: "/dashboard", label: "Analytics", icon: LayoutDashboard },
  { href: "/", label: "Calendar", icon: CalendarDays },
  { href: "/trades", label: "Trades", icon: List },
  { href: "/backtesting", label: "Backtesting", icon: History },
  { href: "/analysis", label: "Analysis", icon: PenTool },
  { href: "/strategies", label: "Strategies", icon: BookOpen },
  { href: "/profiles", label: "Profiles", icon: Users },
];

const settingsNavLink = { href: "/settings", label: "Settings", icon: Settings2 } as const;

const externalToolLinks = [
  { href: "https://www.tradingview.com/chart/iFDk2ZFI/", label: "TradingView" },
  { href: "https://app.fxreplay.com/en-US/auth/testing/dashboard", label: "FX Replay" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const profileName = useTradeStore((s) => selectActiveProfile(s).name);
  const { openNewTrade } = useNewTradeModal();

  const { href: settingsHref, label: settingsLabel, icon: SettingsIcon } = settingsNavLink;
  const settingsActive =
    pathname === settingsHref || pathname.startsWith(`${settingsHref}/`);

  const settingsInner = (
    <Link
      href={settingsHref}
      className={cn(
        "flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors lg:min-h-0 lg:w-full lg:whitespace-normal",
        settingsActive
          ? "bg-[var(--fx-07)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]",
      )}
    >
      <SettingsIcon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
      {settingsLabel}
    </Link>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col lg:h-[100dvh] lg:min-h-0 lg:flex-row">
      <aside className="sticky top-0 z-40 flex min-h-0 shrink-0 flex-col border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--glass)_88%,transparent)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-2xl lg:h-[100dvh] lg:w-[260px] lg:border-b-0 lg:border-r lg:border-[var(--border-soft)] lg:pt-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:flex-col lg:items-stretch">
          <div className="min-w-0 lg:mb-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Trade Journal
            </p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {profileName}
            </p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Local-first
            </p>
          </div>
          <button
            type="button"
            onClick={openNewTrade}
            className={cn(
              "inline-flex min-h-11 shrink-0 origin-center items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] transition-transform duration-200 ease-out sm:min-h-0",
              "bg-[var(--accent)] shadow-[0_-1px_15px_var(--accent-glow)] hover:scale-[1.04] active:scale-[1.02]",
            )}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            <span className="hidden sm:inline">New trade</span>
          </button>
        </div>
        <nav className="-mx-1 flex min-h-0 flex-1 flex-row gap-1 overflow-x-auto px-2 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-3 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:overflow-x-visible lg:px-4 lg:pb-6 [&::-webkit-scrollbar]:hidden">
          {mainNavLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            const sectionTop = href === "/backtesting" || href === "/profiles";
            const Inner = (
              <Link
                href={href}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors lg:min-h-0 lg:w-full lg:whitespace-normal",
                  active
                    ? "bg-[var(--fx-07)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]",
                )}
              >
                <Icon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
                {label}
              </Link>
            );
            return animations ? (
              <motion.div
                key={href}
                whileTap={{ scale: 0.98 }}
                className={cn("lg:w-full", sectionTop && "lg:border-t lg:border-[var(--border-soft)] lg:pt-2")}
              >
                {Inner}
              </motion.div>
            ) : (
              <div key={href} className={cn("lg:w-full", sectionTop && "lg:border-t lg:border-[var(--border-soft)] lg:pt-2")}>
                {Inner}
              </div>
            );
          })}
          <div className="flex shrink-0 gap-1 lg:hidden">
            {externalToolLinks.map(({ href, label }) => {
              const link = (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]",
                  )}
                >
                  <ExternalLinkIcon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
                  {label}
                </a>
              );
              return animations ? (
                <motion.div key={href} whileTap={{ scale: 0.98 }} className="shrink-0">
                  {link}
                </motion.div>
              ) : (
                <div key={href} className="shrink-0">
                  {link}
                </div>
              );
            })}
          </div>
          <div className="hidden min-h-0 flex-1 flex-col justify-center gap-1 px-1 py-2 lg:flex">
            {externalToolLinks.map(({ href, label }) => {
              const link = (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors lg:min-h-0 lg:w-full",
                    "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]",
                  )}
                >
                  <ExternalLinkIcon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
                  {label}
                </a>
              );
              return animations ? (
                <motion.div key={`desk-${href}`} whileTap={{ scale: 0.98 }} className="lg:w-full">
                  {link}
                </motion.div>
              ) : (
                <div key={`desk-${href}`} className="lg:w-full">
                  {link}
                </div>
              );
            })}
          </div>
          <div className="shrink-0 lg:border-t lg:border-[var(--border-soft)] lg:pt-2">
            {animations ? (
              <motion.div key="settings" whileTap={{ scale: 0.98 }} className="lg:w-full">
                {settingsInner}
              </motion.div>
            ) : (
              <div className="lg:w-full">{settingsInner}</div>
            )}
          </div>
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
