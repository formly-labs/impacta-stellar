import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Verify survey exists and is active
    const form = await prisma.form.findUnique({
      where: { id },
      include: { fields: true },
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

    // Validate answers structure
    const answers: Record<string, string | string[]> = body.answers;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Formato de respuestas inválido' },
        { status: 400 },
      );
    }

    // Validate required fields are present
    for (const field of form.fields) {
      if (field.required) {
        const answer = answers[field.id];
        const isEmpty =
          answer === undefined ||
          answer === null ||
          answer === '' ||
          (Array.isArray(answer) && answer.length === 0);

        if (isEmpty) {
          return NextResponse.json(
            { error: `El campo "${field.label}" es obligatorio` },
            { status: 400 },
          );
        }
      }
    }

    // Create response
    const response = await prisma.response.create({
      data: {
        formId: id,
        answers,
      },
    });

    return NextResponse.json(
      { id: response.id, message: 'Respuesta registrada correctamente' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error saving survey response:', error);
    return NextResponse.json(
      { error: 'Error al guardar la respuesta' },
      { status: 500 },
    );
  }
}
