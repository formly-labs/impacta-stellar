'use client';

import { PollarProvider } from '@pollar/react';
import { PropsWithChildren, Suspense } from 'react';
import { WalletGuard } from './components/WalletGuard';
import { WalletHeader } from './components/WalletHeader';
import '@pollar/react/styles.css';

export default function WalletLayout({ children }: PropsWithChildren) {
  return (
    <Suspense>
      <PollarProvider
        config={{
          baseUrl: process.env.NEXT_PUBLIC_POLLAR_BASE_URL!,
          apiKey: process.env.NEXT_PUBLIC_POLLAR_API_KEY!,
        }}
      >
        <WalletGuard>
          <div className="flex h-dvh flex-col overflow-hidden">
            <WalletHeader />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </WalletGuard>
      </PollarProvider>
    </Suspense>
  );
}
