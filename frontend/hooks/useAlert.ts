import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Alert } from '@/types/alert';

export function useAlert(id: string | null) {
  return useQuery<Alert>({
    queryKey: ['alert', id],
    queryFn: async () => {
      const res = await api.get(`/alerts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
