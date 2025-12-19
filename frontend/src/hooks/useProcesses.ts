import { useQuery } from '@tanstack/react-query';
import { processesApi } from '@/services/api/processes';
import { ProcessFilters, ODataQueryParams } from '@/types/orchestrator';

export function useProcesses(
  filters?: ProcessFilters,
  queryParams?: ODataQueryParams,
  enabled: boolean = true
) {
  // VALIDAÇÃO: Não fazer requisição se folderId não estiver definido
  // Isso evita buscar processos de todas as pastas quando nenhuma pasta está selecionada
  const hasFolderId = !!filters?.folderId;
  const shouldEnable = enabled && hasFolderId;

  return useQuery({
    queryKey: ['processes', filters, queryParams],
    queryFn: () => processesApi.getProcesses(filters, queryParams),
    enabled: shouldEnable,
    staleTime: 300000, // 5 minutos (processos mudam menos frequentemente)
  });
}

export function useProcessByKey(key: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['process', key],
    queryFn: () => processesApi.getProcessByKey(key),
    enabled: enabled && !!key,
  });
}

export function useProcessVersions(key: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['process-versions', key],
    queryFn: () => processesApi.getProcessVersions(key),
    enabled: enabled && !!key,
  });
}

export function useProcessArguments(key: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['process-arguments', key],
    queryFn: () => processesApi.getProcessArguments(key),
    enabled: enabled && !!key,
  });
}

