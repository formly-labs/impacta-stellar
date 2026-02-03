'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, Suspense, useEffect } from 'react';

import { NetworkType, useWallet, WalletProvider } from 'stellar-wallet-kit';

const Redirection = () => {
  const { isConnected } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    if (!isConnected && pathname !== '/connect') {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/connect?callbackUrl=${callbackUrl}`);
    }
  }, [ isConnected, pathname, router ]);
  
  return null;
};

export default function WalletLayout({ children }: PropsWithChildren) {
  return (
    <Suspense>
      <WalletProvider
        config={{
          network: NetworkType.TESTNET,
          autoConnect: true,
        }}
      >
        <Redirection />
        {children}
      </WalletProvider>
    </Suspense>
  );
}
