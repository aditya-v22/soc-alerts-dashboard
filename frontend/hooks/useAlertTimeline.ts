import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AlertTimeline } from '@/types/alert';

export function useAlertTimeline(days = 30) {
  return useQuery<AlertTimeline[]>({
    queryKey: ['alert-timeline', days],
    queryFn: async () => {
      const res = await api.get(`/alerts/timeline?days=${days}`);
      return res.data;
    },
  });
}
