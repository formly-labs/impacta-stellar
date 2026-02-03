import { prisma } from '@/lib/db';
import { FormUpdateInput } from '@/types';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body: FormUpdateInput = await req.json();
    const { id } = await params;
    
    const { title, description, fields } = body;
    
    const updatedForm = await prisma.$transaction(async (tx) => {
      
      await tx.field.deleteMany({ where: { formId: id } });
      
      const fieldsToCreate = fields?.map(({ type, label, placeholder, required }) => ({
        type,
        label,
        placeholder: placeholder || '',
        required: required ?? false,
      }));
      
      return await tx.form.update({
        where: { id },
        data: {
          title,
          description,
          fields: {
            create: fieldsToCreate,
          },
        },
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
    const { id } = await params;
    
    const form = await prisma.form.findUnique({
      where: { id: id },
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.form.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Eliminado con éxito' });
}
