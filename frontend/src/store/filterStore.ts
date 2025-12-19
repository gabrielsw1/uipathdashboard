import { create } from 'zustand';
import { JobFilters, JobState } from '@/types/orchestrator';

interface FilterState {
  folderId?: number;
  processKey?: string;
  releaseKey?: string;
  robotId?: number;
  state?: JobState | JobState[];
  startDate?: string;
  endDate?: string;
  machineId?: number;
  setFolderId: (folderId?: number) => void;
  setProcessKey: (processKey?: string) => void;
  setReleaseKey: (releaseKey?: string) => void;
  setRobotId: (robotId?: number) => void;
  setState: (state?: JobState | JobState[]) => void;
  setDateRange: (startDate?: string, endDate?: string) => void;
  setMachineId: (machineId?: number) => void;
  reset: () => void;
  getFilters: () => JobFilters;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  folderId: undefined,
  processKey: undefined,
  releaseKey: undefined,
  robotId: undefined,
  state: undefined,
  startDate: undefined,
  endDate: undefined,
  machineId: undefined,

  setFolderId: (folderId) => set({ 
    folderId, 
    processKey: undefined, // Limpar processo quando pasta muda
    releaseKey: undefined, // Limpar release quando pasta muda
    robotId: undefined, // Limpar robot quando pasta muda
  }),
  setProcessKey: (processKey) => set({ processKey, releaseKey: undefined }), // Reset release quando processo muda
  setReleaseKey: (releaseKey) => set({ releaseKey }),
  setRobotId: (robotId) => set({ robotId }),
  setState: (state) => set({ state }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  setMachineId: (machineId) => set({ machineId }),
  reset: () => set({
    folderId: undefined,
    processKey: undefined,
    releaseKey: undefined,
    robotId: undefined,
    state: undefined,
    startDate: undefined,
    endDate: undefined,
    machineId: undefined,
  }),
  getFilters: () => {
    const state = get();
    return {
      folderId: state.folderId,
      processKey: state.processKey,
      releaseKey: state.releaseKey,
      robotId: state.robotId,
      state: state.state,
      startDate: state.startDate,
      endDate: state.endDate,
      machineId: state.machineId,
    };
  },
}));

