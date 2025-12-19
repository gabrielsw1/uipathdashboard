import { useJobsStats, useSessionsStats, useCountStats } from '@/hooks/useStats';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { Activity, CheckCircle, XCircle, Clock, Bot, Folder, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MetricsCards() {
  const filters = useFilterStore((state) => state.getFilters());
  const hasFilters = !!(filters.folderId || filters.processKey || filters.releaseKey || filters.robotId || filters.startDate || filters.endDate);
  const { data: jobsStats, isLoading: jobsLoading } = useJobsStats(hasFilters ? filters : undefined, true);
  const { data: sessionsStats, isLoading: sessionsLoading } = useSessionsStats(hasFilters ? filters : undefined, true);
  const { data: countStats, isLoading: countLoading } = useCountStats(hasFilters ? filters : undefined, true);

  const successful = jobsStats?.find(s => s.title === 'Successful')?.count || 0;
  const faulted = jobsStats?.find(s => s.title === 'Faulted')?.count || 0;
  const canceled = jobsStats?.find(s => s.title === 'Canceled')?.count || 0;
  const running = jobsStats?.find(s => s.title === 'Running')?.count || 0;
  // Somar TODOS os estados retornados pelo backend (incluindo Pending, Stopping, Terminating, Resumed, etc.)
  const totalJobs = jobsStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;

  const available = sessionsStats?.find(s => s.title === 'Available')?.count || 0;
  const busy = sessionsStats?.find(s => s.title === 'Busy')?.count || 0;
  const disconnected = sessionsStats?.find(s => s.title === 'Disconnected')?.count || 0;
  const totalRobots = available + busy + disconnected;

  const processes = countStats?.find(s => s.title === 'Processes')?.count || 0;
  const folders = countStats?.find(s => s.title === 'Folders')?.count || 0;

  const successRate = totalJobs > 0 ? ((successful / totalJobs) * 100) : 0;
  const failureRate = totalJobs > 0 ? ((faulted / totalJobs) * 100) : 0;
  const utilizationRate = totalRobots > 0 ? ((busy / totalRobots) * 100) : 0;

  const isLoading = jobsLoading || sessionsLoading || countLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-28 bg-muted rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total de Jobs',
      value: totalJobs.toLocaleString('pt-BR'),
      icon: Activity,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-900 dark:text-blue-100',
      iconColor: 'text-blue-600 dark:text-blue-400',
      details: [
        { label: 'Sucesso', value: successful, color: 'text-green-600' },
        { label: 'Erro', value: faulted, color: 'text-red-600' },
        { label: 'Cancelado', value: canceled, color: 'text-yellow-600' },
        { label: 'Executando', value: running, color: 'text-blue-600' },
      ],
    },
    {
      title: 'Taxa de Sucesso',
      value: `${successRate.toFixed(1)}%`,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-900 dark:text-green-100',
      iconColor: 'text-green-600 dark:text-green-400',
      subtitle: `${successful} de ${totalJobs} jobs`,
      progress: successRate,
    },
    {
      title: 'Robots Ativos',
      value: totalRobots.toLocaleString('pt-BR'),
      icon: Bot,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-900 dark:text-purple-100',
      iconColor: 'text-purple-600 dark:text-purple-400',
      details: [
        { label: 'Disponível', value: available, color: 'text-green-600' },
        { label: 'Ocupado', value: busy, color: 'text-blue-600' },
        { label: 'Desconectado', value: disconnected, color: 'text-gray-600' },
      ],
      subtitle: `${utilizationRate.toFixed(0)}% em uso`,
    },
    {
      title: 'Processos',
      value: processes.toLocaleString('pt-BR'),
      icon: Folder,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      textColor: 'text-indigo-900 dark:text-indigo-100',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      subtitle: `${folders} pastas`,
    },
    {
      title: 'Taxa de Falhas',
      value: `${failureRate.toFixed(1)}%`,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-900 dark:text-red-100',
      iconColor: 'text-red-600 dark:text-red-400',
      subtitle: `${faulted} jobs com erro`,
      progress: failureRate,
      warning: failureRate > 10,
    },
    {
      title: 'Eficiência',
      value: `${(successRate - failureRate).toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      subtitle: 'Performance líquida',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card
            key={index}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 ${metric.borderColor} bg-gradient-to-br ${metric.bgGradient}`}
          >
            {/* Decorative gradient overlay */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-full -mr-16 -mt-16`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {metric.title}
                  </p>
                  <p className={`text-3xl font-bold ${metric.textColor} mb-1`}>
                    {metric.value}
                  </p>
                  {metric.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {metric.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50 ${metric.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {/* Progress bar for success/failure rates */}
              {metric.progress !== undefined && (
                <div className="mt-3">
                  <div className="w-full bg-white/50 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${metric.gradient} transition-all duration-500 ${
                        metric.warning ? 'animate-pulse' : ''
                      }`}
                      style={{ width: `${Math.min(metric.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Details for jobs and robots */}
              {metric.details && (
                <div className="mt-3 pt-3 border-t border-white/20 dark:border-slate-700/50">
                  <div className="flex flex-wrap gap-2">
                    {metric.details.map((detail, idx) => (
                      <span
                        key={idx}
                        className={`text-xs font-medium ${detail.color} bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded`}
                      >
                        {detail.label}: {detail.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
