import { useMemo } from 'react';
import { useMonitoringStore } from '@/store/monitoringStore';
import ECGChart from './ECGChart';

interface PerformanceECGChartProps {
  darkMode?: boolean;
}

export default function PerformanceECGChart({ darkMode = true }: PerformanceECGChartProps = {}) {
  const history = useMonitoringStore((state) => state.getHistory());

  const chartData = useMemo(() => {
    return history.map((point) => ({
      timestamp: point.timestamp,
      avgExecutionTime: point.performance.avgExecutionTime,
      throughput: point.performance.throughput,
    }));
  }, [history]);

  const lines = [
    { key: 'avgExecutionTime', name: 'Tempo Médio (s)', color: '#06b6d4', strokeWidth: 2 },
    { key: 'throughput', name: 'Throughput (jobs/min)', color: '#10b981', strokeWidth: 2 },
  ];

  return (
    <ECGChart
      title="Performance"
      data={chartData}
      lines={lines}
      height={200}
      darkMode={darkMode}
    />
  );
}

