import api from './orchestrator';
import { ProcessDto, ODataResponse, ProcessFilters, ODataQueryParams } from '@/types/orchestrator';

export const processesApi = {
  getProcesses: async (
    filters?: ProcessFilters,
    queryParams?: ODataQueryParams
  ): Promise<ODataResponse<ProcessDto>> => {
    const params = new URLSearchParams();
    
    if (filters?.folderId) params.append('folderId', filters.folderId.toString());
    if (filters?.includeSubfolders !== undefined) params.append('includeSubfolders', filters.includeSubfolders.toString());
    if (filters?.feedId) params.append('feedId', filters.feedId);
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);

    if (queryParams?.$orderby) params.append('$orderby', queryParams.$orderby);
    if (queryParams?.$top) params.append('$top', queryParams.$top.toString());
    if (queryParams?.$skip) params.append('$skip', queryParams.$skip.toString());
    if (queryParams?.$select) params.append('$select', queryParams.$select);
    if (queryParams?.$expand) params.append('$expand', queryParams.$expand);
    if (queryParams?.$count) params.append('$count', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ODataResponse<ProcessDto>>(`/api/processes${query}`);
    return response.data;
  },

  getProcessByKey: async (key: string): Promise<ProcessDto> => {
    const response = await api.get<ProcessDto>(`/api/processes/${key}`);
    return response.data;
  },

  getProcessVersions: async (key: string): Promise<ProcessDto[]> => {
    const response = await api.get<ProcessDto[]>(`/api/processes/${key}/versions`);
    return response.data;
  },

  getProcessArguments: async (key: string): Promise<any> => {
    const response = await api.get(`/api/processes/${key}/arguments`);
    return response.data;
  },
};

