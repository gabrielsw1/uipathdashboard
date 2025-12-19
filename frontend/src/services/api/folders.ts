import api from './orchestrator';
import { FolderDto } from '@/types/orchestrator';

export const foldersApi = {
  getFolders: async (): Promise<FolderDto[]> => {
    const response = await api.get<FolderDto[]>('/api/folders');
    return response.data;
  },

  getFoldersForCurrentUser: async (): Promise<{ value: FolderDto[] }> => {
    const response = await api.get<{ value: FolderDto[] }>('/api/folders/current-user');
    return response.data;
  },
};

