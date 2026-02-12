import { prisma } from '@/lib/db';
import { WorkspaceUpdateInput } from '@/types';
import { NextResponse } from 'next/server';

// GET /api/workspaces/[id] - Obtener un workspace específico
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: true,
        forms: {
          select: {
            id: true,
            title: true,
            description: true,
            isActive: true,
            isArchived: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos de acceso
    if (walletAddress) {
      const isOwner = workspace.ownerAddress === walletAddress;
      const isMember = workspace.members.some(
        (m) => m.walletAddress === walletAddress
      );
      const hasLinkAccess = workspace.linkAccess === 'ANYONE_WITH_LINK';

      if (!isOwner && !isMember && !hasLinkAccess) {
        return NextResponse.json(
          { error: 'No tienes permiso para acceder a este workspace' },
          { status: 403 }
        );
      }

      // Agregar información de permisos del usuario
      let userPermission: 'VIEWER' | 'EDITOR' | 'OWNER' = 'VIEWER';

      if (isOwner) {
        userPermission = 'OWNER';
      } else if (isMember) {
        const member = workspace.members.find(
          (m) => m.walletAddress === walletAddress
        );
        userPermission = member?.permission || 'VIEWER';
      } else if (hasLinkAccess) {
        userPermission = workspace.linkPermission;
      }

      return NextResponse.json({
        ...workspace,
        userPermission,
      });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Error al obtener el workspace' },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/[id] - Actualizar un workspace
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: WorkspaceUpdateInput & { ownerAddress?: string } = await req.json();
    const { name, description, linkAccess, linkPermission, ownerAddress } = body;

    // Verificar que el workspace existe
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { error: 'Workspace no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el owner o miembros con permiso EDITOR pueden actualizar)
    if (ownerAddress) {
      const isOwner = existingWorkspace.ownerAddress === ownerAddress;
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: id,
          walletAddress: ownerAddress,
          permission: 'EDITOR',
        },
      });

      if (!isOwner && !member) {
        return NextResponse.json(
          { error: 'No tienes permiso para actualizar este workspace' },
          { status: 403 }
        );
      }
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(linkAccess && { linkAccess }),
        ...(linkPermission && { linkPermission }),
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
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el workspace' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[id] - Eliminar un workspace
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const ownerAddress = searchParams.get('ownerAddress');

    // Verificar que el workspace existe
    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace no encontrado' },
        { status: 404 }
      );
    }

    // Solo el owner puede eliminar el workspace
    if (ownerAddress && workspace.ownerAddress !== ownerAddress) {
      return NextResponse.json(
        { error: 'Solo el propietario puede eliminar el workspace' },
        { status: 403 }
      );
    }

    // Eliminar el workspace (los miembros se eliminan en cascada)
    await prisma.workspace.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Workspace eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el workspace' },
      { status: 500 }
    );
  }
}