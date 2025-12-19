import api from './orchestrator';
import { SessionDto, ODataResponse, SessionFilters, ODataQueryParams } from '@/types/orchestrator';

export const sessionsApi = {
  getSessions: async (
    filters?: SessionFilters,
    queryParams?: ODataQueryParams,
    folderId?: number
  ): Promise<ODataResponse<SessionDto>> => {
    const params = new URLSearchParams();
    
    if (filters?.robotId) params.append('robotId', filters.robotId.toString());
    if (filters?.state) {
      if (Array.isArray(filters.state)) {
        params.append('state', filters.state.join(','));
      } else {
        params.append('state', filters.state);
      }
    }
    if (filters?.machineId) params.append('machineId', filters.machineId.toString());
    if (folderId) params.append('folderId', folderId.toString());

    if (queryParams?.$orderby) params.append('$orderby', queryParams.$orderby);
    if (queryParams?.$top) params.append('$top', queryParams.$top.toString());
    if (queryParams?.$skip) params.append('$skip', queryParams.$skip.toString());
    if (queryParams?.$select) params.append('$select', queryParams.$select);
    if (queryParams?.$expand) params.append('$expand', queryParams.$expand);
    if (queryParams?.$count) params.append('$count', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ODataResponse<SessionDto>>(`/api/sessions${query}`);
    return response.data;
  },

  getSessionById: async (key: number, folderId?: number): Promise<SessionDto> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    const response = await api.get<SessionDto>(`/api/sessions/${key}${params}`);
    return response.data;
  },
};

