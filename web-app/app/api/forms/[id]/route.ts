import { prisma } from '@/lib/db';
import { FormUpdateInput } from '@/types';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body: FormUpdateInput = await req.json();
    const { id: slugOrId } = await params;
    
    const { title, description, fields, theme, rewardPerGoodAnswer } = body;
    
    const updatedForm = await prisma.$transaction(async (tx) => {
      const existingForm = await tx.form.findFirst({
        where: {
          OR: [
            { slug: slugOrId },
            { id: slugOrId },
          ],
        },
      });
      
      if (!existingForm) {
        throw new Error('Formulario no encontrado');
      }
      
      await tx.form.update({
        where: { id: existingForm.id },
        data: {
          title,
          description,
          theme,
          rewardPerGoodAnswer,
        },
      });
      
      await tx.field.deleteMany({ where: { formId: existingForm.id } });
      
      if (fields && fields.length > 0) {
        await tx.field.createMany({
          data: fields.map((f) => ({
            formId: existingForm.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder || '',
            required: f.required ?? false,
            options: f.options || [],
            allowOther: f.allowOther ?? false,
          })),
        });
      }
      
      return await tx.form.findUnique({
        where: { id: existingForm.id },
        include: { fields: true },
      });
    });
    
    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slugOrId } = await params;
    
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
      },
    });
    
    if (!form) {
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 },
      );
    }
    
    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = await params;
  
  const form = await prisma.form.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
  });
  
  if (!form) {
    return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
  }
  
  await prisma.form.delete({ where: { id: form.id } });
  return NextResponse.json({ message: 'Eliminado con éxito' });
}
