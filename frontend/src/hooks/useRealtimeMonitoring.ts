import { useQuery } from '@tanstack/react-query';
import { monitoringApi } from '@/services/api/monitoring';
import { useMonitoringStore } from '@/store/monitoringStore';
import { useFilterStore } from '@/store/filterStore';
import { useEffect } from 'react';

export function useRealtimeMonitoring(enabled: boolean = true) {
  const addDataPoint = useMonitoringStore((state) => state.addDataPoint);
  const folderId = useFilterStore((state) => state.folderId);

  const query = useQuery({
    queryKey: ['realtimeMonitoring', folderId],
    queryFn: () => monitoringApi.getRealtimeMetrics(folderId),
    enabled: enabled && !!folderId, // Só habilita se enabled for true E houver folderId
    refetchInterval: enabled && folderId ? 10000 : false, // 10 segundos apenas se habilitado
    staleTime: 5000, // 5 segundos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Adicionar dados ao histórico quando receber nova resposta
  useEffect(() => {
    if (query.data) {
      addDataPoint(query.data);
    }
  }, [query.data, addDataPoint]);

  // Limpar histórico quando folderId mudar
  useEffect(() => {
    const { clearHistory } = useMonitoringStore.getState();
    clearHistory();
  }, [folderId]);

  return {
    ...query,
    isOnline: !query.isError && query.isSuccess,
  };
}

