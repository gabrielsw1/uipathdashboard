import { useMemo } from 'react';
import { useMonitoringStore } from '@/store/monitoringStore';
import ECGChart from './ECGChart';

interface SessionsECGChartProps {
  darkMode?: boolean;
}

export default function SessionsECGChart({ darkMode = true }: SessionsECGChartProps = {}) {
  const history = useMonitoringStore((state) => state.getHistory());

  const chartData = useMemo(() => {
    return history.map((point) => ({
      timestamp: point.timestamp,
      active: point.sessions.active,
    }));
  }, [history]);

  const lines = [
    { key: 'active', name: 'Sessões Ativas', color: '#3b82f6', strokeWidth: 3 },
  ];

  return (
    <ECGChart
      title="Sessões Ativas"
      data={chartData}
      lines={lines}
      height={200}
      darkMode={darkMode}
    />
  );
}

