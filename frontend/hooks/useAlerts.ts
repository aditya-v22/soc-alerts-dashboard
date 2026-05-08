import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AlertFilters, PaginatedAlerts } from '@/types/alert';

export function useAlerts(filters: AlertFilters) {
  return useQuery<PaginatedAlerts>({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === '') return;
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      });
      const res = await api.get(`/alerts?${params.toString()}`);
      return res.data;
    },
  });
}
