import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> },
) {
  try {
    const { participantId } = await params;
    const body = await req.json();
    const { reward } = body;

    if (typeof reward !== 'number' || reward < 0) {
      return NextResponse.json({ error: 'Recompensa inválida' }, { status: 400 });
    }

    const response = await prisma.response.findUnique({ where: { id: participantId } });
    if (!response) {
      return NextResponse.json({ error: 'Participante no encontrado' }, { status: 404 });
    }

    const updated = await prisma.response.update({
      where: { id: participantId },
      data: { reward },
    });

    return NextResponse.json({ id: updated.id, reward: updated.reward });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}