import { useQuery } from '@tanstack/react-query';
import { robotsApi } from '@/services/api/robots';
import { RobotFilters, ODataQueryParams } from '@/types/orchestrator';

export function useRobots(
  filters?: RobotFilters,
  queryParams?: ODataQueryParams,
  folderId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['robots', filters, queryParams, folderId],
    queryFn: () => robotsApi.getRobots(filters, queryParams, folderId),
    enabled,
    staleTime: 60000, // 1 minuto
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

export function useRobotByKey(key: number, folderId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['robot', key, folderId],
    queryFn: () => robotsApi.getRobotByKey(key, folderId),
    enabled: enabled && !!key,
  });
}

