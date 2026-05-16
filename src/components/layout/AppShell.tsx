"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BookOpen,
  CalendarDays,
  ExternalLink as ExternalLinkIcon,
  History,
  LayoutDashboard,
  List,
  Menu,
  PenTool,
  Plus,
  Settings2,
  Users,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

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
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className={cn(
              "fixed right-4 z-40 lg:hidden",
              "top-[calc(12px+env(safe-area-inset-top,0px))]",
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--glass)_88%,transparent)] text-[var(--text-primary)] shadow-sm backdrop-blur-2xl transition-colors hover:bg-[var(--fx-05)]",
            )}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md lg:hidden" />
          <Dialog.Content className="fixed left-4 right-4 top-[calc(56px+env(safe-area-inset-top,0px))] z-50 max-h-[min(540px,calc(100dvh-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--bg-raised)] p-3 pt-14 shadow-xl outline-none backdrop-blur-2xl lg:hidden">
            <Dialog.Title className="sr-only">Pages</Dialog.Title>
            <Dialog.Description className="sr-only">
              Navigate to Analytics, Calendar, Trades, and other sections.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-2 top-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)]"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
            <button
              type="button"
              className={cn(
                "mb-3 flex min-h-11 w-full origin-center items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] transition-transform duration-200 ease-out",
                "bg-[var(--accent)] shadow-[0_-1px_15px_var(--accent-glow)] hover:scale-[1.01] active:scale-[1.005]",
              )}
              onClick={() => {
                closeMobileMenu();
                openNewTrade();
              }}
            >
              <Plus className="h-4 w-4 shrink-0" strokeWidth={2.2} />
              New trade
            </button>
            <ul className="flex flex-col gap-1 pb-3">
              {mainNavLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <li key={`mnav-${href}`}>
                    <Link
                      href={href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--fx-07)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul className="flex flex-col gap-1 border-t border-[var(--border-soft)] pt-3 pb-3">
              {externalToolLinks.map(({ href, label }) => (
                <li key={`mext-${href}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]",
                    )}
                    onClick={closeMobileMenu}
                  >
                    <ExternalLinkIcon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--border-soft)] pt-2">
              <Link
                href={settingsHref}
                onClick={closeMobileMenu}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  settingsActive
                    ? "bg-[var(--fx-07)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]",
                )}
              >
                <SettingsIcon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
                {settingsLabel}
              </Link>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <aside className="hidden min-h-0 w-[260px] shrink-0 flex-col border-r border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--glass)_88%,transparent)] backdrop-blur-2xl lg:flex lg:h-[100dvh]">
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
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-visible px-4 pb-6">
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
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-1 px-1 py-2">
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
