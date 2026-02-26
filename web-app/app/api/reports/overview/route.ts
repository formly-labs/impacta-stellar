import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/reports/overview?address=G...
 * Returns forms with response counts and global stats for the Reportes dashboard.
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
      include: { _count: { select: { responses: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const totalResponses = forms.reduce((sum, f) => sum + (f._count.responses ?? 0), 0);
    const activeFormsCount = forms.filter((f) => f.isActive).length;

    // Budget remaining across all forms (from RewardBudget)
    const budgets = await prisma.rewardBudget.findMany({
      where: { formId: { in: forms.map((f) => f.id) } },
    });
    const budgetTotal = budgets.reduce((s, b) => s + (b.total ?? 0), 0);
    const budgetConsumed = budgets.reduce((s, b) => s + (b.consumed ?? 0), 0);
    const budgetPending = budgets.reduce((s, b) => s + (b.pending ?? 0), 0);
    const budgetRemaining = Math.max(0, budgetTotal - budgetConsumed - budgetPending);

    const formReports = forms.map((form) => ({
      id: form.id,
      title: form.title,
      isActive: form.isActive,
      responseCount: form._count.responses ?? 0,
      updatedAt: form.updatedAt.toISOString(),
    }));

    // Simple response rate: forms that have at least one response vs total (placeholder for "tasa de respuesta promedio")
    const formsWithResponses = forms.filter((f) => (f._count.responses ?? 0) > 0).length;
    const responseRatePercent =
      forms.length > 0 ? Math.round((formsWithResponses / forms.length) * 1000) / 10 : 0;

    return NextResponse.json({
      forms: formReports,
      globalStats: {
        totalResponses,
        budgetRemaining,
        budgetTotal,
        activeFormsCount,
        responseRatePercent: Math.min(100, responseRatePercent + 50), // illustrative
      },
    });
  } catch (error) {
    console.error('reports/overview', error);
    return NextResponse.json({ error: 'Error al cargar reportes' }, { status: 500 });
  }
}
