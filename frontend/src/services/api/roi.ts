import api from './orchestrator';
import { ROIExportData } from '@/types/roi';

export const roiApi = {
  // Carregar configuração do servidor
  async getConfig(): Promise<ROIExportData> {
    const response = await api.get<ROIExportData>('/api/roi/config');
    return response.data;
  },

  // Salvar configuração no servidor
  async saveConfig(data: ROIExportData): Promise<void> {
    await api.post('/api/roi/config', data);
  },
};

