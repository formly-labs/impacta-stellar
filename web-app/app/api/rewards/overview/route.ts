import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/rewards/overview?address=G...
 * Returns global reward budget and per-form distribution for the dashboard "Gestión de Recompensas".
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address?.trim()) {
    return NextResponse.json({ error: 'address es requerido' }, { status: 400 });
  }

  try {
    const forms = await prisma.form.findMany({
      where: { ownerAddress: address.trim(), isArchived: false },
      include: {
        rewardBudget: true,
        _count: { select: { responses: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let globalTotal = 0;
    let globalConsumed = 0;
    let globalPending = 0;
    let totalPaid = 0;
    let totalAwardedParticipants = 0;

    const surveys = forms.map((form) => {
      const budget = form.rewardBudget;
      const total = budget?.total ?? 0;
      const consumed = budget?.consumed ?? 0;
      const pending = budget?.pending ?? 0;
      const participantCount = form._count.responses;
      const progressPercent = total > 0 ? Math.round((consumed / total) * 100) : 0;

      globalTotal += total;
      globalConsumed += consumed;
      globalPending += pending;
      totalPaid += consumed;
      totalAwardedParticipants += participantCount; // simplified; could count only paid

      return {
        id: form.id,
        title: form.title,
        isActive: form.isActive,
        assigned: total,
        spent: consumed,
        pending,
        participantCount,
        progressPercent,
      };
    });

    const available = globalTotal - globalConsumed - globalPending;

    return NextResponse.json({
      globalBudget: {
        total: globalTotal,
        consumed: globalConsumed,
        pending: globalPending,
        available,
        utilizedPercent: globalTotal > 0 ? Math.round((globalConsumed / globalTotal) * 100) : 0,
      },
      surveys,
      metrics: {
        totalPaid,
        awardedParticipants: totalAwardedParticipants,
        averagePerParticipant: totalAwardedParticipants > 0 ? totalPaid / totalAwardedParticipants : 0,
      },
    });
  } catch (error) {
    console.error('rewards/overview', error);
    return NextResponse.json({ error: 'Error al cargar recompensas' }, { status: 500 });
  }
}
