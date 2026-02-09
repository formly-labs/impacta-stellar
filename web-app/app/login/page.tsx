"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Zap, Shield, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [isCreator, setIsCreator] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 flex-col overflow-hidden bg-linear-to-br from-primary via-primary-600 to-primary-700 p-12 lg:flex">
        <div className="relative z-10 mb-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Formly"
              width={32}
              height={32}
            />
            <span className="text-xl font-semibold text-white">Formly</span>
          </Link>
        </div>

        {/* Main content - Centered vertically */}
        <div className="relative z-10 my-auto">
          <h1 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
            Verified data.
            <br />
            Fair payments.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/90">
            Connect your wallet to start creating forms or earning from contributions.
          </p>
          
          {/* Features */}
          <div className="mt-12 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="text-sm text-white">
                <div className="font-semibold">Secure & verified</div>
                <div className="mt-0.5 text-white/80">AI-powered fraud detection</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="text-sm text-white">
                <div className="font-semibold">Instant payments</div>
                <div className="mt-0.5 text-white/80">Get paid in seconds</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-sm text-white">
                <div className="font-semibold">Quality data</div>
                <div className="mt-0.5 text-white/80">Only verified responses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - Fixed at bottom */}
        <div className="relative z-10 mt-auto text-sm text-white/70">
          © {new Date().getFullYear()} Formly. All rights reserved.
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Formly"
                width={52}
                height={52}
                className="h-7 w-7"
              />
              <span className="text-lg font-semibold text-gray-900">Formly</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Connect your wallet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose your role to get started
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setIsCreator(true)}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                isCreator
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              Creator
            </button>
            <button
              onClick={() => setIsCreator(false)}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                !isCreator
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              Contributor
            </button>
          </div>

          {/* Role description */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
            {isCreator ? (
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Creator</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Create forms, collect verified responses, and access quality data. 
                  Set your budget and pay only for verified submissions.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Unlimited forms</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Real-time analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Export data anytime</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Contributor</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Browse available forms, submit responses, and receive instant payments. 
                  Earn rewards for quality contributions.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Instant payouts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Browse all forms</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Track your earnings</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wallet connect button */}
          <button className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-600">
            Connect Stellar wallet
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to our{" "}
              <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
