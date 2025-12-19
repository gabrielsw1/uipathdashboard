import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/services/api/jobs';
import { JobFilters, ODataQueryParams, JobDto, ODataResponse } from '@/types/orchestrator';

/**
 * Hook que busca TODOS os jobs filtrados, fazendo paginação automática
 * para garantir que todos os resultados sejam retornados
 */
export function useAllJobs(
  filters?: JobFilters,
  queryParams?: ODataQueryParams,
  folderId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['allJobs', filters, queryParams, folderId],
    queryFn: async () => {
      const allJobs: JobDto[] = [];
      let skip = 0;
      const pageSize = 1000; // Máximo permitido pela API
      let hasMore = true;
      let totalCount: number | undefined;

      while (hasMore) {
        const response = await jobsApi.getJobs(
          filters,
          {
            ...queryParams,
            $top: pageSize,
            $skip: skip,
            $count: true, // Para saber o total
          },
          folderId
        );

        if (response.value && response.value.length > 0) {
          allJobs.push(...response.value);
          skip += pageSize;
          
          // Se retornou menos que pageSize, não há mais dados
          hasMore = response.value.length === pageSize;
          
          // Se temos o count total, podemos verificar
          if (response['@odata.count'] !== undefined) {
            totalCount = response['@odata.count'];
            hasMore = allJobs.length < totalCount;
          }
        } else {
          hasMore = false;
        }
      }

      return {
        value: allJobs,
        '@odata.count': totalCount || allJobs.length,
      } as ODataResponse<JobDto>;
    },
    enabled,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

