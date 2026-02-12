"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { Sparkles, Zap, Shield } from "lucide-react";
import { ConnectButton, useWallet, WalletProvider, NetworkType } from "stellar-wallet-kit";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const { account, isConnected } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isConnected) {
      // Obtener la URL de redirección del query param
      const redirectTo = searchParams.get('redirectTo');

      // Si hay una URL de redirección, ir ahí, sino al dashboard
      if (redirectTo) {
        router.push(decodeURIComponent(redirectTo));
      } else {
        router.push("/dashboard");
      }
    }
  }, [isConnected, router, searchParams]);

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
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Conecta tu wallet para continuar
            </p>
          </div>

          {/* Wallet connect button */}
          <div className="w-full">
            {!isConnected ? (
              <div className="w-full [&>button]:w-full [&>button]:rounded-lg [&>button]:px-6 [&>button]:py-3 [&>button]:font-semibold [&>button]:transition-all">
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center rounded-lg bg-green-50 border border-green-200 px-6 py-3">
                  <p className="text-green-600 text-sm font-semibold">
                    Conexión exitosa
                  </p>
                  <p className="text-gray-500 text-xs truncate mt-1">
                    {account?.address}
                  </p>
                </div>
                <Link
                  href={searchParams.get('redirectTo') ? decodeURIComponent(searchParams.get('redirectTo')!) : "/dashboard"}
                  className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-all hover:bg-primary-600"
                >
                  Continuar
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Al conectar, aceptas nuestros{" "}
              <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">
                Términos
              </Link>{" "}
              y{" "}
              <Link href="#" className="font-medium text-primary underline-offset-2 hover:underline">
                Política de privacidad
              </Link>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <WalletProvider
        config={{
          network: NetworkType.TESTNET,
          autoConnect: true,
        }}
      >
        <LoginContent />
      </WalletProvider>
    </Suspense>
  );
}
