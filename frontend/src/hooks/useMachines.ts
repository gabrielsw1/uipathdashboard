import { useQuery } from '@tanstack/react-query';
import { machinesApi } from '@/services/api/machines';
import { ODataQueryParams } from '@/types/orchestrator';

export function useMachines(
  queryParams?: ODataQueryParams,
  folderId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['machines', queryParams, folderId],
    queryFn: () => machinesApi.getMachines(queryParams, folderId),
    enabled,
    staleTime: 300000, // 5 minutos
  });
}

export function useMachineById(key: number, folderId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['machine', key, folderId],
    queryFn: () => machinesApi.getMachineById(key, folderId),
    enabled: enabled && !!key,
  });
}

