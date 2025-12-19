import { useAllJobs } from '@/hooks/useAllJobs';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { useMemo } from 'react';
import { formatDuration } from '@/utils/dateUtils';
import { TrendingUp, TrendingDown, Clock, Zap, AlertCircle } from 'lucide-react';

export default function EfficiencyMetrics() {
  const filters = useFilterStore((state) => state.getFilters());
  // Habilitar sempre, mesmo sem pasta selecionada (mostra dados de todas as pastas)
  const { data, isLoading } = useAllJobs(filters, { $expand: 'Release' }, filters.folderId, true);

  const metrics = useMemo(() => {
    if (!data?.value || data.value.length === 0) {
      return {
        avgExecutionTime: 0,
        totalExecutionTime: 0,
        successRate: 0,
        failureRate: 0,
        jobsPerHour: 0,
        efficiency: 0,
      };
    }

    const jobs = data.value;
    const successful = jobs.filter(j => j.State === 'Successful');
    const faulted = jobs.filter(j => j.State === 'Faulted');
    
    const totalDuration = jobs.reduce((sum, job) => {
      if (job.Duration) return sum + job.Duration;
      if (job.StartTime && job.EndTime) {
        const start = new Date(job.StartTime).getTime();
        const end = new Date(job.EndTime).getTime();
        return sum + (end - start) / 1000; // Converter para segundos
      }
      return sum;
    }, 0);

    const avgExecutionTime = totalDuration / jobs.length;
    const successRate = (successful.length / jobs.length) * 100;
    const failureRate = (faulted.length / jobs.length) * 100;

    // Calcular jobs por hora (baseado no período dos filtros ou últimos 7 dias)
    const timeRange = filters.startDate && filters.endDate
      ? (new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) / (1000 * 60 * 60)
      : 24 * 7; // 7 dias padrão
    const jobsPerHour = jobs.length / Math.max(timeRange, 1);

    // Eficiência: combinação de taxa de sucesso e velocidade
    const efficiency = (successRate * 0.7) + (Math.min(jobsPerHour / 10, 1) * 30);

    return {
      avgExecutionTime,
      totalExecutionTime: totalDuration,
      successRate,
      failureRate,
      jobsPerHour,
      efficiency: Math.min(efficiency, 100),
    };
  }, [data, filters]);

  if (isLoading) {
    return (
      <Card title="Métricas de Eficiência" className="animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card 
      title="Métricas de Eficiência"
      infoTooltip="Este painel apresenta métricas consolidadas de eficiência baseadas nos filtros aplicados: Tempo Médio de Execução (duração média dos jobs), Taxa de Sucesso (%), Throughput (jobs por hora), Taxa de Falhas (%), e Eficiência Geral (índice combinado de sucesso e velocidade). Essas métricas ajudam a avaliar a performance geral do RPA."
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Tempo Médio de Execução */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Tempo Médio
            </span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatDuration(metrics.avgExecutionTime)}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Por execução
          </p>
        </div>

        {/* Taxa de Sucesso */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Taxa de Sucesso
            </span>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {metrics.successRate.toFixed(1)}%
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {data?.value?.filter(j => j.State === 'Successful').length || 0} jobs bem-sucedidos
          </p>
        </div>

        {/* Jobs por Hora */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Throughput
            </span>
            <Zap className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {metrics.jobsPerHour.toFixed(1)}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
            Jobs por hora
          </p>
        </div>

        {/* Taxa de Falhas */}
        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900 dark:text-red-100">
              Taxa de Falhas
            </span>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {metrics.failureRate.toFixed(1)}%
          </p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            Requer atenção
          </p>
        </div>
      </div>

      {/* Indicador de Eficiência Geral */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Eficiência Geral
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {metrics.efficiency.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.efficiency >= 80
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : metrics.efficiency >= 60
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${metrics.efficiency}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Baseado em taxa de sucesso e throughput
        </p>
      </div>
    </Card>
  );
}

