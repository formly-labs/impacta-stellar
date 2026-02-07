'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, AtSign, Equal, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { loadDraft, saveDraft } from '@/lib/onboardingStorage';

const detailsSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
  phone: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^[+]?[\d\s()-]{7,15}$/, 'Ingresa un número de teléfono válido'),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

export default function DetailsStep() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft.firstName || draft.lastName || draft.email || draft.phone) {
      reset({
        firstName: (draft.firstName as string) || '',
        lastName: (draft.lastName as string) || '',
        email: (draft.email as string) || '',
        phone: (draft.phone as string) || '',
      });
    }
  }, [reset]);

  // Listen for save-draft event from shell
  const flushDraft = useCallback(() => {
    const values = getValues();
    saveDraft(values);
  }, [getValues]);

  useEffect(() => {
    window.addEventListener('formly:save-draft', flushDraft);
    return () => window.removeEventListener('formly:save-draft', flushDraft);
  }, [flushDraft]);

  const onSubmit = (data: DetailsFormData) => {
    saveDraft(data);
    router.push('/dashboard/onboarding?step=submit');
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[520px] space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-[2rem] sm:leading-tight">
            Comencemos con tus
            <br />
            datos personales
          </h1>
          <p className="text-gray-500">
            Esto nos ayudará a personalizar tu experiencia.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* First Name */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                {...register('firstName')}
                type="text"
                placeholder="Nombre"
                className={`h-[52px] w-full rounded-xl border bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <Equal className="h-4 w-4 text-gray-300" />
                <span className="text-xs text-red-400">*</span>
              </div>
            </div>
            {errors.firstName && (
              <p className="pl-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                {...register('lastName')}
                type="text"
                placeholder="Apellido"
                className={`h-[52px] w-full rounded-xl border bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <Equal className="h-4 w-4 text-gray-300" />
                <span className="text-xs text-red-400">*</span>
              </div>
            </div>
            {errors.lastName && (
              <p className="pl-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                placeholder="Correo electrónico"
                className={`h-[52px] w-full rounded-xl border bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                  errors.email ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <AtSign className="h-4 w-4 text-gray-300" />
                <span className="text-xs text-red-400">*</span>
              </div>
            </div>
            {errors.email && (
              <p className="pl-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                {...register('phone')}
                type="tel"
                placeholder="Número de teléfono"
                className={`h-[52px] w-full rounded-xl border bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                  errors.phone ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <Phone className="h-4 w-4 text-gray-300" />
                <span className="text-xs text-red-400">*</span>
              </div>
            </div>
            {errors.phone && (
              <p className="pl-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard/onboarding?step=intro')}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg px-2 py-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
