import { useAllJobs } from '@/hooks/useAllJobs';
import { useFilterStore } from '@/store/filterStore';
import { useProcesses } from '@/hooks/useProcesses';
import { Card } from '../ui/Card';
import { useMemo } from 'react';
import { getTopProcessesByVolume, calculateAverageExecutionTime, calculateSuccessRate } from '@/utils/calculations';
import { formatDuration } from '@/utils/dateUtils';
import { Clock, Target, TrendingUp, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProcessPerformance() {
  const filters = useFilterStore((state) => state.getFilters());
  // Habilitar sempre, mesmo sem pasta selecionada (mostra dados de todas as pastas)
  const { data, isLoading } = useAllJobs(filters, { $expand: 'Release,Robot,Machine' }, filters.folderId, true);
  
  // Para processos, tentar buscar mesmo sem folderId (pode retornar processos compartilhados)
  // Mas se houver folderId, usar ele para filtrar
  const { data: processesData } = useProcesses(
    filters.folderId ? { folderId: filters.folderId } as any : undefined,
    undefined,
    true // Sempre habilitado
  );
  
  const processMap = useMemo(() => {
    const map = new Map<string, string>();
    processesData?.value?.forEach(process => {
      map.set(process.Key, process.Title || process.Name || '');
    });
    return map;
  }, [processesData]);

  const processData = useMemo(() => {
    if (!data?.value || data.value.length === 0) return [];

    // Garantir que estamos usando apenas jobs que respeitam os filtros
    // O hook useJobs já filtra, mas vamos garantir que não há jobs sem ProcessKey válido
    const validJobs = data.value.filter(job => {
      const processKey = job.Release?.ProcessKey || job.ProcessKey;
      return processKey && processKey !== 'Unknown' && processKey.trim() !== '';
    });

    if (validJobs.length === 0) return [];

    const topProcesses = getTopProcessesByVolume(validJobs, 10, processMap);
    
    return topProcesses
      .filter(process => process.name !== 'Unknown' && process.name && process.name.trim() !== '')
      .map((process) => {
        const processJobs = validJobs.filter(
          job => {
            const jobProcessKey = job.Release?.ProcessKey || job.ProcessKey;
            return jobProcessKey === process.processKey;
          }
        );
        
        if (processJobs.length === 0) return null;
        
        const avgTime = calculateAverageExecutionTime(processJobs);
        const successRate = calculateSuccessRate(processJobs);
        const successful = processJobs.filter(j => j.State === 'Successful').length;
        const faulted = processJobs.filter(j => j.State === 'Faulted').length;
        
        return {
          name: process.name,
          processKey: process.processKey,
          avgTime,
          successRate,
          totalJobs: process.count,
          successful,
          faulted,
          canceled: processJobs.filter(j => j.State === 'Canceled').length,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.totalJobs - a.totalJobs);
  }, [data, processMap]);

  const avgSuccessRate = useMemo(() => {
    if (processData.length === 0) return 0;
    const sum = processData.reduce((acc, item) => acc + item.successRate, 0);
    return (sum / processData.length).toFixed(1);
  }, [processData]);

  const avgExecutionTime = useMemo(() => {
    if (processData.length === 0) return 0;
    const sum = processData.reduce((acc, item) => acc + item.avgTime, 0);
    return formatDuration(sum / processData.length);
  }, [processData]);

  if (isLoading) {
    return (
      <Card title="Performance de Processos" className="animate-pulse">
        <div className="h-80 bg-muted rounded-lg" />
      </Card>
    );
  }

  if (processData.length === 0) {
    return (
      <Card title="Performance de Processos (Top 10)" className="h-full">
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum dado disponível para o período selecionado</p>
          </div>
        </div>
      </Card>
    );
  }

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle2 className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Card 
      title="Performance de Processos (Top 10)" 
      className="h-full flex flex-col"
      infoTooltip="Este painel mostra os 10 processos com maior volume de execução, baseado nos filtros aplicados. Para cada processo são exibidas: Taxa de Sucesso (%), Tempo Médio de Execução, e distribuição de status (Successful, Faulted, Canceled). Útil para identificar processos que precisam de otimização ou atenção."
    >
      {/* Resumo no topo */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Taxa Média</span>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{avgSuccessRate}%</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Tempo Médio</span>
          </div>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{avgExecutionTime}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100">Processos</span>
          </div>
          <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{processData.length}</p>
        </div>
      </div>

      {/* Grid de cards de processos */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 min-h-0">
        {processData.map((process, index) => (
          <div
            key={process.processKey}
            className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Header do card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight line-clamp-2">
                    {process.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground ml-10">
                  {process.totalJobs} {process.totalJobs === 1 ? 'job' : 'jobs'}
                </p>
              </div>
            </div>

            {/* Métricas principais */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Taxa de Sucesso */}
              <div className={`p-3 rounded-lg ${getStatusColor(process.successRate)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Taxa de Sucesso</span>
                  {getStatusIcon(process.successRate)}
                </div>
                <p className="text-xl font-bold">{process.successRate.toFixed(1)}%</p>
                <div className="mt-2 w-full bg-white/50 dark:bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      process.successRate >= 90
                        ? 'bg-green-600'
                        : process.successRate >= 70
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(process.successRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Tempo Médio */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Tempo Médio</span>
                </div>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatDuration(process.avgTime)}
                </p>
              </div>
            </div>

            {/* Breakdown de status */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 flex-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {process.successful} sucesso
                </span>
              </div>
              {process.faulted > 0 && (
                <div className="flex items-center gap-1.5 flex-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {process.faulted} erro
                  </span>
                </div>
              )}
              {process.canceled > 0 && (
                <div className="flex items-center gap-1.5 flex-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {process.canceled} cancelado
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
