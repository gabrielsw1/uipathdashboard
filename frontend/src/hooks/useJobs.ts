import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/services/api/jobs';
import { JobFilters, ODataQueryParams } from '@/types/orchestrator';

export function useJobs(
  filters?: JobFilters,
  queryParams?: ODataQueryParams,
  folderId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['jobs', filters, queryParams, folderId],
    queryFn: () => jobsApi.getJobs(filters, queryParams, folderId),
    enabled,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

export function useJobById(key: number, folderId?: number) {
  return useQuery({
    queryKey: ['job', key, folderId],
    queryFn: () => jobsApi.getJobById(key, folderId),
    enabled: !!key,
  });
}

export function useStopJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, strategy, folderId }: { key: number; strategy?: 'SoftStop' | 'Kill'; folderId?: number }) =>
      jobsApi.stopJob(key, strategy, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useRestartJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, folderId }: { key: number; folderId?: number }) =>
      jobsApi.restartJob(key, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useResumeJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, folderId }: { key: number; folderId?: number }) =>
      jobsApi.resumeJob(key, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

