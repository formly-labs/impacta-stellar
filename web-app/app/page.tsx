import Link from "next/link";
import {
  Zap,
  Link2,
  Grid2x2Check,
  MapPin,
  Diamond,
} from "lucide-react";
import { DarkModeToggle } from "@/app/components/DarkModeToggle";
import { MobileNav } from "@/app/components/MobileNav";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white transition-colors dark:bg-[#0b1121]">
      {/* Page-wide background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary-300/35 blur-[120px] dark:bg-primary-600/20" />
        <div className="absolute -bottom-20 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-300/25 blur-[100px] dark:bg-blue-700/15" />
        <div className="absolute -bottom-24 -right-20 h-[500px] w-[500px] rounded-full bg-primary-400/30 blur-[130px] dark:bg-primary-700/20" />
        <div className="absolute -right-24 top-1/4 h-[300px] w-[300px] rounded-full bg-primary-200/35 blur-[90px] dark:bg-primary-800/20" />
        <div className="absolute -left-16 top-10 h-[250px] w-[250px] rounded-full bg-blue-200/20 blur-[80px] dark:bg-blue-800/15" />
        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100/30 blur-[100px] dark:bg-primary-900/15" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-10 sticky top-0 border-b border-gray-100/60 bg-white/70 backdrop-blur-md transition-colors dark:border-white/5 dark:bg-[#0b1121]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/formly_2.png" alt="Formly" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Formly</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Productos
            </a>
            <a href="#blockchain" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Blockchain
            </a>
            <a href="#ai" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              AI Engine
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Precios
            </a>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-4 md:flex">
            <DarkModeToggle />
            <Link href="/login" className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile: dark mode + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <DarkModeToggle />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1">
        <section className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-16">
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/50 px-5 py-10 shadow-sm backdrop-blur-sm transition-colors dark:border-white/[0.06] dark:bg-white/[0.03] sm:rounded-3xl sm:px-14 sm:py-20">
            {/* Decorative dots top-right */}
            <div className="absolute right-5 top-5 z-10 flex gap-2 sm:right-8 sm:top-8">
              <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-primary-300 dark:bg-primary-500 sm:h-2.5 sm:w-2.5" />
              <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700 sm:h-2.5 sm:w-2.5" />
            </div>

            <div className="relative z-10 flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-16">
              {/* Left content */}
              <div className="flex-1 space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 dark:bg-primary-900/40 sm:px-4 sm:py-1.5">
                  <Diamond className="h-3.5 w-3.5 text-primary dark:text-primary-400 sm:h-4 sm:w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 sm:text-xs">
                    Blockchain &amp; AI Powered
                  </span>
                </div>

                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-[3.5rem]">
                  Formly: Datasets
                  <br />
                  <span className="text-primary dark:text-primary-400">estructurados y</span>
                  <br />
                  <span className="text-primary dark:text-primary-400">trazables</span>
                </h1>

                <p className="max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">
                  Dile adiós a las hojas de excel, usa los datos con propósito.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-600 hover:shadow-lg"
                  >
                    Crear ahora
                    <Zap className="h-4 w-4 fill-white" />
                  </Link>
                  <Link
                    href="#demo"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
                  >
                    Ver Demo
                  </Link>
                </div>

                <div className="flex items-center gap-4 pt-1 sm:gap-6 sm:pt-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 sm:text-[10px]">
                    Trusted by:
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 sm:text-xs">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> BAF
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 sm:text-xs">
                    ★ Stellar
                  </span>
                </div>
              </div>

              {/* Right decorative graphic — visible on mobile as smaller version */}
              <div className="relative mx-auto w-full max-w-[280px] flex-shrink-0 sm:max-w-[320px] lg:mx-0 lg:max-w-none">
                <div className="relative h-52 w-full sm:h-64 lg:h-80 lg:w-80">
                  {/* Purple gradient circle */}
                  <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 opacity-60 blur-sm dark:from-primary-700 dark:to-primary-500 dark:opacity-40 sm:h-44 sm:w-44 lg:h-56 lg:w-56" />

                  {/* IMMUTABLE card */}
                  <div className="absolute left-0 top-4 z-10 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:gap-2.5 sm:px-5 sm:py-3 lg:top-8">
                    <Link2 className="h-4 w-4 text-primary dark:text-primary-400 sm:h-5 sm:w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 sm:text-xs">
                      Immutable
                    </span>
                  </div>

                  {/* AI Structuring Engine card */}
                  <div className="absolute right-0 top-16 z-10 flex flex-col items-center rounded-xl border border-gray-100 bg-white/90 px-5 py-4 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:rounded-2xl sm:px-8 sm:py-6 lg:top-24">
                    <span className="text-2xl font-bold text-primary-300 dark:text-primary-400 sm:text-4xl">AI</span>
                    <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 sm:mt-1 sm:text-[9px] sm:tracking-[0.2em]">
                      Structuring
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 sm:text-[9px] sm:tracking-[0.2em]">
                      Engine
                    </span>
                  </div>

                  {/* Small floating icons */}
                  <div className="absolute bottom-8 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 shadow-md dark:bg-primary-900/50 dark:shadow-black/20 sm:h-10 sm:w-10 sm:rounded-xl lg:bottom-12">
                    <Diamond className="h-4 w-4 text-primary dark:text-primary-400 sm:h-5 sm:w-5" />
                  </div>
                  <div className="absolute left-14 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 shadow-md dark:bg-primary-900/30 dark:shadow-black/20 sm:h-10 sm:w-10 sm:rounded-xl lg:left-20">
                    <Grid2x2Check className="h-4 w-4 text-primary-400 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Version tag bottom-right */}
            <div className="relative z-10 mt-6 text-right sm:mt-8 lg:mt-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 sm:text-[10px]">
                Versión 2.0 / Blockchain
              </span>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-transparent bg-transparent p-5 transition-colors dark:border-white/[0.06] dark:bg-white/[0.03] sm:space-y-4 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/40 sm:h-12 sm:w-12">
                <Grid2x2Check className="h-5 w-5 text-primary dark:text-primary-400 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">Trazabilidad Web3</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Cada dato recolectado queda registrado en la red para una auditoría sin precedentes.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-transparent bg-transparent p-5 transition-colors dark:border-white/[0.06] dark:bg-white/[0.03] sm:space-y-4 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/40 sm:h-12 sm:w-12">
                <MapPin className="h-5 w-5 text-primary dark:text-primary-400 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">IA Estructurante</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Transformamos datos crudos en datasets listos para entrenar modelos de machine learning.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-transparent bg-transparent p-5 transition-colors dark:border-white/[0.06] dark:bg-white/[0.03] sm:space-y-4 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/40 sm:h-12 sm:w-12">
                <Grid2x2Check className="h-5 w-5 text-primary dark:text-primary-400 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">Adiós a Excel</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Superamos los límites de las hojas de cálculo con flujos de datos dinámicos y escalables.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-100/60 px-4 py-6 text-center transition-colors dark:border-white/5 sm:py-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 sm:text-[10px] sm:tracking-[0.25em]">
          © 2026 Formly Tech · Secure Data Ecosystem · Built for IMPACTA BOOTCAMP
        </p>
      </footer>
    </div>
  );
}
