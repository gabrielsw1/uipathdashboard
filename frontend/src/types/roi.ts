export interface ROIConfig {
  processKey?: string;  // Se definido, é configuração por processo
  folderId?: number;     // Se definido, é configuração por pasta
  manualTimeHours: number;  // Tempo manual em horas
  personHourlyCost: number;      // Custo por hora da pessoa em R$
  personCount: number;           // Quantidade de pessoas
  // robotHourlyCost é global, não está aqui
}

export interface ROIStoreState {
  configs: ROIConfig[];  // Configurações por processo/pasta
  robotHourlyCost: number;  // Parâmetro global do custo do robô
  addConfig: (config: ROIConfig) => void;
  updateConfig: (config: ROIConfig) => void;
  removeConfig: (processKey?: string, folderId?: number) => void;
  setRobotHourlyCost: (cost: number) => void;
  getConfig: (processKey?: string, folderId?: number) => ROIConfig | undefined;
  exportToJSON: () => string;
  importFromJSON: (json: string) => void;
}

export interface ProcessROI {
  processKey: string;
  processName: string;
  folderId: number;
  folderName: string;
  avgExecutionTimeHours: number;  // Tempo médio automático
  manualTimeHours: number;       // Tempo manual cadastrado
  personHourlyCost: number;
  robotHourlyCost: number;  // Usa o valor global
  totalJobs: number;
  totalExecutionTimeHours: number;
  totalManualTimeHours: number;
  timeSavedHours: number;
  roiValue: number;              // ROI em R$ (considerando custo do robô)
  roiPercentage: number;         // ROI em %
  fte: number;                   // Full-Time Equivalent
}

export interface ROIExportData {
  version: string;
  robotHourlyCost: number;
  configs: ROIConfig[];
}

