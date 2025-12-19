import api from './orchestrator';
import { CountStats, LicenseStatsModel, ConsumptionLicenseStatsModel, JobFilters } from '@/types/orchestrator';

export const statsApi = {
  getCountStats: async (filters?: JobFilters): Promise<CountStats[]> => {
    const params = new URLSearchParams();
    if (filters?.folderId) params.append('folderId', filters.folderId.toString());
    if (filters?.processKey) params.append('processKey', filters.processKey);
    if (filters?.releaseKey) params.append('releaseKey', filters.releaseKey);
    if (filters?.robotId) params.append('robotId', filters.robotId.toString());
    if (filters?.state) {
      const states = Array.isArray(filters.state) ? filters.state : [filters.state];
      states.forEach(s => params.append('state', s));
    }
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.machineId) params.append('machineId', filters.machineId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<CountStats[]>(`/api/stats/count${query}`);
    return response.data;
  },

  getJobsStats: async (filters?: JobFilters): Promise<CountStats[]> => {
    const params = new URLSearchParams();
    if (filters?.folderId) params.append('folderId', filters.folderId.toString());
    if (filters?.processKey) params.append('processKey', filters.processKey);
    if (filters?.releaseKey) params.append('releaseKey', filters.releaseKey);
    if (filters?.robotId) params.append('robotId', filters.robotId.toString());
    if (filters?.state) {
      const states = Array.isArray(filters.state) ? filters.state : [filters.state];
      states.forEach(s => params.append('state', s));
    }
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.machineId) params.append('machineId', filters.machineId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<CountStats[]>(`/api/stats/jobs${query}`);
    return response.data;
  },

  getSessionsStats: async (filters?: JobFilters): Promise<CountStats[]> => {
    const params = new URLSearchParams();
    if (filters?.folderId) params.append('folderId', filters.folderId.toString());
    if (filters?.processKey) params.append('processKey', filters.processKey);
    if (filters?.releaseKey) params.append('releaseKey', filters.releaseKey);
    if (filters?.robotId) params.append('robotId', filters.robotId.toString());
    if (filters?.state) {
      const states = Array.isArray(filters.state) ? filters.state : [filters.state];
      states.forEach(s => params.append('state', s));
    }
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.machineId) params.append('machineId', filters.machineId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<CountStats[]>(`/api/stats/sessions${query}`);
    return response.data;
  },

  getLicenseStats: async (days?: number, tenantId?: number): Promise<LicenseStatsModel[]> => {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (tenantId) params.append('tenantId', tenantId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<LicenseStatsModel[]>(`/api/stats/licenses${query}`);
    return response.data;
  },

  getConsumptionLicenseStats: async (days?: number, tenantId?: number): Promise<ConsumptionLicenseStatsModel[]> => {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (tenantId) params.append('tenantId', tenantId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ConsumptionLicenseStatsModel[]>(`/api/stats/licenses/consumption${query}`);
    return response.data;
  },
};

