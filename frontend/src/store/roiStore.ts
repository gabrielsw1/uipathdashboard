import { create } from 'zustand';
import { ROIConfig, ROIStoreState, ROIExportData } from '@/types/roi';
import { roiApi } from '@/services/api/roi';

// Função para salvar no servidor
async function saveToServer(data: ROIExportData) {
  try {
    await roiApi.saveConfig(data);
    console.log('Configuração ROI salva no servidor com sucesso');
  } catch (error) {
    console.error('Erro ao salvar configuração ROI no servidor:', error);
    // Em caso de erro, ainda salvar no localStorage como fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('roi-config-backup', JSON.stringify(data));
    }
    throw error;
  }
}

// Função para carregar do servidor
async function loadFromServer(): Promise<ROIExportData | null> {
  try {
    const data = await roiApi.getConfig();
    // Validar estrutura
    if (data.version && typeof data.robotHourlyCost === 'number' && Array.isArray(data.configs)) {
      return data;
    }
  } catch (error) {
    console.error('Erro ao carregar configuração ROI do servidor:', error);
    // Tentar carregar do localStorage como fallback
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('roi-config-backup');
        if (saved) {
          const data = JSON.parse(saved) as ROIExportData;
          if (data.version && typeof data.robotHourlyCost === 'number' && Array.isArray(data.configs)) {
            return data;
          }
        }
      } catch (e) {
        console.error('Erro ao carregar do localStorage:', e);
      }
    }
  }
  return null;
}

export const useROIStore = create<ROIStoreState>((set, get) => {
  // Estado inicial (será atualizado quando carregar do servidor)
  const initialState = {
    configs: [] as ROIConfig[],
    robotHourlyCost: 0,
  };

  // Carregar dados do servidor na inicialização (assíncrono)
  if (typeof window !== 'undefined') {
    loadFromServer().then((savedData) => {
      if (savedData) {
        useROIStore.setState({
          configs: savedData.configs,
          robotHourlyCost: savedData.robotHourlyCost,
        });
      }
    }).catch((error) => {
      console.error('Erro ao carregar configuração ROI:', error);
    });
  }

  return {
    configs: initialState.configs,
    robotHourlyCost: initialState.robotHourlyCost,

    addConfig: (config: ROIConfig) => {
      set((state) => {
        // Verificar se já existe configuração para esta pasta
        const existingIndex = state.configs.findIndex(
          (c) => config.folderId && c.folderId === config.folderId
        );

        let newConfigs: ROIConfig[];
        if (existingIndex >= 0) {
          // Atualizar existente
          newConfigs = [...state.configs];
          newConfigs[existingIndex] = config;
        } else {
          // Adicionar novo
          newConfigs = [...state.configs, config];
        }

        // Salvar automaticamente no servidor
        const exportData: ROIExportData = {
          version: '1.0',
          robotHourlyCost: state.robotHourlyCost,
          configs: newConfigs,
        };
        saveToServer(exportData).catch((error) => {
          console.error('Erro ao salvar configuração:', error);
        });

        return { configs: newConfigs };
      });
    },

  updateConfig: (config: ROIConfig) => {
    set((state) => {
      const index = state.configs.findIndex(
        (c) => config.folderId && c.folderId === config.folderId
      );

      if (index >= 0) {
        const newConfigs = [...state.configs];
        newConfigs[index] = config;
        
        // Salvar automaticamente no servidor
        const exportData: ROIExportData = {
          version: '1.0',
          robotHourlyCost: state.robotHourlyCost,
          configs: newConfigs,
        };
        saveToServer(exportData).catch((error) => {
          console.error('Erro ao salvar configuração:', error);
        });
        
        return { configs: newConfigs };
      }
      return state;
    });
  },

  removeConfig: (processKey?: string, folderId?: number) => {
    set((state) => {
      const newConfigs = state.configs.filter(
        (c) => !(folderId && c.folderId === folderId)
      );
      
      // Salvar automaticamente no servidor
      const exportData: ROIExportData = {
        version: '1.0',
        robotHourlyCost: state.robotHourlyCost,
        configs: newConfigs,
      };
      saveToServer(exportData).catch((error) => {
        console.error('Erro ao salvar configuração:', error);
      });
      
      return { configs: newConfigs };
    });
  },

  setRobotHourlyCost: (cost: number) => {
    set((state) => {
      // Salvar automaticamente no servidor
      const exportData: ROIExportData = {
        version: '1.0',
        robotHourlyCost: cost,
        configs: state.configs,
      };
      saveToServer(exportData).catch((error) => {
        console.error('Erro ao salvar configuração:', error);
      });
      
      return { robotHourlyCost: cost };
    });
  },

  getConfig: (processKey?: string, folderId?: number) => {
    const state = get();
    
    // Buscar apenas por pasta
    if (folderId) {
      const folderConfig = state.configs.find((c) => c.folderId === folderId);
      if (folderConfig) return folderConfig;
    }
    
    return undefined;
  },

  exportToJSON: () => {
    const state = get();
    const exportData: ROIExportData = {
      version: '1.0',
      robotHourlyCost: state.robotHourlyCost,
      configs: state.configs,
    };
    return JSON.stringify(exportData, null, 2);
  },

  importFromJSON: (json: string) => {
    try {
      const data: ROIExportData = JSON.parse(json);
      
      if (data.version && typeof data.robotHourlyCost === 'number' && Array.isArray(data.configs)) {
        set({
          robotHourlyCost: data.robotHourlyCost,
          configs: data.configs,
        });
        
        // Salvar automaticamente no servidor após importar
        saveToServer(data).catch((error) => {
          console.error('Erro ao salvar configuração após importar:', error);
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar JSON:', error);
      return false;
    }
  },
  };
});

