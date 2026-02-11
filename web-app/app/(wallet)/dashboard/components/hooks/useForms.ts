import { useState, useEffect, useCallback } from 'react';
import { FormResponse } from '@/types';

export function useForms(address: string | undefined) {
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [archivedForms, setArchivedForms] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const fetchForms = useCallback(() => {
    if (!address) return;
    fetch(`/api/forms?address=${address}`)
      .then(res => res.json())
      .then(data => {
        setForms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  const fetchArchived = useCallback(() => {
    if (!address) return;
    setLoadingArchived(true);
    fetch(`/api/forms?address=${address}&archived=true`)
      .then(res => res.json())
      .then(data => {
        setArchivedForms(Array.isArray(data) ? data : []);
        setLoadingArchived(false);
      })
      .catch(() => setLoadingArchived(false));
  }, [address]);

  const handleArchive = async (formId: string, archive: boolean) => {
    setArchivingId(formId);
    try {
      const res = await fetch(`/api/forms/${formId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: archive }),
      });
      if (res.ok) {
        if (archive) {
          const moved = forms.find(f => f.id === formId);
          setForms(prev => prev.filter(f => f.id !== formId));
          if (moved) setArchivedForms(prev => [moved, ...prev]);
        } else {
          const moved = archivedForms.find(f => f.id === formId);
          setArchivedForms(prev => prev.filter(f => f.id !== formId));
          if (moved) setForms(prev => [moved, ...prev]);
        }
      }
    } catch {
      // silently fail
    } finally {
      setArchivingId(null);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return {
    forms,
    archivedForms,
    loading,
    loadingArchived,
    archivingId,
    fetchArchived,
    handleArchive,
  };
}
