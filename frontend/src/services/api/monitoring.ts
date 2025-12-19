import api from './orchestrator';
import { RealtimeMetricsDto } from '@/types/orchestrator';

export const monitoringApi = {
  getRealtimeMetrics: async (folderId?: number): Promise<RealtimeMetricsDto> => {
    const params = new URLSearchParams();
    if (folderId) params.append('folderId', folderId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<RealtimeMetricsDto>(`/api/monitoring/realtime${query}`);
    return response.data;
  },
};

