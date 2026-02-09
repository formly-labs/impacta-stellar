import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address requerida' }, { status: 400 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { walletAddress: address },
  });

  if (!profile) {
    return NextResponse.json(null);
  }

  return NextResponse.json(profile);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, firstName, lastName, email, phone } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress requerido' }, { status: 400 });
    }

    const profile = await prisma.userProfile.upsert({
      where: { walletAddress },
      update: { firstName, lastName, email, phone },
      create: { walletAddress, firstName, lastName, email, phone },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al guardar perfil' }, { status: 500 });
  }
}
