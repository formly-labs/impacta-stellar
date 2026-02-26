import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// GET /api/forms/[id]/export/xlsx?ownerAddress=...
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

    const header = ['walletAddress', 'createdAt', ...form.fields.map((f) => f.label)];

    const rows = form.responses.map((response) => {
      const answers = response.answers as Record<string, string | string[]>;
      const fieldValues = form.fields.map((field) => {
        const value = answers[field.id];
        if (Array.isArray(value)) return value.join('; ');
        return value ?? '';
      });
      return [response.walletAddress ?? '', response.createdAt.toISOString(), ...fieldValues];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="responses-${form.slug}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exportando XLSX:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}