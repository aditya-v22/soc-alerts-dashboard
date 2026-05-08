import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AlertStats } from '@/types/alert';

export function useAlertStats() {
  return useQuery<AlertStats>({
    queryKey: ['alert-stats'],
    queryFn: async () => {
      const res = await api.get('/alerts/stats');
      return res.data;
    },
  });
}
