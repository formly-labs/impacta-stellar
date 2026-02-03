import { prisma } from '@/lib/db';
import { FormCreateInput } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body: FormCreateInput = await req.json();
    const { title, description, ownerAddress, fields } = body;
    
    const newForm = await prisma.form.create({
      data: {
        title,
        description,
        ownerAddress,
        fields: {
          create: fields,
        },
      },
      include: { fields: true },
    });
    
    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el formulario' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ error: 'Address requerida' }, { status: 400 });
  }
  
  const forms = await prisma.form.findMany({
    where: { ownerAddress: address },
    include: { fields: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return NextResponse.json(forms);
}
