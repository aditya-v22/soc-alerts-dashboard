import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertFilters } from '@/types/alert';

function paramsToFilters(params: URLSearchParams): AlertFilters {
  return {
    page: Number(params.get('page') || 1),
    limit: Number(params.get('limit') || 25),
    sortBy: (params.get('sortBy') as AlertFilters['sortBy']) || 'timestamp',
    sortOrder: (params.get('sortOrder') as AlertFilters['sortOrder']) || 'desc',
    severity: params.get('severity') || undefined,
    status: params.get('status') || undefined,
    category: params.get('category') || undefined,
    source: params.get('source') || undefined,
    from: params.get('from') || undefined,
    to: params.get('to') || undefined,
    search: params.get('search') || undefined,
  };
}

function filtersToParams(filters: AlertFilters, selectedId?: string | null): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  if (selectedId) params.set('selected', selectedId);
  return params;
}

export function useAlertFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoized — paramsToFilters runs on every render and the result is used
  // as TanStack Query key, so referential stability prevents unnecessary refetches
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const selectedId = searchParams.get('selected');

  const [panelMode, setPanelMode] = useState<'overlay' | 'sticky'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('panel_mode') as 'overlay' | 'sticky') || 'overlay';
    }
    return 'overlay';
  });

  const setFilters = useCallback((newFilters: AlertFilters) => {
    const params = filtersToParams(newFilters, selectedId);
    router.push(`/alerts?${params.toString()}`, { scroll: false });
  }, [router, selectedId]);

  const setSelectedId = useCallback((id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('selected', id);
    else params.delete('selected');
    router.push(`/alerts?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const setPanelModeAndPersist = useCallback((mode: 'overlay' | 'sticky') => {
    setPanelMode(mode);
    localStorage.setItem('panel_mode', mode);
  }, []);

  return {
    filters,
    selectedId,
    panelMode,
    setFilters,
    setSelectedId,
    setPanelMode: setPanelModeAndPersist,
  };
}
