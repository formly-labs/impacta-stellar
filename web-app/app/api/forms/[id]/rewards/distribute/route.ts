import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slugOrId } = await params;

    const form = await prisma.form.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
    }

    const pendingResponses = await prisma.response.findMany({
      where: { formId: form.id, rewardStatus: 'pending', reward: { gt: 0 } },
    });

    if (pendingResponses.length === 0) {
      return NextResponse.json({ distributed: 0, totalAmount: 0, transactions: [] });
    }

    const totalAmount = pendingResponses.reduce((sum, r) => sum + (r.reward ?? 0), 0);

    const budget = await prisma.rewardBudget.findUnique({ where: { formId: form.id } });
    const available = (budget?.total ?? 0) - (budget?.consumed ?? 0) - (budget?.pending ?? 0);

    if (available < totalAmount) {
      return NextResponse.json({ error: 'Presupuesto insuficiente' }, { status: 400 });
    }

    const txHash = `stellar_tx_${Date.now()}`;

    await prisma.$transaction([
      prisma.response.updateMany({
        where: { id: { in: pendingResponses.map((r) => r.id) } },
        data: { rewardStatus: 'paid', rewardTxHash: txHash },
      }),
      prisma.rewardBudget.update({
        where: { formId: form.id },
        data: { consumed: { increment: totalAmount } },
      }),
    ]);

    const transactions = pendingResponses.map((r) => ({
      walletAddress: r.walletAddress ?? 'Anónimo',
      amount: r.reward ?? 0,
      txHash,
    }));

    return NextResponse.json({
      distributed: pendingResponses.length,
      totalAmount,
      transactions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}