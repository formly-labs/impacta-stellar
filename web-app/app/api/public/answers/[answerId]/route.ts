import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ answerId: string }> },
) {
  try {
    const { answerId } = await params;
    
    const response = await prisma.response.findUnique({
      where: { id: answerId },
      select: { id: true, createdAt: true },
    });
    
    if (!response) {
      return NextResponse.json(
        { exists: false, submittedAt: null },
        { status: 404 },
      );
    }
    
    return NextResponse.json({
      exists: true,
      submittedAt: new Date(response.createdAt).getTime(),
    });
  } catch (error) {
    console.error('Error fetching answer:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
