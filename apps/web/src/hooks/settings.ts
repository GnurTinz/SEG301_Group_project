import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
export const usePublicSettings = () =>
  useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api<{ siteName: string; commentsEnabled: boolean }>('/public/settings'),
  });
