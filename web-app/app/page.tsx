import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Coins,
  LineChart,
  Globe2,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { DarkModeToggle } from "@/app/components/DarkModeToggle";
import { MobileNav } from "@/app/components/MobileNav";

const STEPS = [
  {
    icon: Sparkles,
    title: "Create an AI-assisted survey",
    description:
      "Describe what you want to learn. Formly structures the questions so responses are easy to analyze.",
  },
  {
    icon: Coins,
    title: "Participants earn instant rewards",
    description:
      "Every completed survey triggers an on-chain micro-reward on Stellar — fast, low-cost, global.",
  },
  {
    icon: LineChart,
    title: "Get actionable insights in real time",
    description:
      "AI turns open-text answers into structured insights you can act on, no spreadsheets required.",
  },
];

const STELLAR_REASONS = [
  {
    icon: Zap,
    title: "Fast settlement",
    description: "Rewards arrive in seconds, not days.",
  },
  {
    icon: ShieldCheck,
    title: "Low transaction cost",
    description: "Micro-rewards become economically viable at scale.",
  },
  {
    icon: Globe2,
    title: "Global by default",
    description: "Anchor network enables on/off-ramps across regions.",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white transition-colors dark:bg-[#0b1121]">
      {/* Background blob — single, soft, mobile-friendly */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[600px] overflow-hidden">
        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-300/30 blur-[120px] dark:bg-primary-700/25" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-100/60 bg-white/80 backdrop-blur-md transition-colors dark:border-white/5 dark:bg-[#0b1121]/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/formly_2.png"
              alt="Formly"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Formly
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              How it works
            </a>
            <a
              href="#why-stellar"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Stellar
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Features
            </a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <DarkModeToggle />
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              Get started
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <DarkModeToggle />
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-primary-50 px-3 py-1.5 dark:border-primary-700/40 dark:bg-primary-900/30">
            <Sparkles className="h-3.5 w-3.5 text-primary dark:text-primary-300" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-200">
              Powered by Stellar + AI
            </span>
          </div>

          <h1 className="mt-6 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white sm:mt-8 sm:text-5xl lg:text-6xl">
            Validate ideas faster with{" "}
            <span className="text-primary dark:text-primary-300">
              rewarded AI surveys
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:mt-6 sm:text-lg">
            Formly helps startups get higher response rates and turns raw
            feedback into actionable insights — paying participants instantly
            with on-chain micro-rewards.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-600 hover:shadow-lg"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://x.com/formly_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              Follow on X
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            <span>Trusted by</span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> BAF
            </span>
            <span className="flex items-center gap-1.5">★ Stellar</span>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              How Formly works
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              From an idea to validated insights in three steps.
            </p>
          </div>

          <ol className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors dark:border-white/10 dark:bg-white/3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary dark:bg-primary-900/40 dark:text-primary-300">
                      {i + 1}
                    </span>
                    <Icon className="h-5 w-5 text-primary dark:text-primary-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Why Stellar */}
        <section
          id="why-stellar"
          className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20"
        >
          <div className="rounded-3xl border border-primary-100 bg-primary-50/50 p-6 dark:border-primary-900/40 dark:bg-primary-900/10 sm:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-700 shadow-sm dark:bg-white/10 dark:text-primary-200">
                ★ Stellar
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Why we built on Stellar
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                Programmable incentives become economically viable when fees
                are near-zero and settlement is instant.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              {STELLAR_REASONS.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div
                    key={reason.title}
                    className="rounded-2xl bg-white p-5 shadow-sm dark:bg-white/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
                      <Icon className="h-5 w-5 text-primary dark:text-primary-300" />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                      {reason.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {reason.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Built for */}
        <section
          id="features"
          className="mx-auto w-full max-w-4xl px-4 pb-20 pt-4 text-center sm:px-6 sm:pb-28"
        >
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Built for early-stage teams
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Made for startups and product teams validating MVPs and new
            features — without the friction of slow, shallow surveys.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-600 hover:shadow-lg"
            >
              Create your first survey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100/60 px-4 py-8 transition-colors dark:border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
            © 2026 Formly · Built for IMPACTA Bootcamp
          </p>
          <a
            href="https://x.com/formly_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            @formly_ai on X →
          </a>
        </div>
      </footer>
    </div>
  );
}
