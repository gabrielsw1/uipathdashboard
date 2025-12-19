import { useQuery } from '@tanstack/react-query';
import { foldersApi } from '@/services/api/folders';

export function useFolders(enabled: boolean = true) {
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => foldersApi.getFolders(),
    enabled,
    staleTime: 3600000, // 1 hora (folders mudam raramente)
  });
}

export function useFoldersForCurrentUser(enabled: boolean = true) {
  return useQuery({
    queryKey: ['folders', 'current-user'],
    queryFn: () => foldersApi.getFoldersForCurrentUser(),
    enabled,
    staleTime: 3600000, // 1 hora
  });
}

