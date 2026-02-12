'use client';

import { PropsWithChildren, Suspense } from 'react';

import { NetworkType, WalletProvider } from 'stellar-wallet-kit';

import { WalletHeader } from './components/WalletHeader';
import { WalletGuard } from './components/WalletGuard';

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
          <div className="flex h-screen flex-col overflow-hidden">
            <WalletHeader />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </WalletGuard>
      </WalletProvider>
    </Suspense>
  );
}
