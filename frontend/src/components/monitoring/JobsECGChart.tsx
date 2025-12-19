import { useMemo } from 'react';
import { useMonitoringStore } from '@/store/monitoringStore';
import ECGChart from './ECGChart';

interface JobsECGChartProps {
  darkMode?: boolean;
}

export default function JobsECGChart({ darkMode = true }: JobsECGChartProps = {}) {
  const history = useMonitoringStore((state) => state.getHistory());

  const chartData = useMemo(() => {
    return history.map((point) => ({
      timestamp: point.timestamp,
      successful: point.jobs.successful,
      faulted: point.jobs.faulted,
      canceled: point.jobs.canceled,
      running: point.jobs.running,
      pending: point.jobs.pending,
    }));
  }, [history]);

  const lines = [
    { key: 'successful', name: 'Sucesso', color: '#22c55e', strokeWidth: 2 },
    { key: 'faulted', name: 'Erro', color: '#ef4444', strokeWidth: 2 },
    { key: 'canceled', name: 'Cancelado', color: '#eab308', strokeWidth: 2 },
    { key: 'running', name: 'Executando', color: '#3b82f6', strokeWidth: 2 },
    { key: 'pending', name: 'Pendente', color: '#a855f7', strokeWidth: 2 },
  ];

  return (
    <ECGChart
      title="Jobs por Estado"
      data={chartData}
      lines={lines}
      height={200}
      darkMode={darkMode}
    />
  );
}

