import { useQuery } from '@tanstack/react-query';
import { releasesApi } from '@/services/api/releases';
import { ODataQueryParams } from '@/types/orchestrator';

export function useReleases(
  queryParams?: ODataQueryParams,
  folderId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['releases', queryParams, folderId],
    queryFn: () => releasesApi.getReleases(queryParams, folderId),
    enabled,
    staleTime: 300000, // 5 minutos
  });
}

export function useReleaseByKey(key: string, folderId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['release', key, folderId],
    queryFn: () => releasesApi.getReleaseByKey(key, folderId),
    enabled: enabled && !!key,
  });
}

