import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '../api/client';
export interface Identity {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
}
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        return (await api<Identity>('/auth/me')).data;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 0,
  });
}
