import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        isActive: true,
        isArchived: true,
        fields: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            type: true,
            label: true,
            placeholder: true,
            required: true,
            options: true,
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 },
      );
    }

    if (!form.isActive || form.isArchived) {
      return NextResponse.json(
        { error: 'Esta encuesta no está disponible actualmente' },
        { status: 403 },
      );
    }

    // Only return public-safe data (strip isActive/isArchived flags)
    const { isActive: _, isArchived: __, ...publicForm } = form;

    return NextResponse.json(publicForm);
  } catch (error) {
    console.error('Error fetching public survey:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
