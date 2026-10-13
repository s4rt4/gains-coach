"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Droplet, Dumbbell, Loader2, Lock, Mail, MessageCircle, Shield, UserRound } from "lucide-react";

const features = [
  { icon: MessageCircle, title: "A coach that knows your data", detail: "Ask anything, 24/7, by text or voice" },
  { icon: Dumbbell, title: "Synced with Hevy", detail: "Every set and PR, analysed automatically" },
  { icon: Droplet, title: "Blood work, explained", detail: "Know what to raise with your doctor" },
];

const demoEmail = { member: "tom.walker@example.com", admin: "admin@example.com" };

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"member" | "admin">("member");
  const [email, setEmail] = useState(demoEmail.member);
  const [password, setPassword] = useState("demo-password");
  const [loading, setLoading] = useState(false);

  const switchRole = (r: "member" | "admin") => {
    setRole(r);
    setEmail(demoEmail[r]);
  };

  // Prototype only: no real authentication, any credentials continue to the demo account
  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push(role === "admin" ? "/admin/" : "/"), 900);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-surface p-12 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-ok/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-ink">
            <Activity className="h-5 w-5" strokeWidth={2.75} />
          </span>
          <span className="font-display text-2xl font-bold uppercase leading-none">
            Gains<span className="text-accent">Coach</span>
          </span>
        </div>

        <div className="relative my-auto max-w-md">
          <h1 className="font-display text-6xl font-bold uppercase leading-[0.95]">
            Your coach.
            <br />
            <span className="text-accent">Your data.</span>
            <br />
            Every day.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Personal coaching built on your real training, nutrition and health data, at a fraction of the cost of a human coach.
          </p>
          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted">© 2026 Gains Coach · Prototype</p>
      </aside>

      {/* Sign-in form */}
      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-ink">
              <Activity className="h-5 w-5" strokeWidth={2.75} />
            </span>
            <span className="font-display text-2xl font-bold uppercase leading-none">
              Gains<span className="text-accent">Coach</span>
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold uppercase leading-none">Welcome back</h2>
          <p className="mt-2 text-sm text-muted">
            {role === "admin" ? "Manage members, partners and the coach." : <>Sign in to see this week&apos;s coaching.</>}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1">
            {(["member", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                  role === r ? "bg-accent text-accent-ink" : "text-muted hover:text-text"
                }`}
              >
                {r === "member" ? <UserRound className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {r === "member" ? "Member" : "Admin"}
              </button>
            ))}
          </div>

          <form onSubmit={signIn} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-muted">Email</span>
              <span className="mt-1.5 flex h-12 items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-accent">
                <Mail className="h-4 w-4 shrink-0 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                  autoComplete="off"
                />
              </span>
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-xs font-medium text-muted">
                Password
                <span className="text-accent">Forgot password?</span>
              </span>
              <span className="mt-1.5 flex h-12 items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-accent">
                <Lock className="h-4 w-4 shrink-0 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                  autoComplete="off"
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-80"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            New here?{" "}
            <Link href="/" className="font-semibold text-accent hover:underline">
              Start your 7-day free trial
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
