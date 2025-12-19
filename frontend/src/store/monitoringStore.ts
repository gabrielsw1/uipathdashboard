import { create } from 'zustand';
import { RealtimeMetricsDto } from '@/types/orchestrator';

interface MonitoringDataPoint extends RealtimeMetricsDto {
  id: string;
}

interface MonitoringStoreState {
  history: MonitoringDataPoint[];
  maxHistorySize: number;
  addDataPoint: (data: RealtimeMetricsDto) => void;
  clearHistory: () => void;
  getLatest: () => MonitoringDataPoint | null;
  getHistory: () => MonitoringDataPoint[];
}

export const useMonitoringStore = create<MonitoringStoreState>((set, get) => ({
  history: [],
  maxHistorySize: 60, // 60 pontos = 10 minutos a 10s de intervalo

  addDataPoint: (data: RealtimeMetricsDto) => {
    set((state) => {
      const newPoint: MonitoringDataPoint = {
        ...data,
        id: `${data.timestamp}-${Date.now()}`,
      };

      const newHistory = [...state.history, newPoint];
      
      // Manter apenas os últimos maxHistorySize pontos (buffer circular)
      if (newHistory.length > state.maxHistorySize) {
        return {
          history: newHistory.slice(-state.maxHistorySize),
        };
      }

      return {
        history: newHistory,
      };
    });
  },

  clearHistory: () => {
    set({ history: [] });
  },

  getLatest: () => {
    const state = get();
    return state.history.length > 0 
      ? state.history[state.history.length - 1] 
      : null;
  },

  getHistory: () => {
    return get().history;
  },
}));

