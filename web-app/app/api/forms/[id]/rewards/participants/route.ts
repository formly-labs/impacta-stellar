import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

const VALID_SORT = ['aiScore', 'reward', 'respondedAt'] as const;
const VALID_ORDER = ['asc', 'desc'] as const;

type SortField = (typeof VALID_SORT)[number];
type SortOrder = (typeof VALID_ORDER)[number];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slugOrId } = await params;
    const { searchParams } = new URL(req.url);

    const sort = (VALID_SORT.includes(searchParams.get('sort') as SortField)
      ? searchParams.get('sort')
      : 'aiScore') as SortField;

    const order = (VALID_ORDER.includes(searchParams.get('order') as SortOrder)
      ? searchParams.get('order')
      : 'desc') as SortOrder;

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));
    const status = searchParams.get('status');

    const form = await prisma.form.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
    }

    const where = {
      formId: form.id,
      ...(status === 'pending' || status === 'paid' ? { rewardStatus: status } : {}),
    };

    const orderBy =
      sort === 'respondedAt'
        ? { createdAt: order }
        : sort === 'aiScore'
          ? { aiScore: order }
          : { reward: order };

    const [responses, total] = await Promise.all([
      prisma.response.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.response.count({ where }),
    ]);

    const participants = responses.map((r) => ({
      id: r.id,
      walletAddress: r.walletAddress ?? 'Anónimo',
      name: null,
      respondedAt: r.createdAt.toISOString(),
      aiScore: r.aiScore ?? 0,
      reward: r.reward ?? 0,
      status: (r.rewardStatus ?? 'pending') as 'pending' | 'paid',
    }));

    return NextResponse.json({
      participants,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}