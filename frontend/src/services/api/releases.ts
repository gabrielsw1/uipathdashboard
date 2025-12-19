import api from './orchestrator';
import { ReleaseDto, ODataResponse, ODataQueryParams } from '@/types/orchestrator';

export const releasesApi = {
  getReleases: async (
    queryParams?: ODataQueryParams,
    folderId?: number
  ): Promise<ODataResponse<ReleaseDto>> => {
    const params = new URLSearchParams();
    
    if (queryParams?.$orderby) params.append('$orderby', queryParams.$orderby);
    if (queryParams?.$top) params.append('$top', queryParams.$top.toString());
    if (queryParams?.$skip) params.append('$skip', queryParams.$skip.toString());
    if (queryParams?.$select) params.append('$select', queryParams.$select);
    if (queryParams?.$expand) params.append('$expand', queryParams.$expand);
    if (queryParams?.$count) params.append('$count', 'true');
    if (folderId) params.append('folderId', folderId.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ODataResponse<ReleaseDto>>(`/api/releases${query}`);
    return response.data;
  },

  getReleaseByKey: async (key: string, folderId?: number): Promise<ReleaseDto> => {
    const params = folderId ? `?folderId=${folderId}` : '';
    const response = await api.get<ReleaseDto>(`/api/releases/${key}${params}`);
    return response.data;
  },
};

