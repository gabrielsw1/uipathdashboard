import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/services/api/stats';
import { JobFilters } from '@/types/orchestrator';

export function useCountStats(filters?: JobFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stats', 'count', filters],
    queryFn: () => statsApi.getCountStats(filters),
    enabled,
    staleTime: 300000, // 5 minutos
    refetchInterval: 300000, // Refetch a cada 5 minutos
  });
}

export function useJobsStats(filters?: JobFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stats', 'jobs', filters],
    queryFn: () => statsApi.getJobsStats(filters),
    enabled,
    staleTime: 60000, // 1 minuto
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

export function useSessionsStats(filters?: JobFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stats', 'sessions', filters],
    queryFn: () => statsApi.getSessionsStats(filters),
    enabled,
    staleTime: 60000, // 1 minuto
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

export function useLicenseStats(days?: number, tenantId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stats', 'licenses', days, tenantId],
    queryFn: () => statsApi.getLicenseStats(days, tenantId),
    enabled,
    staleTime: 300000, // 5 minutos
  });
}

export function useConsumptionLicenseStats(days?: number, tenantId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stats', 'licenses', 'consumption', days, tenantId],
    queryFn: () => statsApi.getConsumptionLicenseStats(days, tenantId),
    enabled,
    staleTime: 300000, // 5 minutos
  });
}

