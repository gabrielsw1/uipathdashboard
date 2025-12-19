import { create } from 'zustand';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

interface DashboardState {
  layout: LayoutItem[];
  theme: 'light' | 'dark';
  setLayout: (layout: LayoutItem[]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetLayout: () => void;
}

const defaultLayout: LayoutItem[] = [
  { i: 'metrics', x: 0, y: 0, w: 12, h: 2 },
  { i: 'jobs-chart', x: 0, y: 2, w: 6, h: 4 },
  { i: 'process-performance', x: 6, y: 2, w: 6, h: 4 },
  { i: 'robot-status', x: 0, y: 6, w: 6, h: 4 },
  { i: 'execution-timeline', x: 6, y: 6, w: 6, h: 4 },
];

export const useDashboardStore = create<DashboardState>((set) => ({
  layout: defaultLayout,
  theme: 'light',
  setLayout: (layout) => {
    set({ layout });
    localStorage.setItem('dashboard-layout', JSON.stringify(layout));
  },
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('dashboard-theme', theme);
  },
  resetLayout: () => {
    set({ layout: defaultLayout });
    localStorage.setItem('dashboard-layout', JSON.stringify(defaultLayout));
  },
}));

// Carregar do localStorage na inicialização
if (typeof window !== 'undefined') {
  const savedLayout = localStorage.getItem('dashboard-layout');
  const savedTheme = localStorage.getItem('dashboard-theme');
  
  if (savedLayout) {
    try {
      useDashboardStore.setState({ layout: JSON.parse(savedLayout) });
    } catch (e) {
      console.error('Erro ao carregar layout salvo:', e);
    }
  }
  
  if (savedTheme === 'light' || savedTheme === 'dark') {
    useDashboardStore.setState({ theme: savedTheme });
  }
}
