'use client';

import { PropsWithChildren, Suspense } from 'react';
import { NetworkType, WalletProvider } from 'stellar-wallet-kit';
import { WalletGuard } from './components/WalletGuard';
import { WalletHeader } from './components/WalletHeader';

export default function WalletLayout({ children }: PropsWithChildren) {
  return (
    <Suspense>
      <WalletProvider
        config={{
          network: NetworkType.TESTNET,
          autoConnect: true,
        }}
      >
        <WalletGuard>
          <div className="flex h-dvh flex-col overflow-hidden">
            <WalletHeader />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </WalletGuard>
      </WalletProvider>
    </Suspense>
  );
}
