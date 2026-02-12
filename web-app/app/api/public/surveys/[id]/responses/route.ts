import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: slugOrId } = await params;

    // Find form by ID or slug
    const form = await prisma.form.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      include: {
        fields: {
          orderBy: {
            id: 'asc',
          },
        },
        responses: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 },
      );
    }

    // Format responses to match expected structure
    const formattedResponses = form.responses.map((response) => ({
      id: response.id,
      respondentName: undefined, // Could be added later from UserProfile
      respondentEmail: undefined, // Could be added later from UserProfile
      responses: response.answers as Record<string, string | number | boolean>,
      createdAt: response.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedResponses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Error al obtener las respuestas' },
      { status: 500 },
    );
  }
}

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
