import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// PATCH /api/forms/[id]/archive — toggle archive status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isArchived } = body;

    if (typeof isArchived !== 'boolean') {
      return NextResponse.json({ error: 'isArchived (boolean) requerido' }, { status: 400 });
    }

    const updated = await prisma.form.update({
      where: { id },
      data: { isArchived },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}
