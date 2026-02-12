import { FormResponse, FormUpdateInput } from '@/types';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';

interface FormState {
  formData: FormUpdateInput;
  isLoading: boolean;
  isValidating: boolean;
  isSaving: boolean;
  error: string | null;
  lastUpdate: number;
}

interface FormStore {
  forms: Record<string, FormState>;
  setFormData: (formId: string, data: FormUpdateInput | ((prev: FormUpdateInput) => FormUpdateInput), next?: (data: FormUpdateInput) => void) => void;
  setLoading: (formId: string, loading: boolean) => void;
  setValidating: (formId: string, validating: boolean) => void;
  setSaving: (formId: string, saving: boolean) => void;
  setError: (formId: string, error: string | null) => void;
  setLastUpdate: (formId: string, timestamp: number) => void;
}

const useFormStore = create<FormStore>((set) => ({
  forms: {},
  
  setFormData: (formId, data, next) => set((state) => {
    const formData = {
      ...state.forms[formId],
      formData: typeof data === 'function'
        ? data(state.forms[formId]?.formData || getDefaultFormData())
        : data,
    };
    next?.(formData.formData);
    return ({
      forms: {
        ...state.forms,
        [formId]: formData,
      },
    });
  }),
  
  setLoading: (formId, loading) => set((state) => ({
    forms: {
      ...state.forms,
      [formId]: {
        ...state.forms[formId],
        isLoading: loading,
      },
    },
  })),
  
  setValidating: (formId, validating) => set((state) => ({
    forms: {
      ...state.forms,
      [formId]: {
        ...state.forms[formId],
        isValidating: validating,
      },
    },
  })),
  
  setSaving: (formId, saving) => set((state) => ({
    forms: {
      ...state.forms,
      [formId]: {
        ...state.forms[formId],
        isSaving: saving,
      },
    },
  })),
  
  setError: (formId, error) => set((state) => ({
    forms: {
      ...state.forms,
      [formId]: {
        ...state.forms[formId],
        error,
      },
    },
  })),
  
  setLastUpdate: (formId, timestamp) => set((state) => ({
    forms: {
      ...state.forms,
      [formId]: {
        ...state.forms[formId],
        lastUpdate: timestamp,
      },
    },
  })),
}));

function getDefaultFormData(): FormUpdateInput {
  return {
    id: '',
    isActive: false,
    rewardPerGoodAnswer: 0,
    theme: '',
    workspaceId: '',
    title: '',
    description: '',
    fields: [],
    slug: '',
  };
}

interface UseFormDataReturn {
  formData: FormUpdateInput;
  setFormData: Dispatch<SetStateAction<FormUpdateInput>>;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isSaving: boolean;
  lastUpdate: number;
}

export function useFormData(formId: string | undefined): UseFormDataReturn {
  
  const storeForms = useFormStore((state) => state.forms);
  const storeSetFormData = useFormStore((state) => state.setFormData);
  const storeSetLoading = useFormStore((state) => state.setLoading);
  const storeSetValidating = useFormStore((state) => state.setValidating);
  const storeSetError = useFormStore((state) => state.setError);
  const storeSetLastUpdate = useFormStore((state) => state.setLastUpdate);
  const storeSetSaving = useFormStore((state) => state.setSaving);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const formState = useMemo(() => {
    if (!formId) {
      return {
        formData: getDefaultFormData(),
        isLoading: true,
        isValidating: false,
        isSaving: false,
        error: null,
        lastUpdate: -1,
      };
    }
    const state_form = storeForms[formId];
    return {
      formData: state_form?.formData || getDefaultFormData(),
      isLoading: state_form?.isLoading ?? true,
      isValidating: state_form?.isValidating ?? false,
      isSaving: state_form?.isSaving ?? false,
      error: state_form?.error ?? null,
      lastUpdate: state_form ? state_form?.lastUpdate : -1,
    };
  }, [ storeForms, formId ]);
  
  const fetchFormData = useCallback(async (isRevalidating = false) => {
    if (!formId) {
      return;
    }
    storeSetLastUpdate(formId, 0);
    if (isRevalidating) {
      storeSetValidating(formId, true);
    }
    storeSetError(formId, null);
    
    try {
      const res = await fetch(`/api/forms/${formId}`);
      if (!res.ok) {
        throw new Error('Error al cargar el formulario');
      }
      const data: FormResponse = await res.json();
      if (!isRevalidating) {
        storeSetFormData(formId, {
          id: data.id || '',
          isActive: data.isActive || false,
          rewardPerGoodAnswer: data.rewardPerGoodAnswer || 0,
          theme: data?.theme || '',
          workspaceId: data?.workspaceId || '',
          title: data.title,
          description: data.description || '',
          fields: data.fields || [],
          slug: data.slug || '',
          welcome: (data.welcomeTitle || data.welcomeDescription) ? {
            title: data.welcomeTitle || '',
            description: data.welcomeDescription || '',
          } : undefined,
          ending: (data.endingTitle || data.endingDescription) ? {
            title: data.endingTitle || '',
            description: data.endingDescription || '',
          } : undefined,
        });
      }
      storeSetLastUpdate(formId, Date.now());
    } catch (err) {
      console.error('Error fetching form:', err);
      storeSetError(formId, err instanceof Error ? err.message : 'Error al cargar el formulario');
    } finally {
      storeSetLoading(formId, false);
      storeSetValidating(formId, false);
    }
  }, [ formId, storeSetFormData, storeSetLoading, storeSetValidating, storeSetError, storeSetLastUpdate ]);
  
  const debouncedFetchFormData = useCallback((isRevalidating = false) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      void fetchFormData(isRevalidating);
    }, 800);
  }, [ fetchFormData ]);
  
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (saveDebounceTimerRef.current) {
        clearTimeout(saveDebounceTimerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (formState.lastUpdate === -1) {
      debouncedFetchFormData();
    }
  }, [ debouncedFetchFormData, formState.lastUpdate ]);
  
  const refetch = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await fetchFormData(true);
  }, [ fetchFormData ]);
  
  const formDataRef = useRef(formState.formData);
  formDataRef.current = formState.formData;
  
  const performSave = useCallback(async (data: FormUpdateInput) => {
    if (!formId) return;
    
    storeSetSaving(formId, true);
    try {
      await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await refetch();
    } catch (error) {
      console.error(error);
    } finally {
      storeSetSaving(formId, false);
    }
  }, [ formId, storeSetSaving, refetch ]);
  
  const save = useCallback((data: FormUpdateInput) => {
    if (saveDebounceTimerRef.current) {
      clearTimeout(saveDebounceTimerRef.current);
    }
    
    saveDebounceTimerRef.current = setTimeout(() => {
      void performSave(data);
    }, 400);
  }, [ performSave ]);
  
  const setFormData = useCallback(
    (data: FormUpdateInput | ((prev: FormUpdateInput) => FormUpdateInput)) => {
      if (formId) {
        const withSave = true;
        storeSetFormData(formId, data, withSave ? ((data: FormUpdateInput) => save(data)) : undefined);
      }
    },
    [ formId, save, storeSetFormData ],
  );
  
  return {
    formData: formState.formData,
    setFormData,
    isLoading: formState.isLoading ?? true,
    isValidating: formState.isValidating ?? false,
    error: formState.error ?? null,
    refetch,
    isSaving: formState.isSaving ?? false,
    lastUpdate: formState.lastUpdate ?? 0,
  };
}
