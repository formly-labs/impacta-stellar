import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> },
) {
  try {
    const { id: formSlugOrId, participantId } = await params;
    const body = await req.json();
    const { reward } = body;

    if (typeof reward !== 'number' || reward < 0) {
      return NextResponse.json({ error: 'Recompensa inválida' }, { status: 400 });
    }

    const response = await prisma.response.findUnique({ where: { id: participantId } });
    if (!response) {
      return NextResponse.json({ error: 'Participante no encontrado' }, { status: 404 });
    }

    if (response.rewardStatus === 'paid') {
      return NextResponse.json(
        { error: 'No se puede editar una recompensa ya pagada' },
        { status: 400 },
      );
    }

    const form = await prisma.form.findFirst({
      where: { OR: [{ slug: formSlugOrId }, { id: formSlugOrId }] },
    });
    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
    }

    const oldReward = response.reward ?? 0;
    const delta = reward - oldReward;

    await prisma.$transaction([
      prisma.response.update({
        where: { id: participantId },
        data: { reward, rewardStatus: reward > 0 ? 'pending' : null },
      }),
      prisma.rewardBudget.upsert({
        where: { formId: form.id },
        create: { formId: form.id, pending: Math.max(0, reward) },
        update: { pending: { increment: delta } },
      }),
    ]);

    return NextResponse.json({ id: participantId, reward });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}