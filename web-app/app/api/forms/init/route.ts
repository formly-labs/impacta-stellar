import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Función para generar un código corto único
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const { ownerAddress } = await req.json();
    
    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'ownerAddress es requerido' }, 
        { status: 400 }
      );
    }
    
    // Generar un código corto único
    let shortCode = generateShortCode();
    let isUnique = false;
    
    // Verificar que el código sea único
    while (!isUnique) {
      const existing = await prisma.form.findUnique({
        where: { id: shortCode },
      });
      
      if (!existing) {
        isUnique = true;
      } else {
        shortCode = generateShortCode();
      }
    }
    
    // Crear un formulario en estado inicial/draft con el código corto
    const newForm = await prisma.form.create({
      data: {
        id: shortCode,
        title: 'Untitled Form',
        description: '',
        ownerAddress,
        isActive: false, // No activo hasta que se complete
        theme: null,
        rewardPerGoodAnswer: null,
        budget: 0,
      },
    });
    
    return NextResponse.json({ id: newForm.id }, { status: 201 });
  } catch (error) {
    console.error('Error al inicializar formulario:', error);
    return NextResponse.json(
      { error: 'Error al inicializar el formulario' }, 
      { status: 500 }
    );
  }
}
