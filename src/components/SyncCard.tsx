"use client";

import { useState } from "react";
import { Check, Dumbbell, HeartPulse, Loader2, RefreshCw, Utensils } from "lucide-react";
import { connections } from "@/data/persona";
import { Card, CardTitle } from "./ui";

const icons = { hevy: Dumbbell, nutrition: Utensils, health: HeartPulse };

export function SyncCard() {
  const [state, setState] = useState<"idle" | "syncing" | "done">("idle");

  const sync = () => {
    setState("syncing");
    setTimeout(() => setState("done"), 1800);
  };

  return (
    <Card>
      <CardTitle
        action={
          <button
            onClick={sync}
            disabled={state === "syncing"}
            className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {state === "syncing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {state === "syncing" ? "Syncing…" : "Sync now"}
          </button>
        }
      >
        Connected data
      </CardTitle>
      <ul className="space-y-3">
        {connections.map((c) => {
          const Icon = icons[c.id as keyof typeof icons];
          const connected = c.status === "connected";
          return (
            <li key={c.id} className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  connected ? "bg-accent/12 text-accent" : "bg-surface-2 text-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted">
                  {connected ? (state === "done" ? "Up to date · just now" : `${c.detail} · ${c.lastSync}`) : c.detail}
                </p>
              </div>
              {connected ? (
                state === "syncing" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted" />
                ) : (
                  <Check className="h-4 w-4 text-ok" />
                )
              ) : (
                <button className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-text hover:bg-line">Connect</button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
