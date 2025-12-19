import api from './orchestrator';
import { JobDto, ODataResponse, JobFilters, ODataQueryParams } from '@/types/orchestrator';

export const jobsApi = {
  getJobs: async (
    filters?: JobFilters,
    queryParams?: ODataQueryParams,
    folderId?: number
  ): Promise<ODataResponse<JobDto>> => {
    const params = new URLSearchParams();
    
    if (filters?.processKey) params.append('processKey', filters.processKey);
    if (filters?.releaseKey) params.append('releaseKey', filters.releaseKey);
    if (filters?.robotId) params.append('robotId', filters.robotId.toString());
    if (filters?.state) {
      if (Array.isArray(filters.state)) {
        params.append('state', filters.state.join(','));
      } else {
        params.append('state', filters.state);
      }
    }
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.machineId) params.append('machineId', filters.machineId.toString());
    if (folderId) params.append('folderId', folderId.toString());

    // Parâmetros OData - não codificar aqui, o backend fará
    if (queryParams?.$orderby) params.append('$orderby', queryParams.$orderby);
    if (queryParams?.$top !== undefined) params.append('$top', queryParams.$top.toString());
    if (queryParams?.$skip !== undefined) params.append('$skip', queryParams.$skip.toString());
    if (queryParams?.$select) params.append('$select', queryParams.$select);
    if (queryParams?.$expand) params.append('$expand', queryParams.$expand);
    if (queryParams?.$count !== undefined) {
      params.append('$count', queryParams.$count.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ODataResponse<JobDto>>(`/api/jobs${query}`);
    return response.data;
  },

  getJobById: async (key: number, folderId?: number): Promise<JobDto> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    const response = await api.get<JobDto>(`/api/jobs/${key}${params}`);
    return response.data;
  },

  stopJob: async (key: number, strategy: 'SoftStop' | 'Kill' = 'SoftStop', folderId?: number): Promise<void> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    await api.post(`/api/jobs/${key}/stop${params}`, { strategy });
  },

  restartJob: async (key: number, folderId?: number): Promise<void> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    await api.post(`/api/jobs/${key}/restart${params}`);
  },

  resumeJob: async (key: number, folderId?: number): Promise<void> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    await api.post(`/api/jobs/${key}/resume${params}`);
  },
};

