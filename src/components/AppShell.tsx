"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardCheck, Cpu, Droplet, LayoutDashboard, LogOut, MessageCircle } from "lucide-react";
import { profile } from "@/data/persona";

const nav = [
  { href: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/coach/", label: "Coach", short: "Coach", icon: MessageCircle },
  { href: "/check-in/", label: "Weekly check-in", short: "Check-in", icon: ClipboardCheck },
  { href: "/blood-work/", label: "Blood work", short: "Bloods", icon: Droplet },
  { href: "/engine/", label: "How it works", short: "Engine", icon: Cpu },
];

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
        <div className="mt-auto flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
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

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {nav.map(({ href, short, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive(href) ? "text-accent" : "text-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {short}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
