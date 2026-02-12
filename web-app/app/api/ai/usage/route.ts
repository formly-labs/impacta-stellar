import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

const FREE_LIMIT = 5;

// GET /api/ai/usage?wallet=... — returns current usage count
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'wallet requerida' }, { status: 400 });
  }

  const record = await prisma.aIUsage.findUnique({
    where: { walletAddress: wallet },
    select: { usageCount: true },
  });

  const usageCount = record?.usageCount ?? 0;

  return NextResponse.json({
    usageCount,
    limit: FREE_LIMIT,
    limitReached: usageCount >= FREE_LIMIT,
  });
}

// POST /api/ai/usage — increments usage count for wallet
export async function POST(req: Request) {
  const { wallet } = await req.json() as { wallet: string };

  if (!wallet) {
    return NextResponse.json({ error: 'wallet requerida' }, { status: 400 });
  }

  const record = await prisma.aIUsage.upsert({
    where: { walletAddress: wallet },
    update: { usageCount: { increment: 1 } },
    create: { walletAddress: wallet, usageCount: 1 },
    select: { usageCount: true },
  });

  return NextResponse.json({
    usageCount: record.usageCount,
    limit: FREE_LIMIT,
    limitReached: record.usageCount >= FREE_LIMIT,
  });
}