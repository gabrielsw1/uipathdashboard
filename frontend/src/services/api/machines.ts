import api from './orchestrator';
import { MachineDto, ODataResponse, ODataQueryParams } from '@/types/orchestrator';

export const machinesApi = {
  getMachines: async (
    queryParams?: ODataQueryParams,
    folderId?: number
  ): Promise<ODataResponse<MachineDto>> => {
    const params = new URLSearchParams();
    
    if (queryParams?.$orderby) params.append('$orderby', queryParams.$orderby);
    if (queryParams?.$top) params.append('$top', queryParams.$top.toString());
    if (queryParams?.$skip) params.append('$skip', queryParams.$skip.toString());
    if (queryParams?.$select) params.append('$select', queryParams.$select);
    if (queryParams?.$expand) params.append('$expand', queryParams.$expand);
    if (queryParams?.$count) params.append('$count', 'true');
    if (folderId) params.append('folderId', folderId.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ODataResponse<MachineDto>>(`/api/machines${query}`);
    return response.data;
  },

  getMachineById: async (key: number, folderId?: number): Promise<MachineDto> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    const response = await api.get<MachineDto>(`/api/machines/${key}${params}`);
    return response.data;
  },
};

