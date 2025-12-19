import { useMemo } from 'react';
import { useMonitoringStore } from '@/store/monitoringStore';
import ECGChart from './ECGChart';

interface ProcessesECGChartProps {
  darkMode?: boolean;
}

export default function ProcessesECGChart({ darkMode = true }: ProcessesECGChartProps = {}) {
  const history = useMonitoringStore((state) => state.getHistory());

  const chartData = useMemo(() => {
    return history.map((point) => ({
      timestamp: point.timestamp,
      running: point.processes.running,
    }));
  }, [history]);

  const lines = [
    { key: 'running', name: 'Processos em Execução', color: '#8b5cf6', strokeWidth: 3 },
  ];

  return (
    <ECGChart
      title="Processos em Execução"
      data={chartData}
      lines={lines}
      height={200}
      darkMode={darkMode}
    />
  );
}

