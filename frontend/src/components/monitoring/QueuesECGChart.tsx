import { useMemo } from 'react';
import { useMonitoringStore } from '@/store/monitoringStore';
import ECGChart from './ECGChart';

interface QueuesECGChartProps {
  darkMode?: boolean;
}

export default function QueuesECGChart({ darkMode = true }: QueuesECGChartProps = {}) {
  const history = useMonitoringStore((state) => state.getHistory());

  const chartData = useMemo(() => {
    return history.map((point) => ({
      timestamp: point.timestamp,
      pending: point.queues.pending,
      processed: point.queues.processed,
      failed: point.queues.failed,
    }));
  }, [history]);

  const lines = [
    { key: 'pending', name: 'Pendente', color: '#f59e0b', strokeWidth: 2 },
    { key: 'processed', name: 'Processado', color: '#22c55e', strokeWidth: 2 },
    { key: 'failed', name: 'Falhado', color: '#ef4444', strokeWidth: 2 },
  ];

  return (
    <ECGChart
      title="Queues - Itens"
      data={chartData}
      lines={lines}
      height={200}
      darkMode={darkMode}
    />
  );
}

