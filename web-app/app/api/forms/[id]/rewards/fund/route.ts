import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slugOrId } = await params;
    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    const form = await prisma.form.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
    }

    const budget = await prisma.rewardBudget.upsert({
      where: { formId: form.id },
      create: { formId: form.id, total: amount },
      update: { total: { increment: amount } },
    });

    return NextResponse.json(
      {
        newTotal: budget.total,
        transactionId: `stellar_tx_${Date.now()}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}