import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slugOrId } = await params;

    const form = await prisma.form.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
    }

    const budget = await prisma.rewardBudget.upsert({
      where: { formId: form.id },
      create: { formId: form.id },
      update: {},
    });

    const totalWinners = await prisma.response.count({
      where: { formId: form.id, rewardStatus: 'paid' },
    });

    const costPerWinner = totalWinners > 0 ? budget.consumed / totalWinners : 0;

    return NextResponse.json({
      total: budget.total,
      consumed: budget.consumed,
      pending: budget.pending,
      costPerWinner,
      totalWinners,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}