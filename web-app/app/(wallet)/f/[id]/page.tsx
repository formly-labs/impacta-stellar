import { prisma } from '@/lib/db';
import type { Metadata } from 'next';
import PublicSurveyWizard from './PublicSurveyWizard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugOrId } = await params;
  
  const form = await prisma.form.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
    select: { title: true, description: true },
  });
  
  return {
    title: form ? `${form.title} — Formly` : 'Encuesta — Formly',
    description: form?.description || 'Responde esta encuesta en Formly',
  };
}

export default async function PublicSurveyPage({ params }: PageProps) {
  const { id: slugOrId } = await params;
  
  const form = await prisma.form.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      isActive: true,
      isArchived: true,
      fields: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          options: true,
        },
      },
    },
  });
  
  console.log(form);
  
  // Not found
  if (!form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Encuesta no encontrada
          </h1>
          <p className="text-gray-500">
            El enlace que seguiste no corresponde a ninguna encuesta existente.
          </p>
        </div>
      </div>
    );
  }
  
  // Not available (inactive or archived)
  if (!form.isActive || form.isArchived) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-yellow-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Encuesta no disponible
          </h1>
          <p className="text-gray-500">
            Esta encuesta ya no está aceptando respuestas en este momento.
          </p>
        </div>
      </div>
    );
  }
  
  // No fields
  if (form.fields.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Encuesta sin preguntas
          </h1>
          <p className="text-gray-500">
            Esta encuesta aún no tiene preguntas configuradas.
          </p>
        </div>
      </div>
    );
  }
  
  // Strip internal flags before passing to client
  const { isActive: _, isArchived: __, ...publicData } = form;
  
  return <PublicSurveyWizard survey={publicData} />;
}
