import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/forms/[id]/export/csv?ownerAddress=...
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slugOrId } = await params;
    const { searchParams } = new URL(req.url);
    const ownerAddress = searchParams.get('ownerAddress');

    if (!ownerAddress) {
      return NextResponse.json({ error: 'ownerAddress es requerido' }, { status: 400 });
    }

    const form = await prisma.form.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: {
        fields: { orderBy: { id: 'asc' } },
        responses: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
    }

    if (form.ownerAddress !== ownerAddress) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const fieldLabels = form.fields.map((f) => f.label);
    const header = ['walletAddress', 'createdAt', ...fieldLabels];

    const rows = form.responses.map((response) => {
      const answers = response.answers as Record<string, string | string[]>;
      const fieldValues = form.fields.map((field) => {
        const value = answers[field.id];
        if (Array.isArray(value)) return value.join('; ');
        return value ?? '';
      });
      return [
        response.walletAddress ?? '',
        response.createdAt.toISOString(),
        ...fieldValues,
      ];
    });

    const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const csvLines = [header, ...rows].map((row) => row.map(escape).join(','));
    const csv = csvLines.join('\r\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="responses-${form.slug}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exportando CSV:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}