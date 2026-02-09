import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle2, 
  Shield, 
  Zap, 
  Lock,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Formly"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-semibold text-gray-900">Formly</span>
            </Link>
            
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary">
                Features
              </a>
              <a href="#how" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary">
                How it works
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary">
                Pricing
              </a>
            </div>

            <Link href="/login" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-white via-primary-50/20 to-white px-6 pt-32 pb-24 lg:px-8 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Sparkles className="h-4 w-4" />
              <span>AI-powered verification</span>
            </div>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Verified data.
              <br />
              <span className="bg-linear-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">Fair payments.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              A platform where form creators get quality data and contributors 
              earn instantly for every verified response.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link 
                href="/login" 
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-primary-600 sm:w-auto"
              >
                Create a form
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/login" 
                className="w-full rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-center text-base font-semibold text-gray-900 transition-all hover:border-primary hover:bg-primary-50 hover:text-primary sm:w-auto"
              >
                Browse forms
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Instant payouts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>99% accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced decoration */}
        <div className="absolute inset-x-0 top-1/4 -z-10 h-full w-full">
          <div className="absolute left-1/4 h-[500px] w-[500px] rounded-full bg-primary-200 opacity-20 blur-3xl"></div>
          <div className="absolute right-1/4 top-20 h-[600px] w-[600px] rounded-full bg-primary-300 opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">98%</div>
              <div className="mt-2 text-sm font-semibold text-gray-900">Verified accuracy</div>
              <p className="mt-1 text-xs text-gray-500">Industry-leading precision</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">&lt;2s</div>
              <div className="mt-2 text-sm font-semibold text-gray-900">Payment time</div>
              <p className="mt-1 text-xs text-gray-500">Lightning-fast transactions</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">$0</div>
              <div className="mt-2 text-sm font-semibold text-gray-900">Setup fees</div>
              <p className="mt-1 text-xs text-gray-500">Free to get started</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-4 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700">
              How it works
            </div>
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              Simple process
            </h2>
            <p className="mt-3 text-base text-gray-600">
              From creation to verified data in three easy steps
            </p>
          </div>
          
          <div className="mt-16 space-y-12">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  01
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Create your form
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Design questions, set validation rules, and define your budget. 
                  Launch in minutes with our intuitive builder.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No code required</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  02
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Contributors respond
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  People answer your questions and receive instant payments 
                  through the Stellar network.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                  <Zap className="h-4 w-4" />
                  <span>Instant payouts</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  03
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  AI verifies quality
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Every response is checked for authenticity, consistency, and quality. 
                  Only verified data reaches you.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                  <Shield className="h-4 w-4" />
                  <span>99% fraud detection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-4 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700">
              Features
            </div>
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              Built for trust
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Everything you need to collect reliable data
            </p>
          </div>
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Real-time verification</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Automated fraud detection and quality scoring for every submission.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Instant payments</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Contributors receive funds immediately upon verified submission.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Privacy-first</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Data anonymization and aggregation ensure contributor protection.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Blockchain powered</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Built on Stellar for fast, low-cost, and transparent transactions.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Export anywhere</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Download clean data in any format. Integrate with your tools.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Fair marketplace</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Optional data resale with transparent revenue sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              Transparent pricing
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Start free, scale when you&apos;re ready
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Free */}
            <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-8">
              <div className="inline-block w-fit rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">FREE</div>
              <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-base text-gray-500">/month</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Up to 500 verified responses per month
              </p>
              
              <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Basic AI verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Standard fraud detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Data export (CSV, JSON)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Analytics dashboard</span>
                </li>
              </ul>

              <Link 
                href="/login" 
                className="mt-8 block w-full rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-900 transition-all hover:border-primary hover:bg-primary-50 hover:text-primary"
              >
                Start free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative flex h-full flex-col rounded-xl border-2 border-primary bg-linear-to-br from-primary-50 to-white p-8 pt-12">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg">
                POPULAR
              </div>
              
              <div className="inline-block w-fit rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white">PRO</div>
              <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900">Custom</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Unlimited responses, pay only for verified ones
              </p>
              
              <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Everything in Free, plus</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Advanced ML verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>API access & webhooks</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Data marketplace access</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>Priority support 24/7</span>
                </li>
              </ul>

              <Link 
                href="/login" 
                className="mt-8 block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-white transition-all hover:bg-primary-600"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary-600 to-primary-700 px-6 py-24 lg:px-8">
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white lg:text-5xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-base text-white/90">
            Join thousands of creators and contributors building better data together.
          </p>
          <Link 
            href="/login" 
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary transition-all hover:bg-gray-50"
          >
            Launch your first form
            <ArrowRight className="h-5 w-5" />
          </Link>
          
          {/* Features list */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/95">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Formly"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <span className="text-lg font-semibold text-gray-900">Formly</span>
              </Link>
              <p className="mt-4 text-sm text-gray-600">
                Verified data. Fair payments.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900">Product</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="transition-colors hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="transition-colors hover:text-primary">Pricing</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">API</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">Documentation</a></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900">Company</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li><a href="#" className="transition-colors hover:text-primary">About</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">Careers</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">Contact</a></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900">Legal</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li><a href="#" className="transition-colors hover:text-primary">Privacy</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">Terms</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">Security</a></li>
                <li><a href="#" className="transition-colors hover:text-primary">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Formly. All rights reserved.
              </p>
              
              <div className="flex gap-6">
                <a href="#" className="text-gray-500 transition-colors hover:text-primary">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                
                <a href="#" className="text-gray-500 transition-colors hover:text-primary">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                
                <a href="#" className="text-gray-500 transition-colors hover:text-primary">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
