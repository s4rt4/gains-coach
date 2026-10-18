"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity, Brain, ChefHat, ClipboardCheck, Cpu, Droplet, Ellipsis, Images, LayoutDashboard, LogOut, MessageCircle, X,
} from "lucide-react";
import { profile } from "@/data/persona";
import { useServiceWorker } from "@/lib/pwa";
import { InstallApp } from "./InstallApp";

const nav = [
  { href: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard, tab: true },
  { href: "/coach/", label: "Coach", short: "Coach", icon: MessageCircle, tab: true },
  { href: "/check-in/", label: "Weekly check-in", short: "Check-in", icon: ClipboardCheck, tab: true },
  { href: "/progress/", label: "Progress photos", short: "Progress", icon: Images },
  { href: "/meal-prep/", label: "Meal prep", short: "Meals", icon: ChefHat, tab: true },
  { href: "/blood-work/", label: "Blood work", short: "Bloods", icon: Droplet },
  { href: "/memory/", label: "Coach memory", short: "Memory", icon: Brain },
  { href: "/engine/", label: "How it works", short: "Engine", icon: Cpu },
];
const tabs = nav.filter((n) => n.tab);
const more = nav.filter((n) => !n.tab);

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
        <Activity className="h-5 w-5" strokeWidth={2.75} />
      </span>
      <span className="font-display text-xl font-bold uppercase leading-none">
        Gains<span className="text-accent">Coach</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));
  const [sheet, setSheet] = useState(false);
  useServiceWorker();

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-10 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(href) ? "bg-accent text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto" />
        <InstallApp className="mb-3" />
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-ok font-bold text-accent-ink">
            TW
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="text-xs text-muted">
              {profile.phase} · Week 12
            </p>
          </div>
          <Link href="/login/" aria-label="Sign out" className="ml-auto rounded-lg p-1.5 text-muted transition hover:bg-line hover:text-text">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/85 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          <Link
            href="/login/"
            aria-label="Account"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-ok text-xs font-bold text-accent-ink"
          >
            TW
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {children}
        </main>

        {/* Mobile bottom nav: 4 main tabs + More */}
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {tabs.map(({ href, short, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSheet(false)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive(href) ? "text-accent" : "text-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {short}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSheet((v) => !v)}
            aria-expanded={sheet}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              sheet || more.some((m) => isActive(m.href)) ? "text-accent" : "text-muted"
            }`}
          >
            {sheet ? <X className="h-5 w-5" /> : <Ellipsis className="h-5 w-5" />}
            More
          </button>
        </nav>

        {sheet && (
          <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setSheet(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] rounded-t-2xl border-t border-line bg-surface p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-2">
                {more.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSheet(false)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium ${
                      isActive(href) ? "border-accent/40 bg-accent/12 text-accent" : "border-line bg-surface-2 text-text"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {label}
                  </Link>
                ))}
              </div>
              <InstallApp className="mt-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
