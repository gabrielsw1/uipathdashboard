import api from './orchestrator';
import { RobotDto, ODataResponse, RobotFilters, ODataQueryParams } from '@/types/orchestrator';

export const robotsApi = {
  getRobots: async (
    filters?: RobotFilters,
    queryParams?: ODataQueryParams,
    folderId?: number
  ): Promise<ODataResponse<RobotDto>> => {
    const params = new URLSearchParams();
    
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
    const response = await api.get<ODataResponse<RobotDto>>(`/api/robots${query}`);
    return response.data;
  },

  getRobotByKey: async (key: number, folderId?: number): Promise<RobotDto> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    const response = await api.get<RobotDto>(`/api/robots/${key}${params}`);
    return response.data;
  },
};

