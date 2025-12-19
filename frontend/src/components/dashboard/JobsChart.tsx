import { useAllJobs } from '@/hooks/useAllJobs';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useMemo } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { TrendingUp, Activity, Calendar } from 'lucide-react';

export default function JobsChart() {
  const filters = useFilterStore((state) => state.getFilters());
  // Habilitar sempre, mesmo sem pasta selecionada (mostra dados de todas as pastas)
  const { data, isLoading } = useAllJobs(filters, { $orderby: 'StartTime desc' }, filters.folderId, true);

  const chartData = useMemo(() => {
    if (!data?.value) return [];

    // Agrupar jobs por data (apenas jobs com StartTime para o gráfico)
    const grouped = data.value.reduce((acc, job) => {
      if (!job.StartTime) return acc;
      
      const date = formatDate(job.StartTime, 'dd/MM/yyyy');
      if (!acc[date]) {
        acc[date] = {
          date,
          Successful: 0,
          Faulted: 0,
          Canceled: 0,
          Running: 0,
          Total: 0,
        };
      }
      
      // Contar apenas estados exibidos no gráfico para as áreas
      if (job.State === 'Successful' || job.State === 'Faulted' || job.State === 'Canceled' || job.State === 'Running') {
        acc[date][job.State] = (acc[date][job.State] || 0) + 1;
      }
      
      // Mas contar TODOS os jobs no Total (incluindo Pending, Stopping, etc.)
      acc[date].Total += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).reverse();
  }, [data]);

  // Contar TODOS os jobs, incluindo aqueles sem StartTime
  const totalJobs = useMemo(() => {
    return data?.value?.length || 0;
  }, [data]);

  const avgJobsPerDay = useMemo(() => {
    return chartData.length > 0 ? (totalJobs / chartData.length).toFixed(1) : 0;
  }, [totalJobs, chartData.length]);

  const successRate = useMemo(() => {
    if (totalJobs === 0) return 0;
    const successful = chartData.reduce((sum, item) => sum + (item.Successful || 0), 0);
    return ((successful / totalJobs) * 100).toFixed(1);
  }, [chartData, totalJobs]);

  if (isLoading) {
    return (
      <Card title="Evolução de Jobs" className="animate-pulse">
        <div className="h-[400px] bg-muted rounded-lg" />
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-slate-300">
                  {entry.name}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {entry.value}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-muted-foreground">Total: </span>
              <span className="text-xs font-semibold">
                {payload[0].payload.Total}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      title="Evolução de Jobs ao Longo do Tempo" 
      className="flex flex-col"
      infoTooltip="Este gráfico mostra a evolução temporal dos jobs, agrupados por data e status (Successful, Faulted, Canceled, Running). Permite visualizar tendências, identificar períodos de maior atividade e analisar a taxa de sucesso ao longo do tempo. Os dados respeitam todos os filtros aplicados."
    >
      {/* Métricas resumidas no topo */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Total</span>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {totalJobs.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-900 dark:text-green-100">Taxa Sucesso</span>
          </div>
          <p className="text-lg font-bold text-green-900 dark:text-green-100">
            {successRate}%
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Média/dia</span>
          </div>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {avgJobsPerDay}
          </p>
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccessful" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFaulted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRunning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCanceled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="date"
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
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="Successful"
              stackId="1"
              stroke="#22c55e"
              fill="url(#colorSuccessful)"
              strokeWidth={2}
              name="Sucesso"
            />
            <Area
              type="monotone"
              dataKey="Faulted"
              stackId="1"
              stroke="#ef4444"
              fill="url(#colorFaulted)"
              strokeWidth={2}
              name="Erro"
            />
            <Area
              type="monotone"
              dataKey="Running"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#colorRunning)"
              strokeWidth={2}
              name="Executando"
            />
            <Area
              type="monotone"
              dataKey="Canceled"
              stackId="1"
              stroke="#eab308"
              fill="url(#colorCanceled)"
              strokeWidth={2}
              name="Cancelado"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
