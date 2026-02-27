import { prisma } from '@/lib/db';
import { FormCreateInput } from '@/types';
import { customAlphabet } from 'nanoid';
import { NextResponse } from 'next/server';

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const generateSlug = customAlphabet(alphabet, 6);

export async function POST(req: Request) {
  try {
    const body: Partial<FormCreateInput> = await req.json();
    const {
      title = 'Untitled Form',
      description = '',
      ownerAddress,
      fields = [],
      theme = null,
      rewardPerGoodAnswer = null,
      workspaceId = null,
      isActive = false,
    } = body;

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'ownerAddress es requerido' },
        { status: 400 },
      );
    }

    let slug = generateSlug();

    while (await prisma.form.findFirst({ where: { slug } })) {
      slug = generateSlug();
    }

    const newForm = await prisma.form.create({
      data: {
        slug,
        title,
        description,
        ownerAddress,
        theme,
        rewardPerGoodAnswer,
        workspaceId,
        isActive,
        budget: 0,
        fields: {
          create: fields.map((f) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder || '',
            required: f.required ?? false,
            options: f.options || [],
            allowOther: f.allowOther ?? false,
          })),
        },
      },
    });

    return NextResponse.json({ id: newForm.id, slug: newForm.slug }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el formulario:', error);
    return NextResponse.json({ error: 'Error al crear el formulario' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const archived = searchParams.get('archived');
  const workspaceId = searchParams.get('workspaceId');

  if (!address) {
    return NextResponse.json({ error: 'Address requerida' }, { status: 400 });
  }

  // archived=true → only archived; archived=false or absent → only non-archived
  const isArchived = archived === 'true';

  // Construir el where para filtrar por workspace
  const whereClause: any = {
    ownerAddress: address,
    isArchived,
  };

  // Si workspaceId es "null", buscar formularios sin workspace
  // Si workspaceId tiene valor, buscar formularios de ese workspace
  // Si workspaceId no está presente, no filtrar por workspace
  if (workspaceId === 'null') {
    whereClause.workspaceId = null;
  } else if (workspaceId) {
    whereClause.workspaceId = workspaceId;
  }

  const forms = await prisma.form.findMany({
    where: whereClause,
    include: {
      fields: true,
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = forms.map(({ _count, ...form }) => ({
    ...form,
    responseCount: _count.responses,
  }));

  return NextResponse.json(serialized);
}
