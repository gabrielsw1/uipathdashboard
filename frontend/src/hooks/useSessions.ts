import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/services/api/sessions';
import { SessionFilters, ODataQueryParams } from '@/types/orchestrator';

export function useSessions(
  filters?: SessionFilters,
  queryParams?: ODataQueryParams,
  folderId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['sessions', filters, queryParams, folderId],
    queryFn: () => sessionsApi.getSessions(filters, queryParams, folderId),
    enabled,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

export function useSessionById(key: number, folderId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['session', key, folderId],
    queryFn: () => sessionsApi.getSessionById(key, folderId),
    enabled: enabled && !!key,
  });
}

