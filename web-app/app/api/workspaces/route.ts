import { prisma } from '@/lib/db';
import { WorkspaceCreateInput } from '@/types';
import { NextResponse } from 'next/server';

// POST /api/workspaces - Crear un nuevo workspace
export async function POST(req: Request) {
  try {
    const body: WorkspaceCreateInput = await req.json();
    const { name, description, ownerAddress, linkAccess, linkPermission } = body;

    if (!name || !ownerAddress) {
      return NextResponse.json(
        { error: 'El nombre y la dirección del propietario son obligatorios' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || null,
        ownerAddress,
        linkAccess: linkAccess || 'RESTRICTED',
        linkPermission: linkPermission || 'VIEWER',
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Error al crear el workspace' },
      { status: 500 }
    );
  }
}

// GET /api/workspaces - Obtener todos los workspaces del usuario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerAddress = searchParams.get('ownerAddress');

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'La dirección del propietario es obligatoria' },
        { status: 400 }
      );
    }

    // Obtener workspaces donde el usuario es owner o miembro
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerAddress },
          {
            members: {
              some: {
                walletAddress: ownerAddress,
              },
            },
          },
        ],
      },
      include: {
        members: true,
        forms: {
          select: {
            id: true,
            title: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Error al obtener los workspaces' },
      { status: 500 }
    );
  }
}