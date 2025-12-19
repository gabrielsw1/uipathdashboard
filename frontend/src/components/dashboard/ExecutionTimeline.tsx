import { useAllJobs } from '@/hooks/useAllJobs';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { TrendingUp, Clock, Activity } from 'lucide-react';

export default function ExecutionTimeline() {
  const filters = useFilterStore((state) => state.getFilters());
  // Habilitar sempre, mesmo sem pasta selecionada (mostra dados de todas as pastas)
  const { data, isLoading } = useAllJobs(filters, { $orderby: 'StartTime desc' }, filters.folderId, true);

  const chartData = useMemo(() => {
    if (!data?.value) return [];

    // Inicializar todas as 24 horas com 0
    const hourly: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      hourly[`${i.toString().padStart(2, '0')}:00`] = 0;
    }

    // Agrupar por hora do dia
    data.value.forEach(job => {
      if (!job.StartTime) return;
      
      const date = new Date(job.StartTime);
      const hour = date.getHours();
      const key = `${hour.toString().padStart(2, '0')}:00`;
      
      hourly[key] = (hourly[key] || 0) + 1;
    });

    return Object.entries(hourly)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }, [data]);

  const metrics = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { total: 0, average: 0, peakHour: '', peakCount: 0 };
    }

    const total = chartData.reduce((sum, item) => sum + item.count, 0);
    const average = total / chartData.length;
    const peak = chartData.reduce((max, item) => item.count > max.count ? item : max, chartData[0]);

    return {
      total,
      average: average.toFixed(1),
      peakHour: peak.hour,
      peakCount: peak.count,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-700 dark:border-slate-600">
          <p className="font-semibold text-slate-100 dark:text-slate-200 mb-2">{data.hour}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-300 dark:text-slate-400">Execuções: </span>
            <span className="text-sm font-bold text-slate-100 dark:text-slate-200">{data.count}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card title="Execuções por Hora do Dia" className="animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card 
        title="Execuções por Hora do Dia"
        infoTooltip="Este gráfico mostra a distribuição de execuções de jobs ao longo das 24 horas do dia, baseado nos filtros aplicados. Útil para identificar padrões de uso e horários de pico de execução dos processos RPA."
      >
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Nenhum dado disponível</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Execuções por Hora do Dia"
      infoTooltip="Este gráfico mostra a distribuição de execuções de jobs ao longo das 24 horas do dia, baseado nos filtros aplicados. Útil para identificar padrões de uso e horários de pico de execução dos processos RPA."
    >
      {/* Métricas resumidas */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Total</span>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {metrics.total}
          </p>
        </div>
        <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Média/hora</span>
          </div>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {metrics.average}
          </p>
        </div>
        <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100">Pico</span>
          </div>
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
            {metrics.peakHour}
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            {metrics.peakCount} execuções
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
          <XAxis 
            dataKey="hour" 
            stroke="#64748b"
            className="dark:stroke-slate-400"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#64748b"
            className="dark:stroke-slate-400"
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="url(#barGradient)"
            radius={[4, 4, 0, 0]}
            animationBegin={0}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

