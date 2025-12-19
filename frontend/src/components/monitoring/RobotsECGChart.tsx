import { useMemo } from 'react';
import { useMonitoringStore } from '@/store/monitoringStore';
import ECGChart from './ECGChart';

interface RobotsECGChartProps {
  darkMode?: boolean;
}

export default function RobotsECGChart({ darkMode = true }: RobotsECGChartProps = {}) {
  const history = useMonitoringStore((state) => state.getHistory());

  const chartData = useMemo(() => {
    return history.map((point) => ({
      timestamp: point.timestamp,
      available: point.robots.available,
      busy: point.robots.busy,
      disconnected: point.robots.disconnected,
      unresponsive: point.robots.unresponsive,
    }));
  }, [history]);

  const lines = [
    { key: 'available', name: 'Disponível', color: '#22c55e', strokeWidth: 2 },
    { key: 'busy', name: 'Ocupado', color: '#3b82f6', strokeWidth: 2 },
    { key: 'disconnected', name: 'Desconectado', color: '#f59e0b', strokeWidth: 2 },
    { key: 'unresponsive', name: 'Sem Resposta', color: '#ef4444', strokeWidth: 2 },
  ];

  return (
    <ECGChart
      title="Robôs por Estado"
      data={chartData}
      lines={lines}
      height={200}
      darkMode={darkMode}
    />
  );
}

