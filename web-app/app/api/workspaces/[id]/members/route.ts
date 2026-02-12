import { prisma } from '@/lib/db';
import { AddMemberInput } from '@/types';
import { NextResponse } from 'next/server';

// POST /api/workspaces/[id]/members - Agregar un miembro al workspace
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const body: AddMemberInput & { requestorAddress?: string } = await req.json();
    const { walletAddress, permission, requestorAddress } = body;

    if (!walletAddress || !permission) {
      return NextResponse.json(
        { error: 'La dirección de la wallet y el permiso son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que el workspace existe
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el owner o miembros con permiso EDITOR pueden agregar miembros)
    if (requestorAddress) {
      const isOwner = workspace.ownerAddress === requestorAddress;
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          walletAddress: requestorAddress,
          permission: 'EDITOR',
        },
      });

      if (!isOwner && !member) {
        return NextResponse.json(
          { error: 'No tienes permiso para agregar miembros a este workspace' },
          { status: 403 }
        );
      }
    }

    // Verificar si el miembro ya existe
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_walletAddress: {
          workspaceId,
          walletAddress,
        },
      },
    });

    if (existingMember) {
      // Si ya existe, actualizar el permiso
      const updatedMember = await prisma.workspaceMember.update({
        where: {
          workspaceId_walletAddress: {
            workspaceId,
            walletAddress,
          },
        },
        data: { permission },
      });

      return NextResponse.json(updatedMember);
    }

    // Crear el nuevo miembro
    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        walletAddress,
        permission,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error adding member to workspace:', error);
    return NextResponse.json(
      { error: 'Error al agregar el miembro al workspace' },
      { status: 500 }
    );
  }
}

// GET /api/workspaces/[id]/members - Obtener todos los miembros del workspace
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Verificar que el workspace existe
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace.members);
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json(
      { error: 'Error al obtener los miembros del workspace' },
      { status: 500 }
    );
  }
}