import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// DELETE /api/workspaces/[id]/members/[walletAddress] - Eliminar un miembro del workspace
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; walletAddress: string }> }
) {
  try {
    const { id: workspaceId, walletAddress } = await params;
    const { searchParams } = new URL(req.url);
    const requestorAddress = searchParams.get('requestorAddress');

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

    // Verificar permisos
    if (requestorAddress) {
      const isOwner = workspace.ownerAddress === requestorAddress;
      const isSelf = requestorAddress === walletAddress;
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          walletAddress: requestorAddress,
          permission: 'EDITOR',
        },
      });

      // Solo el owner, miembros con permiso EDITOR, o el mismo usuario pueden eliminar
      if (!isOwner && !member && !isSelf) {
        return NextResponse.json(
          { error: 'No tienes permiso para eliminar este miembro' },
          { status: 403 }
        );
      }
    }

    // Verificar si el miembro existe
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_walletAddress: {
          workspaceId,
          walletAddress,
        },
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Miembro no encontrado en este workspace' },
        { status: 404 }
      );
    }

    // Eliminar el miembro
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_walletAddress: {
          workspaceId,
          walletAddress,
        },
      },
    });

    return NextResponse.json({ message: 'Miembro eliminado correctamente' });
  } catch (error) {
    console.error('Error removing member from workspace:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el miembro del workspace' },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/[id]/members/[walletAddress] - Actualizar permisos de un miembro
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; walletAddress: string }> }
) {
  try {
    const { id: workspaceId, walletAddress } = await params;
    const body: { permission: 'VIEWER' | 'EDITOR'; requestorAddress?: string } = await req.json();
    const { permission, requestorAddress } = body;

    if (!permission) {
      return NextResponse.json(
        { error: 'El permiso es obligatorio' },
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

    // Verificar permisos (solo el owner o miembros con permiso EDITOR pueden actualizar permisos)
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
          { error: 'No tienes permiso para actualizar los permisos de este miembro' },
          { status: 403 }
        );
      }
    }

    // Actualizar el permiso
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
  } catch (error) {
    console.error('Error updating member permission:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el permiso del miembro' },
      { status: 500 }
    );
  }
}